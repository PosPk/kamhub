import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
import { query } from '@/pillars/core-infrastructure/lib/database';
import { emailService } from '@/lib/notifications/email-service';

// POST /api/bookings/[id]/cancel - Отмена бронирования
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = params.id;
    const body = await request.json();
    const { reason = 'Отменено пользователем' } = body;

    // Получаем детали бронирования
    const bookingQuery = `
      SELECT
        b.*,
        t.name as tour_name,
        t.price as tour_price,
        p.name as operator_name,
        p.email as operator_email,
        -- TODO: Добавить user.email из users таблицы
        'user@example.com' as user_email,
        'Иван Иванов' as user_name
      FROM bookings b
      JOIN tours t ON b.tour_id = t.id
      JOIN partners p ON t.operator_id = p.id
      WHERE b.id = $1
    `;

    const bookingResult = await query(bookingQuery, [bookingId]);

    if (bookingResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Бронирование не найдено' } as ApiResponse<null>,
        { status: 404 }
      );
    }

    const booking = bookingResult.rows[0];

    // Проверяем, можно ли отменить
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Бронирование уже отменено' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    if (booking.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Нельзя отменить завершенное бронирование' } as ApiResponse<null>,
        { status: 400 }
      );
    }

    // Рассчитываем возврат средств (85% если за 7+ дней до тура, 50% если за 3-7 дней, 0% если менее 3 дней)
    const tourDate = new Date(booking.start_date);
    const today = new Date();
    const daysDiff = Math.ceil((tourDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    if (daysDiff >= 7) {
      refundPercentage = 0.85; // 85%
    } else if (daysDiff >= 3) {
      refundPercentage = 0.5;  // 50%
    } else {
      refundPercentage = 0;    // 0%
    }

    const refundAmount = Math.floor(booking.total_price * refundPercentage);

    // Обновляем статус бронирования
    await query(
      `UPDATE bookings
       SET status = 'cancelled',
           cancelled_at = NOW(),
           cancellation_reason = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [bookingId, reason]
    );

    // TODO: Инициировать возврат средств через платежную систему
    // TODO: Отправить уведомление оператору

    // Отправляем email уведомление об отмене
    try {
      await emailService.sendEmail({
        to: booking.user_email,
        subject: `Бронирование отменено: ${booking.tour_name}`,
        html: `
          <h2>Ваше бронирование отменено</h2>

          <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
            <h3 style="color: #d32f2f; margin-top: 0;">❌ ${booking.tour_name}</h3>
            <p><strong>📅 Дата тура:</strong> ${booking.start_date}</p>
            <p><strong>👥 Участников:</strong> ${booking.guests_count}</p>
            <p><strong>💰 Стоимость тура:</strong> ${booking.total_price.toLocaleString('ru-RU')} ₽</p>
            <p><strong>🔙 Сумма возврата:</strong> ${refundAmount.toLocaleString('ru-RU')} ₽ (${(refundPercentage * 100).toFixed(0)}%)</p>
          </div>

          <p><strong>Причина отмены:</strong> ${reason}</p>

          ${refundAmount > 0 ?
            `<div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>✅ Возврат средств</strong></p>
              <p>Сумма ${refundAmount.toLocaleString('ru-RU')} ₽ будет возвращена на вашу карту в течение 5-7 рабочих дней.</p>
              <p>Процесс возврата может занять до 14 дней в зависимости от банка.</p>
            </div>` :
            `<div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>⚠️ Возврат не предусмотрен</strong></p>
              <p>Согласно правилам отмены, возврат средств не производится при отмене менее чем за 3 дня до тура.</p>
            </div>`
          }

          <p>Если у вас есть вопросы, свяжитесь с нами:</p>
          <p><strong>📧 Email:</strong> support@kamhub.ru</p>
          <p><strong>📞 Телефон:</strong> +7 (914) 123-45-67</p>

          <p><em>Спасибо за понимание. Ждем вас на других турах KamHub!</em></p>
        `
      });
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Не прерываем выполнение при ошибке email
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        status: 'cancelled',
        refundAmount,
        refundPercentage,
        refundStatus: refundAmount > 0 ? 'pending' : 'none',
      },
      message: refundAmount > 0
        ? 'Бронирование отменено. Возврат средств будет произведен в течение 5-7 рабочих дней.'
        : 'Бронирование отменено. Возврат средств не предусмотрен.',
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при отмене бронирования' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}


