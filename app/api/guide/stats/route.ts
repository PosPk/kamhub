import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { requireRole } from '@/lib/auth/middleware';

/**
 * GET /api/guide/stats
 * Получить статистику для гида
 * 
 * Возвращает:
 * - Заработок за текущий месяц
 * - Заработок за прошлый месяц
 * - Заработок за текущий год
 * - Количество проведенных туров
 * - Средний заработок за тур
 * - Дата следующей выплаты
 * - Предстоящие туры (7 дней)
 * - Рейтинг
 */
export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const userOrResponse = await requireRole(request, ['guide']);
    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const guideId = userOrResponse.userId;
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // 1. Заработок за текущий месяц
    const thisMonthResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM guide_earnings
       WHERE guide_id = $1 
       AND EXTRACT(YEAR FROM created_at) = $2
       AND EXTRACT(MONTH FROM created_at) = $3
       AND payment_status != 'cancelled'`,
      [guideId, currentYear, currentMonth]
    );
    const thisMonthEarnings = parseFloat(thisMonthResult.rows[0]?.total || '0');

    // 2. Заработок за прошлый месяц
    const lastMonthResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM guide_earnings
       WHERE guide_id = $1
       AND EXTRACT(YEAR FROM created_at) = $2
       AND EXTRACT(MONTH FROM created_at) = $3
       AND payment_status != 'cancelled'`,
      [guideId, lastMonthYear, lastMonth]
    );
    const lastMonthEarnings = parseFloat(lastMonthResult.rows[0]?.total || '0');

    // 3. Заработок за текущий год
    const thisYearResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM guide_earnings
       WHERE guide_id = $1
       AND EXTRACT(YEAR FROM created_at) = $2
       AND payment_status != 'cancelled'`,
      [guideId, currentYear]
    );
    const thisYearEarnings = parseFloat(thisYearResult.rows[0]?.total || '0');

    // 4. Количество проведенных туров (всего)
    const toursCountResult = await query(
      `SELECT COUNT(*) as count
       FROM guide_schedule
       WHERE guide_id = $1
       AND status = 'completed'`,
      [guideId]
    );
    const totalTours = parseInt(toursCountResult.rows[0]?.count || '0');

    // 5. Средний заработок за тур
    const averagePerTour = totalTours > 0 
      ? Math.round(thisYearEarnings / totalTours) 
      : 0;

    // 6. Следующая выплата (первый день следующего месяца)
    const nextPayoutDate = new Date(
      currentYear, 
      currentMonth, 
      1
    );
    const nextPayout = nextPayoutDate.toISOString().split('T')[0];

    // 7. Предстоящие туры (следующие 7 дней)
    const upcomingToursResult = await query(
      `SELECT 
        gs.id,
        gs.tour_date,
        gs.start_time,
        gs.meeting_point,
        gs.participants_count,
        gs.max_participants,
        gs.status,
        t.name as tour_name,
        t.difficulty,
        t.duration
       FROM guide_schedule gs
       JOIN tours t ON gs.tour_id = t.id
       WHERE gs.guide_id = $1
       AND gs.tour_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
       AND gs.status IN ('scheduled', 'in_progress')
       ORDER BY gs.tour_date, gs.start_time
       LIMIT 10`,
      [guideId]
    );

    const upcomingTours = upcomingToursResult.rows.map(row => ({
      id: row.id,
      date: row.tour_date,
      time: row.start_time,
      tourName: row.tour_name,
      difficulty: row.difficulty,
      duration: row.duration,
      participants: row.participants_count,
      maxParticipants: row.max_participants,
      meetingPoint: row.meeting_point,
      status: row.status
    }));

    // 8. Рейтинг гида (через отзывы туров)
    const ratingResult = await query(
      `SELECT 
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
       FROM reviews r
       JOIN tours t ON r.tour_id = t.id
       JOIN guide_schedule gs ON gs.tour_id = t.id
       WHERE gs.guide_id = $1
       AND r.is_verified = true`,
      [guideId]
    );

    const averageRating = parseFloat(ratingResult.rows[0]?.average_rating || '0');
    const reviewCount = parseInt(ratingResult.rows[0]?.review_count || '0');

    // 9. Статистика за месяц
    const monthlyStatsResult = await query(
      `SELECT 
        COUNT(*) as tours_count,
        SUM(participants_count) as total_participants
       FROM guide_schedule
       WHERE guide_id = $1
       AND EXTRACT(YEAR FROM tour_date) = $2
       AND EXTRACT(MONTH FROM tour_date) = $3
       AND status = 'completed'`,
      [guideId, currentYear, currentMonth]
    );

    const monthlyTours = parseInt(monthlyStatsResult.rows[0]?.tours_count || '0');
    const monthlyParticipants = parseInt(monthlyStatsResult.rows[0]?.total_participants || '0');

    // 10. Невыплаченные средства
    const pendingPaymentsResult = await query(
      `SELECT COALESCE(SUM(amount), 0) as total
       FROM guide_earnings
       WHERE guide_id = $1
       AND payment_status = 'pending'`,
      [guideId]
    );
    const pendingPayments = parseFloat(pendingPaymentsResult.rows[0]?.total || '0');

    return NextResponse.json({
      success: true,
      data: {
        // Доходы
        earnings: {
          thisMonth: thisMonthEarnings,
          lastMonth: lastMonthEarnings,
          thisYear: thisYearEarnings,
          pending: pendingPayments,
          nextPayout: nextPayout
        },
        // Туры
        tours: {
          total: totalTours,
          thisMonth: monthlyTours,
          averagePerTour: averagePerTour,
          upcoming: upcomingTours
        },
        // Участники
        participants: {
          thisMonth: monthlyParticipants
        },
        // Рейтинг
        rating: {
          average: parseFloat(averageRating.toFixed(2)),
          count: reviewCount
        },
        // Статистика
        stats: {
          toursCompleted: totalTours,
          toursThisMonth: monthlyTours,
          averageEarningsPerTour: averagePerTour,
          participantsThisMonth: monthlyParticipants
        }
      }
    });

  } catch (error) {
    console.error('Error fetching guide stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Ошибка при загрузке статистики гида' 
      },
      { status: 500 }
    );
  }
}
