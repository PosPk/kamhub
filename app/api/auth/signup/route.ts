import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}