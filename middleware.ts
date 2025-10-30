import { NextResponse, NextRequest } from 'next/server';
import { config as appConfig } from '@/lib/config';

// Простое rate limiting в памяти процесса (для API)
const RATE_LIMIT_WINDOW_MS = appConfig.security.rateLimit.windowMs;
const RATE_LIMIT_MAX = appConfig.security.rateLimit.max;
const requestsMap = new Map<string, { count: number; ts: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const rec = requestsMap.get(ip);
  if (!rec || now - rec.ts > RATE_LIMIT_WINDOW_MS) {
    requestsMap.set(ip, { count: 1, ts: now });
    return true;
  }
  rec.count += 1;
  if (rec.count > RATE_LIMIT_MAX) return false;
  return true;
}

function applyCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = req.headers.get('origin') || '';
  const allowed = appConfig.security.cors.origin;
  const isAllowed = allowed.includes('*') || allowed.includes(origin);
  if (isAllowed && origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
  }
  res.headers.set('Access-Control-Allow-Credentials', 'true');
  res.headers.set('Access-Control-Allow-Headers', req.headers.get('Access-Control-Request-Headers') || '*');
  res.headers.set('Access-Control-Expose-Headers', '*');
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  return res;
}

export function middleware(request: NextRequest) {
  // Префлайт CORS
  if (request.method === 'OPTIONS') {
    const pre = NextResponse.json({}, { status: 200 });
    return applyCors(request, pre);
  }

  // Rate limit по IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  if (!rateLimit(String(ip))) {
    const tooMany = NextResponse.json({ success: false, error: 'Too Many Requests' }, { status: 429 });
    return applyCors(request, tooMany);
  }

  // Минимальные security headers для API ответов
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'no-referrer');
  res.headers.set('X-Frame-Options', 'DENY');
  return applyCors(request, res);
}

export const config = {
  matcher: ['/api/:path*'],
};
