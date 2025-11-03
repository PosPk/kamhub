import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/middleware/csrf';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';
import { generateToken } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

async function handler(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Проверяем демо-пользователя
    if (email === 'pospk@mail.ru' && password === 'Gr96Ww32') {
      const userId = 'demo_user_123';
      const role = 'tourist';
      
      // Генерируем JWT токен
      const token = await generateToken(userId, role, email);
      
      const demoUser = {
        id: userId,
        email,
        name: 'Демо Пользователь',
        avatar: '/api/placeholder/64/64',
        roles: [role],
        token, // ✅ JWT токен
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

      const response = NextResponse.json(demoUser);
      
      // Устанавливаем токен в httpOnly cookie (опционально)
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return response;
    }

    // Проверяем зарегистрированных пользователей
    const users = JSON.parse(process.env.REGISTERED_USERS || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      // Генерируем JWT токен
      const token = await generateToken(
        user.id,
        user.roles?.[0] || 'tourist',
        user.email
      );
      
      const authUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || '/api/placeholder/64/64',
        roles: user.roles || ['tourist'],
        token, // ✅ JWT токен
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

      const response = NextResponse.json(authUser);
      
      // Устанавливаем токен в cookie
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 дней
      });

      return response;
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