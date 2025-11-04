import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Допустимые роли
const VALID_ROLES = [
  'tourist',
  'operator',
  'guide',
  'provider',
  'driver',
  'hotel_manager',
  'restaurant_owner'
];

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName, phone, roles } = await request.json();

    // Валидация
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, пароль и имя обязательны' },
        { status: 400 }
      );
    }

    if (!roles || !Array.isArray(roles) || roles.length === 0) {
      return NextResponse.json(
        { error: 'Выберите хотя бы одну роль' },
        { status: 400 }
      );
    }

    // Проверяем, что все роли валидны
    const invalidRoles = roles.filter(role => !VALID_ROLES.includes(role));
    if (invalidRoles.length > 0) {
      return NextResponse.json(
        { error: `Недопустимые роли: ${invalidRoles.join(', ')}` },
        { status: 400 }
      );
    }

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
      companyName: companyName || null,
      phone: phone || null,
      password, // В реальном приложении пароль должен быть захеширован
      avatar: '/api/placeholder/64/64',
      roles: roles, // Массив ролей
      primaryRole: roles[0], // Первая роль как основная
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
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Регистрация успешна'
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}