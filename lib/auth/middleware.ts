/**
 * JWT AUTHENTICATION MIDDLEWARE
 * 
 * Middleware для проверки JWT токенов в API routes
 * 
 * Usage:
 *   import { withAuth } from '@/lib/auth/middleware';
 *   export const POST = withAuth(async (request, payload) => {
 *     // payload содержит { userId, role, email }
 *   });
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractToken, JWTPayload } from './jwt';
import { logger } from '@/lib/logger';

/**
 * Middleware для проверки аутентификации
 * Автоматически извлекает и валидирует JWT токен
 */
export function withAuth(
  handler: (request: NextRequest, payload: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Извлекаем токен
      const token = extractToken(request);
      
      if (!token) {
        return NextResponse.json(
          {
            success: false,
            error: 'Требуется аутентификация',
            errorCode: 'AUTH_REQUIRED',
          },
          { status: 401 }
        );
      }

      // Валидируем токен
      const payload = await verifyToken(token);

      // Вызываем handler с валидным payload
      return handler(request, payload);
    } catch (error: any) {
      logger.warn('Authentication failed', {
        error: error.message,
        path: request.url,
      });

      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Неверный токен',
          errorCode: 'AUTH_FAILED',
        },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware для проверки роли
 * Проверяет что пользователь имеет одну из указанных ролей
 */
export function withRole(
  allowedRoles: string[],
  handler: (request: NextRequest, payload: JWTPayload) => Promise<NextResponse>
) {
  return withAuth(async (request, payload) => {
    if (!allowedRoles.includes(payload.role) && payload.role !== 'admin') {
      logger.warn('Access denied - insufficient role', {
        userId: payload.userId,
        userRole: payload.role,
        requiredRoles: allowedRoles,
        path: request.url,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Недостаточно прав доступа',
          errorCode: 'INSUFFICIENT_ROLE',
        },
        { status: 403 }
      );
    }

    return handler(request, payload);
  });
}

/**
 * Комбинация: Auth + CSRF + Rate Limit
 */
export function withFullProtection(
  config: {
    rateLimit?: any;
    roles?: string[];
  },
  handler: (request: NextRequest, payload: JWTPayload) => Promise<NextResponse>
) {
  const { withRateLimit, RateLimitPresets } = require('@/lib/middleware/rate-limit');
  const { withCsrfProtection } = require('@/lib/middleware/csrf');

  let protectedHandler: any = handler;

  // Применяем проверку роли если указана
  if (config.roles) {
    protectedHandler = (req: NextRequest, payload: JWTPayload) => {
      if (!config.roles!.includes(payload.role) && payload.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Недостаточно прав' },
          { status: 403 }
        );
      }
      return handler(req, payload);
    };
  }

  // Обертка для передачи payload через middleware
  const authHandler = withAuth(protectedHandler);

  // Применяем CSRF (для POST/PUT/DELETE)
  const csrfHandler = withCsrfProtection(authHandler);

  // Применяем Rate Limit если указан
  if (config.rateLimit) {
    return withRateLimit(config.rateLimit, csrfHandler);
  }

  return csrfHandler;
}
