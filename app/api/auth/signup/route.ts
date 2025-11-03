import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { withCsrfProtection } from '@/lib/middleware/csrf';
import { withRateLimit, RateLimitPresets } from '@/lib/middleware/rate-limit';

export const dynamic = 'force-dynamic';

async function handler(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Проверяем, что пользователь не существует
    const users = JSON.parse(process.env.REGISTERED_USERS || '[]');
    const existingUser = users.find((u: any) => u.email === email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    // Создаем нового пользователя
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      name,
      password, // В реальном приложении пароль должен быть захеширован
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

    // Добавляем пользователя в список
    users.push(newUser);
    process.env.REGISTERED_USERS = JSON.stringify(users);

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    logger.error('Sign up error', error, {
      endpoint: '/api/auth/signup',
    });
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// Export with CSRF protection and Rate Limiting
export const POST = withRateLimit(
  RateLimitPresets.creation, // 5 запросов/1 минута
  withCsrfProtection(handler)
);