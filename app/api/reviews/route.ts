import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Review } from '@/types';

// GET /api/reviews - Получение отзывов (для тура, оператора и т.д.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const operatorId = searchParams.get('operatorId');

    // TODO: Реальный запрос к БД
    const mockReviews: Review[] = [
      {
        id: '1',
        userId: 'user-1',
        tourId: tourId || 'tour-1',
        rating: 5,
        comment: 'Потрясающий тур! Гид был очень профессиональным, виды невероятные!',
        images: [],
        isVerified: true,
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-10-15'),
      },
      {
        id: '2',
        userId: 'user-2',
        tourId: tourId || 'tour-1',
        rating: 4,
        comment: 'Очень понравилось, но погода подвела. Тур организован отлично.',
        images: [],
        isVerified: true,
        createdAt: new Date('2024-10-10'),
        updatedAt: new Date('2024-10-10'),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockReviews,
    } as ApiResponse<Review[]>);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении отзывов' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}

// POST /api/reviews - Создание отзыва
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tourId, rating, comment, images } = body;

    // TODO: Валидация
    // TODO: Проверка, что пользователь прошел тур
    // TODO: Проверка на дубликат отзыва
    // TODO: Создание отзыва в БД
    // TODO: Обновление рейтинга тура
    // TODO: Уведомление оператора

    return NextResponse.json({
      success: true,
      data: {
        id: 'new-review-id',
        ...body,
        isVerified: false, // Требуется модерация
        createdAt: new Date(),
      },
      message: 'Спасибо за отзыв! Он будет опубликован после модерации.',
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка при создании отзыва' } as ApiResponse<null>,
      { status: 500 }
    );
  }
}



