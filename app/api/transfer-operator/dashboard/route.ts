import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { ApiResponse, TransferOperatorDashboardData } from '@/types';
import { requireTransferOperator } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/transfer-operator/dashboard - Dashboard данные для транспортного оператора
 * Получает метрики, недавние трансферы, доступные ТС и водители
 */
export async function GET(request: NextRequest) {
  try {
    const userOrResponse = await requireTransferOperator(request);
    if (userOrResponse instanceof NextResponse) return userOrResponse;
    
    const operatorId = userOrResponse.userId;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // дни

    // Метрики оператора
    const metricsQuery = `
      SELECT
        COUNT(DISTINCT v.id) as total_vehicles,
        COUNT(DISTINCT CASE WHEN v.status = 'active' THEN v.id END) as active_vehicles,
        COUNT(DISTINCT d.id) as total_drivers,
        COUNT(DISTINCT CASE WHEN d.status = 'active' THEN d.id END) as active_drivers,
        COUNT(t.id) as total_transfers,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_transfers,
        COUNT(CASE WHEN t.status IN ('scheduled', 'in_progress') THEN 1 END) as pending_transfers,
        COUNT(CASE WHEN t.status = 'cancelled' THEN 1 END) as cancelled_transfers,
        COALESCE(SUM(t.price), 0) as total_revenue,
        COALESCE(AVG(t.price), 0) as avg_transfer_price,
        ROUND(
          CASE
            WHEN COUNT(DISTINCT v.id) > 0
            THEN (COUNT(CASE WHEN t.status IN ('scheduled', 'in_progress', 'completed') THEN 1 END) * 100.0 / COUNT(DISTINCT v.id))
            ELSE 0
          END, 1
        ) as occupancy_rate,
        COALESCE(AVG(t.rating), 0) as customer_satisfaction
      FROM transfer_operators op
      LEFT JOIN vehicles v ON op.id = v.operator_id
      LEFT JOIN drivers d ON op.id = d.operator_id
      LEFT JOIN transfers t ON op.id = t.operator_id AND t.created_at >= NOW() - INTERVAL '${period} days'
      WHERE op.id = $1
    `;

    const metricsResult = await query(metricsQuery, [operatorId]);
    const metrics = metricsResult.rows[0];

    // Недавние трансферы (последние 10)
    const recentTransfersQuery = `
      SELECT
        t.id,
        t.booking_id,
        t.client_name,
        t.client_phone,
        t.client_email,
        t.vehicle_id,
        v.name as vehicle_name,
        t.driver_id,
        CONCAT(d.first_name, ' ', d.last_name) as driver_name,
        t.pickup_location,
        t.dropoff_location,
        t.pickup_date_time,
        t.dropoff_date_time,
        t.passengers,
        t.luggage,
        t.price,
        t.status,
        t.payment_status,
        t.rating,
        t.created_at,
        t.updated_at
      FROM transfers t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE t.operator_id = $1
      ORDER BY t.created_at DESC
      LIMIT 10
    `;

    const recentTransfersResult = await query(recentTransfersQuery, [operatorId]);

    // Предстоящие трансферы (на ближайшие 7 дней)
    const upcomingTransfersQuery = `
      SELECT
        t.id,
        t.booking_id,
        t.client_name,
        t.client_phone,
        t.vehicle_id,
        v.name as vehicle_name,
        t.driver_id,
        CONCAT(d.first_name, ' ', d.last_name) as driver_name,
        t.pickup_location,
        t.dropoff_location,
        t.pickup_date_time,
        t.passengers,
        t.price,
        t.status
      FROM transfers t
      JOIN vehicles v ON t.vehicle_id = v.id
      JOIN drivers d ON t.driver_id = d.id
      WHERE t.operator_id = $1
        AND t.status IN ('scheduled', 'in_progress')
        AND t.pickup_date_time >= NOW()
        AND t.pickup_date_time <= NOW() + INTERVAL '7 days'
      ORDER BY t.pickup_date_time ASC
      LIMIT 10
    `;

    const upcomingTransfersResult = await query(upcomingTransfersQuery, [operatorId]);

    // Доступные ТС
    const availableVehiclesQuery = `
      SELECT
        id,
        name,
        type,
        license_plate,
        capacity,
        category,
        status,
        location
      FROM vehicles
      WHERE operator_id = $1 AND status = 'active'
      ORDER BY name
      LIMIT 20
    `;

    const availableVehiclesResult = await query(availableVehiclesQuery, [operatorId]);

    // Активные водители
    const activeDriversQuery = `
      SELECT
        id,
        first_name,
        last_name,
        phone,
        rating,
        total_trips,
        status
      FROM drivers
      WHERE operator_id = $1 AND status = 'active'
      ORDER BY rating DESC, total_trips DESC
      LIMIT 20
    `;

    const activeDriversResult = await query(activeDriversQuery, [operatorId]);

    // Ожидающие заявки
    const pendingRequestsQuery = `
      SELECT
        id,
        client_name,
        client_phone,
        client_email,
        pickup_location,
        dropoff_location,
        pickup_date_time,
        passengers,
        luggage,
        vehicle_type,
        estimated_price,
        status,
        created_at
      FROM transfer_requests
      WHERE operator_id = $1 AND status = 'pending'
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const pendingRequestsResult = await query(pendingRequestsQuery, [operatorId]);

    // График доходов за последние 30 дней
    const revenueChartQuery = `
      SELECT
        DATE(t.created_at) as date,
        COALESCE(SUM(t.price), 0) as revenue,
        COUNT(t.id) as trips
      FROM transfers t
      WHERE t.operator_id = $1
        AND t.status = 'completed'
        AND t.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(t.created_at)
      ORDER BY date DESC
    `;

    const revenueChartResult = await query(revenueChartQuery, [operatorId]);

    // Утилизация ТС
    const vehicleUtilizationQuery = `
      SELECT
        v.id as vehicle_id,
        v.name as vehicle_name,
        COUNT(t.id) as total_trips,
        COALESCE(SUM(t.price), 0) as revenue,
        ROUND(
          CASE
            WHEN COUNT(t.id) > 0
            THEN (COUNT(CASE WHEN t.status IN ('scheduled', 'in_progress', 'completed') THEN 1 END) * 100.0 / COUNT(t.id))
            ELSE 0
          END, 1
        ) as utilization_rate
      FROM vehicles v
      LEFT JOIN transfers t ON v.id = t.vehicle_id
        AND t.created_at >= NOW() - INTERVAL '${period} days'
      WHERE v.operator_id = $1
      GROUP BY v.id, v.name
      ORDER BY utilization_rate DESC
      LIMIT 10
    `;

    const vehicleUtilizationResult = await query(vehicleUtilizationQuery, [operatorId]);

    const dashboardData: TransferOperatorDashboardData = {
      metrics: {
        totalVehicles: parseInt(metrics.total_vehicles),
        activeVehicles: parseInt(metrics.active_vehicles),
        totalDrivers: parseInt(metrics.total_drivers),
        activeDrivers: parseInt(metrics.active_drivers),
        totalTransfers: parseInt(metrics.total_transfers),
        completedTransfers: parseInt(metrics.completed_transfers),
        pendingTransfers: parseInt(metrics.pending_transfers),
        cancelledTransfers: parseInt(metrics.cancelled_transfers),
        totalRevenue: parseFloat(metrics.total_revenue),
        monthlyRevenue: parseFloat(metrics.total_revenue), // TODO: рассчитать за месяц
        averageTransferPrice: parseFloat(metrics.avg_transfer_price),
        occupancyRate: parseFloat(metrics.occupancy_rate),
        customerSatisfaction: parseFloat(metrics.customer_satisfaction)
      },
      recentTransfers: recentTransfersResult.rows.map(row => ({
        id: row.id,
        bookingId: row.booking_id,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        clientEmail: row.client_email,
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        driverId: row.driver_id,
        driverName: row.driver_name,
        pickupLocation: row.pickup_location,
        dropoffLocation: row.dropoff_location,
        pickupDateTime: row.pickup_date_time,
        dropoffDateTime: row.dropoff_date_time,
        passengers: row.passengers,
        luggage: row.luggage,
        price: parseFloat(row.price),
        status: row.status,
        paymentStatus: row.payment_status,
        rating: row.rating ? parseFloat(row.rating) : undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      upcomingTransfers: upcomingTransfersResult.rows.map(row => ({
        id: row.id,
        bookingId: row.booking_id,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        driverId: row.driver_id,
        driverName: row.driver_name,
        pickupLocation: row.pickup_location,
        dropoffLocation: row.dropoff_location,
        pickupDateTime: row.pickup_date_time,
        passengers: row.passengers,
        price: parseFloat(row.price),
        status: row.status
      })),
      availableVehicles: availableVehiclesResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        type: row.type,
        licensePlate: row.license_plate,
        capacity: row.capacity,
        category: row.category,
        status: row.status,
        location: row.location,
        features: [], // TODO: загрузить
        images: [], // TODO: загрузить
        documents: [], // TODO: загрузить
        createdAt: new Date(), // TODO: из базы
        updatedAt: new Date() // TODO: из базы
      })),
      activeDrivers: activeDriversResult.rows.map(row => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        email: '', // TODO: из базы
        licenseNumber: '', // TODO: из базы
        licenseExpiry: new Date(), // TODO: из базы
        experience: 0, // TODO: из базы
        languages: [], // TODO: из базы
        rating: parseFloat(row.rating),
        totalTrips: parseInt(row.total_trips),
        status: row.status,
        documents: [], // TODO: загрузить
        emergencyContact: {
          name: '',
          phone: '',
          relation: ''
        }, // TODO: из базы
        createdAt: new Date(), // TODO: из базы
        updatedAt: new Date() // TODO: из базы
      })),
      pendingRequests: pendingRequestsResult.rows.map(row => ({
        id: row.id,
        clientName: row.client_name,
        clientPhone: row.client_phone,
        clientEmail: row.client_email,
        pickupLocation: row.pickup_location,
        dropoffLocation: row.dropoff_location,
        pickupDateTime: row.pickup_date_time,
        passengers: row.passengers,
        luggage: row.luggage,
        vehicleType: row.vehicle_type,
        status: row.status,
        estimatedPrice: parseFloat(row.estimated_price),
        createdAt: row.created_at,
        updatedAt: row.updated_at
      })),
      revenueChart: revenueChartResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        trips: parseInt(row.trips)
      })),
      vehicleUtilization: vehicleUtilizationResult.rows.map(row => ({
        vehicleId: row.vehicle_id,
        vehicleName: row.vehicle_name,
        utilizationRate: parseFloat(row.utilization_rate),
        totalTrips: parseInt(row.total_trips),
        revenue: parseFloat(row.revenue)
      }))
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    } as ApiResponse<TransferOperatorDashboardData>);

  } catch (error) {
    console.error('Error fetching transfer operator dashboard data:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка при получении данных dashboard'
    } as ApiResponse<null>, { status: 500 });
  }
}
