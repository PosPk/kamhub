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

export function middleware(request: NextRequest) {
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
  
  return response;
}

// Применяем middleware только к API routes
export const config = {
  matcher: '/api/:path*',
};
