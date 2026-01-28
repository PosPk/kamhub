/**
 * NEXT.JS MIDDLEWARE
 * Глобальный middleware для всех запросов
 * 
 * Выполняется перед каждым запросом к приложению
 * 
 * ВАЖНО: Middleware работает в Edge Runtime
 * Не поддерживает Node.js модули (crypto, fs и т.д.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'test-secret-key-for-development'
);

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Добавляем security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy (базовый)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    );
  }
  
  // Попытаемся извлечь и декодировать JWT токен для передачи userId
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const verified = await jwtVerify(token, secret);
        const userId = verified.payload.sub || verified.payload.userId;
        
        if (userId) {
          // Добавляем userId в headers для API routes
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set('x-user-id', String(userId));
          
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
      } catch (jwtError) {
        console.log('JWT validation failed:', jwtError instanceof Error ? jwtError.message : 'Unknown error');
        // Продолжаем без добавления userId
      }
    }
  } catch (error) {
    console.log('Middleware error:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  return response;
}

// Применяем middleware только к API routes
export const config = {
  matcher: '/api/:path*',
};

