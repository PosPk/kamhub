import { NextRequest, NextResponse } from 'next/server';
import { createTourBookingWithLock, TourBookingRequest } from '@/lib/tours/booking';
import { loyaltySystem } from '@/lib/loyalty/loyalty-system';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =====================================================
// ВАЛИДАЦИЯ С ZOD
// =====================================================

const ContactInfoSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/),
  email: z.string().email()
});

const EmergencyContactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/),
  relation: z.string().min(2)
}).optional();

const ParticipantSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  passportNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  medicalInfo: z.object({
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    medications: z.string().optional()
  }).optional()
});

const TourBookingRequestSchema = z.object({
  scheduleId: z.string().uuid(),
  userId: z.string().uuid(),
  participantsCount: z.number().int().min(1).max(50),
  adultsCount: z.number().int().min(0).optional(),
  childrenCount: z.number().int().min(0).optional(),
  contactInfo: ContactInfoSchema,
  participantsDetails: z.array(ParticipantSchema).optional(),
  specialRequests: z.string().max(1000).optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  medicalConditions: z.array(z.string()).optional(),
  emergencyContact: EmergencyContactSchema,
  source: z.enum(['web', 'mobile', 'agent', 'phone']).optional()
});

// =====================================================
// POST /api/tours/book - Бронирование тура
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Валидация входных данных
    let validatedData: TourBookingRequest;
    try {
      validatedData = TourBookingRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Validation error',
      details: error.issues
    }, { status: 400 });
      }
      throw error;
    }
    
    // 2. Проверка аутентификации (опционально - можно добавить JWT проверку)
    // const token = request.headers.get('Authorization');
    // if (!token) {
    //   return NextResponse.json({
    //     success: false,
    //     error: 'Unauthorized'
    //   }, { status: 401 });
    // }
    
    // 3. Создание бронирования с защитой от race conditions
    const bookingResult = await createTourBookingWithLock(validatedData);
    
    if (!bookingResult.success) {
      return NextResponse.json(bookingResult, { 
        status: bookingResult.errorCode === 'LOCK_TIMEOUT' ? 409 : 400 
      });
    }
    
    // 4. Начисление бонусных баллов (асинхронно)
    if (bookingResult.booking) {
      try {
        await loyaltySystem.earnPoints(
          validatedData.userId,
          bookingResult.booking.id,
          bookingResult.booking.totalPrice
        );
      } catch (error) {
        console.error('Error earning loyalty points:', error);
        // Не прерываем процесс, если начисление баллов не удалось
      }
    }
    
    // 5. Отправка уведомлений (асинхронно)
    if (bookingResult.booking) {
      // Асинхронно отправляем уведомления без ожидания
      sendBookingNotifications(
        bookingResult.booking,
        validatedData.contactInfo
      ).catch(error => {
        console.error('Error sending notifications:', error);
      });
    }
    
    // 6. Возвращаем результат
    return NextResponse.json(bookingResult, { status: 201 });
    
  } catch (error) {
    console.error('Error in POST /api/tours/book:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// =====================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// =====================================================

/**
 * Отправка уведомлений о бронировании
 */
async function sendBookingNotifications(
  booking: any,
  contactInfo: { name: string; phone: string; email: string }
) {
  try {
    // TODO: Реализовать отправку уведомлений
    // 1. Email пользователю с деталями бронирования
    // 2. SMS с кодом подтверждения
    // 3. Telegram уведомление оператору
    // 4. Push notification в мобильное приложение
    
    console.log('Sending booking notifications:', {
      bookingNumber: booking.bookingNumber,
      email: contactInfo.email,
      phone: contactInfo.phone
    });
    
    // Пример отправки email (нужно реализовать)
    // await sendEmail({
    //   to: contactInfo.email,
    //   subject: `Бронирование ${booking.bookingNumber} подтверждено`,
    //   template: 'booking-confirmation',
    //   data: {
    //     name: contactInfo.name,
    //     bookingNumber: booking.bookingNumber,
    //     confirmationCode: booking.confirmationCode,
    //     tourTitle: booking.scheduleInfo.tourTitle,
    //     startDate: booking.scheduleInfo.startDate,
    //     totalPrice: booking.totalPrice
    //   }
    // });
    
  } catch (error) {
    console.error('Error sending booking notifications:', error);
    throw error;
  }
}

/**
 * Генерация QR кода (можно использовать библиотеку qrcode)
 */
function generateQRCodeData(confirmationCode: string, bookingNumber: string): string {
  return JSON.stringify({
    type: 'tour_booking',
    confirmationCode,
    bookingNumber,
    timestamp: Date.now()
  });
}
