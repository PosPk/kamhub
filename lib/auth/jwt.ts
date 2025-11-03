/**
 * JWT AUTHENTICATION SYSTEM
 * 
 * Генерация и валидация JWT токенов для аутентификации
 * 
 * Usage:
 *   import { generateToken, verifyToken } from '@/lib/auth/jwt';
 *   const token = await generateToken(userId, role);
 *   const payload = await verifyToken(token);
 */

import * as jwt from 'jsonwebtoken';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

export interface JWTPayload {
  userId: string;
  role: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Генерация JWT токена
 */
export async function generateToken(
  userId: string,
  role: string,
  email?: string
): Promise<string> {
  try {
    const payload: JWTPayload = {
      userId,
      role,
      email,
    };

    const token = jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn,
      issuer: 'kamchatour-hub',
      audience: 'kamchatour-users',
    });

    logger.debug('JWT token generated', { userId, role });
    return token;
  } catch (error) {
    logger.error('Error generating JWT token', error, { userId, role });
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Валидация JWT токена
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    // Убираем "Bearer " если есть
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    const payload = jwt.verify(
      cleanToken,
      config.auth.jwtSecret,
      {
        issuer: 'kamchatour-hub',
        audience: 'kamchatour-users',
      }
    ) as JWTPayload;

    logger.debug('JWT token verified', { userId: payload.userId, role: payload.role });
    return payload;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('JWT token expired', { token: token.substring(0, 20) + '...' });
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid JWT token', { error: error.message });
      throw new Error('Invalid token');
    }
    logger.error('Error verifying JWT token', error);
    throw new Error('Token verification failed');
  }
}

/**
 * Генерация refresh токена
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  try {
    const payload = {
      userId,
      type: 'refresh',
    };

    const token = jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.refreshTokenExpiresIn,
      issuer: 'kamchatour-hub',
    });

    return token;
  } catch (error) {
    logger.error('Error generating refresh token', error, { userId });
    throw new Error('Failed to generate refresh token');
  }
}

/**
 * Валидация refresh токена
 */
export async function verifyRefreshToken(token: string): Promise<{ userId: string }> {
  try {
    const payload = jwt.verify(token, config.auth.jwtSecret, {
      issuer: 'kamchatour-hub',
    }) as { userId: string; type?: string };

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return { userId: payload.userId };
  } catch (error: any) {
    logger.error('Error verifying refresh token', error);
    throw new Error('Invalid refresh token');
  }
}

/**
 * Извлечение токена из запроса
 */
export function extractToken(request: Request): string | null {
  // Из Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Из cookie (fallback)
  const cookies = request.headers.get('cookie');
  if (cookies) {
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  }

  return null;
}
