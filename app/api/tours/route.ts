import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Tour, ApiResponse, PaginatedResponse } from '@/types';

export const dynamic = 'force-dynamic';

// GET /api/tours - Получение списка туров
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const season = searchParams.get('season');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Строим WHERE условия
    const whereConditions: string[] = ['t.is_active = true'];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereConditions.push(`t.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (difficulty) {
      whereConditions.push(`t.difficulty = $${paramIndex}`);
      queryParams.push(difficulty);
      paramIndex++;
    }

    if (season) {
      whereConditions.push(`t.season @> $${paramIndex}`);
      queryParams.push(`["${season}"]`);
      paramIndex++;
    }

    if (minPrice) {
      whereConditions.push(`t.price >= $${paramIndex}`);
      queryParams.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      whereConditions.push(`t.price <= $${paramIndex}`);
      queryParams.push(parseFloat(maxPrice));
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(t.name ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Подсчитываем общее количество
    const countQuery = `
      SELECT COUNT(*) as total
      FROM tours t
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Получаем туры с пагинацией
    const offset = (page - 1) * limit;
    const toursQuery = `
      SELECT 
        t.id,
        t.name,
        t.description,
        t.short_description,
        t.difficulty,
        t.duration,
        t.price,
        t.currency,
        t.season,
        t.coordinates,
        t.requirements,
        t.included,
        t.not_included,
        t.rating,
        t.review_count,
        t.max_group_size,
        t.min_group_size,
        t.created_at,
        t.updated_at,
        o.id as operator_id,
        o.name as operator_name,
        o.category as operator_category,
        o.rating as operator_rating,
        g.id as guide_id,
        g.name as guide_name,
        g.rating as guide_rating,
        array_agg(DISTINCT a.url) as images
      FROM tours t
      LEFT JOIN partners o ON t.operator_id = o.id
      LEFT JOIN partners g ON t.guide_id = g.id
      LEFT JOIN tour_assets ta ON t.id = ta.tour_id
      LEFT JOIN assets a ON ta.asset_id = a.id
      ${whereClause}
      GROUP BY t.id, o.id, g.id
      ORDER BY t.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const toursResult = await query(toursQuery, queryParams);

    const tours: Tour[] = toursResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      shortDescription: row.short_description,
      difficulty: row.difficulty,
      duration: row.duration,
      price: row.price,
      currency: row.currency,
      season: row.season,
      coordinates: row.coordinates,
      requirements: row.requirements,
      included: row.included,
      notIncluded: row.not_included,
      operator: {
        id: row.operator_id,
        name: row.operator_name,
        category: row.operator_category,
        description: '',
        contact: { phone: '', email: '' },
        rating: row.operator_rating,
        reviewCount: 0,
        isVerified: false,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      guide: row.guide_id ? {
        id: row.guide_id,
        name: row.guide_name,
        category: 'guide',
        description: '',
        contact: { phone: '', email: '' },
        rating: row.guide_rating,
        reviewCount: 0,
        isVerified: false,
        images: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } : undefined,
      images: row.images.filter(Boolean).map((url: string) => ({ 
        id: 'temp-id', 
        url, 
        mimeType: 'image/jpeg', 
        sha256: '', 
        size: 0, 
        createdAt: new Date() 
      })),
      rating: row.rating,
      reviewCount: row.review_count,
      maxGroupSize: row.max_group_size,
      minGroupSize: row.min_group_size,
      isActive: true,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    const response: PaginatedResponse<Tour> = {
      data: tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json({
      success: true,
      data: response,
    } as ApiResponse<PaginatedResponse<Tour>>);

  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tours',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<null>, { status: 500 });
  }
}

// POST /api/tours - Создание нового тура
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Валидация обязательных полей
    const requiredFields = ['name', 'description', 'difficulty', 'duration', 'price', 'operatorId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`,
        } as ApiResponse<null>, { status: 400 });
      }
    }

    // Создаем тур
    const createTourQuery = `
      INSERT INTO tours (
        name, description, short_description, difficulty, duration, price, currency,
        season, coordinates, requirements, included, not_included,
        operator_id, guide_id, max_group_size, min_group_size
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING id, created_at
    `;

    const tourParams = [
      body.name,
      body.description,
      body.shortDescription || body.description.substring(0, 200),
      body.difficulty,
      body.duration,
      body.price,
      body.currency || 'RUB',
      JSON.stringify(body.season || []),
      JSON.stringify(body.coordinates || []),
      JSON.stringify(body.requirements || []),
      JSON.stringify(body.included || []),
      JSON.stringify(body.notIncluded || []),
      body.operatorId,
      body.guideId || null,
      body.maxGroupSize || 20,
      body.minGroupSize || 1,
    ];

    const result = await query(createTourQuery, tourParams);
    const tourId = result.rows[0].id;

    // Если есть изображения, связываем их с туром
    if (body.images && body.images.length > 0) {
      for (const imageUrl of body.images) {
        await query(
          'INSERT INTO tour_assets (tour_id, asset_id) VALUES ($1, (SELECT id FROM assets WHERE url = $2))',
          [tourId, imageUrl]
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { id: tourId, createdAt: result.rows[0].created_at },
      message: 'Tour created successfully',
    } as ApiResponse<{ id: string; createdAt: Date }>);

  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create tour',
      message: error instanceof Error ? error.message : 'Unknown error',
    } as ApiResponse<null>, { status: 500 });
  }
}