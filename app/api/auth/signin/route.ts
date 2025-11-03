import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/middleware/csrf';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';

export const dynamic = 'force-dynamic';

async function handler(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Проверяем демо-пользователя
    if (email === 'pospk@mail.ru' && password === 'Gr96Ww32') {
      const demoUser = {
        id: 'demo_user_123',
        email,
        name: 'Демо Пользователь',
        avatar: '/api/placeholder/64/64',
        roles: ['tourist'],
        preferences: {
          language: 'ru',
          notifications: true,
          emergencyAlerts: true,
          locationSharing: false,
          theme: 'system'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json(demoUser);
    }

    // Проверяем зарегистрированных пользователей
    const users = JSON.parse(process.env.REGISTERED_USERS || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const authUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || '/api/placeholder/64/64',
        roles: user.roles || ['tourist'],
        preferences: {
          language: 'ru',
          notifications: true,
          emergencyAlerts: true,
          locationSharing: false,
          theme: 'system'
        },
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return NextResponse.json(authUser);
    }

    return NextResponse.json(
      { error: 'Неверный email или пароль' },
      { status: 401 }
    );
  } catch (error) {
    logger.error('Sign in error', error, {
      endpoint: '/api/auth/signin',
    });
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Export with CSRF protection and strict Rate Limiting (5 попыток/15 мин)
export const POST = withRateLimit(
  RateLimitPresets.authentication,
  withCsrfProtection(handler)
);