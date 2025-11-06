import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Booking } from '@/types';

// GET /api/bookings - Получение бронирований пользователя
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // TODO: Проверка авторизации
    // TODO: Реальный запрос к БД

    const mockBookings: Booking[] = [
      {
        id: '1',
        userId: userId || 'user-1',
        tourId: 'tour-1',
        tour: {
          id: 'tour-1',
          title: 'Восхождение на Авачинский вулкан',
          description: 'Незабываемое восхождение',
          activity: 'hiking',
          duration: '8 часов',
          difficulty: 'medium',
          priceFrom: 8500,
          priceTo: 8500,
          maxParticipants: 12,
          minParticipants: 4,
          images: [],
          rating: 4.8,
          reviewsCount: 45,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          operator: {
            id: 'op-1',
            name: 'Камчатка Туры',
            rating: 4.9,
            phone: '+7 (914) 123-45-67',
            email: 'info@kamchatka-tours.ru',
          },
        },
        date: new Date('2025-11-20'),
        participants: 2,
        totalPrice: 17000,
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01'),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockBookings,
    } as ApiResponse<Booking[]>);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении бронирований' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// POST /api/bookings - Создание нового бронирования
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tourId, date, participants, specialRequests } = body;

    // TODO: Валидация
    // TODO: Проверка доступности
    // TODO: Создание бронирования в БД
    // TODO: Блокировка мест
    // TODO: Уведомления

    return NextResponse.json({
      success: true,
      data: {
        id: 'new-booking-id',
        status: 'pending',
        paymentStatus: 'pending',
        ...body,
      },
      message: 'Бронирование создано. Ожидается оплата.',
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании бронирования' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}



