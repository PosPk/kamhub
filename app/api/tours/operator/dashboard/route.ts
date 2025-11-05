import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/tours/operator/dashboard
 * Дашборд оператора туров
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operatorId = searchParams.get('operatorId');
    
    if (!operatorId) {
      return NextResponse.json({
        success: false,
        error: 'Operator ID is required'
      }, { status: 400 });
    }

    // Параллельно получаем все данные
    const [
      statsResult,
      toursResult,
      schedulesResult,
      bookingsResult,
      revenueResult,
      upcomingResult
    ] = await Promise.all([
      // 1. Общая статистика
      query(`
        SELECT 
          COUNT(DISTINCT t.id) as total_tours,
          COUNT(DISTINCT ts.id) as total_schedules,
          COUNT(DISTINCT tb.id) as total_bookings,
          COUNT(DISTINCT tb.id) FILTER (WHERE tb.status = 'confirmed') as confirmed_bookings,
          COUNT(DISTINCT tb.id) FILTER (WHERE tb.status = 'pending') as pending_bookings,
          COUNT(DISTINCT tb.id) FILTER (WHERE tb.status = 'cancelled') as cancelled_bookings,
          COALESCE(SUM(tb.total_price) FILTER (WHERE tb.status IN ('confirmed', 'paid')), 0) as total_revenue,
          COALESCE(SUM(tb.total_price) FILTER (
            WHERE tb.status IN ('confirmed', 'paid') 
            AND tb.created_at >= NOW() - INTERVAL '30 days'
          ), 0) as monthly_revenue,
          COALESCE(SUM(tb.total_price) FILTER (
            WHERE tb.status IN ('confirmed', 'paid') 
            AND tb.created_at >= NOW() - INTERVAL '7 days'
          ), 0) as weekly_revenue,
          COALESCE(AVG(tb.total_price), 0) as avg_booking_value
        FROM partners p
        LEFT JOIN tours t ON t.operator_id = p.id
        LEFT JOIN tour_schedules ts ON ts.operator_id = p.id
        LEFT JOIN tour_bookings_v2 tb ON tb.operator_id = p.id
        WHERE p.id = $1
      `, [operatorId]),

      // 2. Список туров оператора
      query(`
        SELECT 
          t.id,
          t.name as title,
          t.description,
          t.difficulty,
          t.duration,
          t.price,
          t.rating,
          t.review_count,
          t.is_active,
          COUNT(DISTINCT ts.id) as schedules_count,
          COUNT(DISTINCT tb.id) as bookings_count,
          COALESCE(SUM(tb.total_price) FILTER (WHERE tb.status IN ('confirmed', 'paid')), 0) as revenue
        FROM tours t
        LEFT JOIN tour_schedules ts ON ts.tour_id = t.id
        LEFT JOIN tour_bookings_v2 tb ON tb.tour_id = t.id AND tb.status IN ('confirmed', 'paid')
        WHERE t.operator_id = $1
        GROUP BY t.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `, [operatorId]),

      // 3. Ближайшие расписания
      query(`
        SELECT 
          ts.id,
          ts.start_date,
          ts.departure_time,
          ts.return_time,
          ts.max_participants,
          ts.available_slots,
          ts.base_price,
          ts.status,
          ts.meeting_point,
          t.id as tour_id,
          t.name as tour_title,
          COUNT(tb.id) as bookings_count,
          SUM(tb.participants_count) as total_participants
        FROM tour_schedules ts
        JOIN tours t ON ts.tour_id = t.id
        LEFT JOIN tour_bookings_v2 tb ON tb.schedule_id = ts.id 
          AND tb.status NOT IN ('cancelled', 'refunded')
        WHERE ts.operator_id = $1 
          AND ts.start_date >= CURRENT_DATE
          AND ts.status IN ('scheduled', 'confirmed')
        GROUP BY ts.id, t.id
        ORDER BY ts.start_date, ts.departure_time
        LIMIT 20
      `, [operatorId]),

      // 4. Активные бронирования
      query(`
        SELECT 
          tb.id,
          tb.booking_number,
          tb.booking_date,
          tb.tour_start_date,
          tb.participants_count,
          tb.adults_count,
          tb.children_count,
          tb.total_price,
          tb.status,
          tb.payment_status,
          tb.contact_name,
          tb.contact_phone,
          tb.contact_email,
          tb.confirmation_code,
          t.name as tour_title,
          ts.departure_time,
          ts.meeting_point
        FROM tour_bookings_v2 tb
        JOIN tours t ON tb.tour_id = t.id
        JOIN tour_schedules ts ON tb.schedule_id = ts.id
        WHERE tb.operator_id = $1
          AND tb.status IN ('pending', 'confirmed', 'paid')
          AND tb.tour_start_date >= CURRENT_DATE
        ORDER BY tb.tour_start_date, ts.departure_time
        LIMIT 50
      `, [operatorId]),

      // 5. Revenue по дням (последние 30 дней)
      query(`
        SELECT 
          DATE(tb.created_at) as date,
          COUNT(tb.id) as bookings,
          SUM(tb.total_price) as revenue,
          SUM(tb.participants_count) as participants
        FROM tour_bookings_v2 tb
        WHERE tb.operator_id = $1
          AND tb.status IN ('confirmed', 'paid')
          AND tb.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(tb.created_at)
        ORDER BY date
      `, [operatorId]),

      // 6. Предстоящие туры (сегодня и завтра)
      query(`
        SELECT 
          ts.id as schedule_id,
          ts.start_date,
          ts.departure_time,
          ts.meeting_point,
          ts.max_participants,
          ts.available_slots,
          t.id as tour_id,
          t.name as tour_title,
          t.duration,
          COUNT(tb.id) as bookings_count,
          SUM(tb.participants_count) as total_participants,
          json_agg(
            json_build_object(
              'booking_id', tb.id,
              'booking_number', tb.booking_number,
              'contact_name', tb.contact_name,
              'contact_phone', tb.contact_phone,
              'participants_count', tb.participants_count,
              'status', tb.status,
              'check_in_status', tb.check_in_status
            ) ORDER BY tb.created_at
          ) FILTER (WHERE tb.id IS NOT NULL) as bookings
        FROM tour_schedules ts
        JOIN tours t ON ts.tour_id = t.id
        LEFT JOIN tour_bookings_v2 tb ON tb.schedule_id = ts.id 
          AND tb.status NOT IN ('cancelled', 'refunded')
        WHERE ts.operator_id = $1
          AND ts.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
          AND ts.status IN ('scheduled', 'confirmed')
        GROUP BY ts.id, t.id
        ORDER BY ts.start_date, ts.departure_time
      `, [operatorId])
    ]);

    const stats = statsResult.rows[0];
    const tours = toursResult.rows;
    const schedules = schedulesResult.rows;
    const bookings = bookingsResult.rows;
    const revenueByDay = revenueResult.rows;
    const upcoming = upcomingResult.rows;

    // Рассчитываем дополнительные метрики
    const bookedSlots = schedules.reduce((sum, s) => 
      sum + (s.max_participants - s.available_slots), 0
    );
    const totalSlots = schedules.reduce((sum, s) => sum + s.max_participants, 0);
    const occupancyRate = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

    // Статистика по статусам
    const statusStats = {
      pending: parseInt(stats.pending_bookings) || 0,
      confirmed: parseInt(stats.confirmed_bookings) || 0,
      cancelled: parseInt(stats.cancelled_bookings) || 0
    };

    // Форматируем ответ
    const dashboard = {
      // Основная статистика
      stats: {
        totalTours: parseInt(stats.total_tours) || 0,
        totalSchedules: parseInt(stats.total_schedules) || 0,
        totalBookings: parseInt(stats.total_bookings) || 0,
        confirmedBookings: parseInt(stats.confirmed_bookings) || 0,
        pendingBookings: parseInt(stats.pending_bookings) || 0,
        cancelledBookings: parseInt(stats.cancelled_bookings) || 0,
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        monthlyRevenue: parseFloat(stats.monthly_revenue) || 0,
        weeklyRevenue: parseFloat(stats.weekly_revenue) || 0,
        avgBookingValue: parseFloat(stats.avg_booking_value) || 0,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        statusStats
      },

      // Туры
      tours: tours.map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        difficulty: t.difficulty,
        duration: t.duration,
        price: parseFloat(t.price),
        rating: parseFloat(t.rating),
        reviewCount: parseInt(t.review_count) || 0,
        isActive: t.is_active,
        schedulesCount: parseInt(t.schedules_count) || 0,
        bookingsCount: parseInt(t.bookings_count) || 0,
        revenue: parseFloat(t.revenue) || 0
      })),

      // Расписания
      schedules: schedules.map(s => ({
        id: s.id,
        startDate: s.start_date,
        departureTime: s.departure_time,
        returnTime: s.return_time,
        maxParticipants: s.max_participants,
        availableSlots: s.available_slots,
        bookedSlots: s.max_participants - s.available_slots,
        basePrice: parseFloat(s.base_price),
        status: s.status,
        meetingPoint: s.meeting_point,
        tourId: s.tour_id,
        tourTitle: s.tour_title,
        bookingsCount: parseInt(s.bookings_count) || 0,
        totalParticipants: parseInt(s.total_participants) || 0
      })),

      // Активные бронирования
      activeBookings: bookings.map(b => ({
        id: b.id,
        bookingNumber: b.booking_number,
        bookingDate: b.booking_date,
        tourStartDate: b.tour_start_date,
        participantsCount: b.participants_count,
        adultsCount: b.adults_count,
        childrenCount: b.children_count,
        totalPrice: parseFloat(b.total_price),
        status: b.status,
        paymentStatus: b.payment_status,
        contactName: b.contact_name,
        contactPhone: b.contact_phone,
        contactEmail: b.contact_email,
        confirmationCode: b.confirmation_code,
        tourTitle: b.tour_title,
        departureTime: b.departure_time,
        meetingPoint: b.meeting_point
      })),

      // Revenue график
      revenueChart: revenueByDay.map(r => ({
        date: r.date,
        bookings: parseInt(r.bookings) || 0,
        revenue: parseFloat(r.revenue) || 0,
        participants: parseInt(r.participants) || 0
      })),

      // Предстоящие туры (сегодня/завтра)
      upcomingTours: upcoming.map(u => ({
        scheduleId: u.schedule_id,
        startDate: u.start_date,
        departureTime: u.departure_time,
        meetingPoint: u.meeting_point,
        maxParticipants: u.max_participants,
        availableSlots: u.available_slots,
        tourId: u.tour_id,
        tourTitle: u.tour_title,
        duration: u.duration,
        bookingsCount: parseInt(u.bookings_count) || 0,
        totalParticipants: parseInt(u.total_participants) || 0,
        bookings: u.bookings || []
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboard
    });

  } catch (error: any) {
    console.error('Dashboard error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load dashboard',
      details: error.message
    }, { status: 500 });
  }
}
