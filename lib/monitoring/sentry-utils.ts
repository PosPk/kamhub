/**
 * SENTRY UTILITIES
 * Утилиты для работы с Sentry
 */

import * as Sentry from '@sentry/nextjs';

/**
 * Обертка для API handlers с автоматическим error tracking
 */
export function withSentryErrorHandling(handler: Function) {
  return async (request: any) => {
    try {
      return await handler(request);
    } catch (error) {
      // Логируем в Sentry
      Sentry.captureException(error, {
        tags: {
          handler: handler.name || 'anonymous',
          method: request.method,
          url: request.url,
        },
        contexts: {
          request: {
            method: request.method,
            url: request.url,
            headers: sanitizeHeaders(request.headers),
          },
        },
      });
      
      // Пробрасываем ошибку дальше
      throw error;
    }
  };
}

/**
 * Очистка headers от чувствительных данных
 */
function sanitizeHeaders(headers: any): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-csrf-token'];
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = String(value);
    }
  }
  
  return sanitized;
}

/**
 * Tracking critical business events
 */
export function trackBookingEvent(
  event: 'booking_created' | 'booking_confirmed' | 'booking_cancelled',
  data: {
    bookingId: string;
    amount?: number;
    userId?: string;
    [key: string]: any;
  }
) {
  Sentry.addBreadcrumb({
    category: 'booking',
    message: `Booking ${event}`,
    level: 'info',
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      userId: data.userId,
    },
  });
}

/**
 * Tracking payment events
 */
export function trackPaymentEvent(
  event: 'payment_initiated' | 'payment_success' | 'payment_failed',
  data: {
    bookingId: string;
    amount: number;
    paymentId?: string;
    error?: string;
  }
) {
  Sentry.addBreadcrumb({
    category: 'payment',
    message: `Payment ${event}`,
    level: event === 'payment_failed' ? 'error' : 'info',
    data: {
      bookingId: data.bookingId,
      amount: data.amount,
      paymentId: data.paymentId,
      error: data.error,
    },
  });
  
  // Если платеж failed, отправляем как событие
  if (event === 'payment_failed') {
    Sentry.captureMessage(`Payment failed for booking ${data.bookingId}`, {
      level: 'warning',
      tags: {
        booking_id: data.bookingId,
        payment_amount: data.amount.toString(),
      },
      extra: {
        error: data.error,
      },
    });
  }
}

/**
 * Set user context
 */
export function setSentryUser(user: {
  id: string;
  email?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

/**
 * Clear user context (при logout)
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Custom error tracking для бизнес логики
 */
export class BusinessError extends Error {
  constructor(
    message: string,
    public errorCode: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

/**
 * Track business errors (не critical, но важные для мониторинга)
 */
export function trackBusinessError(error: BusinessError) {
  Sentry.captureMessage(error.message, {
    level: 'warning',
    tags: {
      error_code: error.errorCode,
    },
    extra: {
      details: error.details,
    },
  });
}

/**
 * Performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Пример использования:
 * 
 * // В API route
 * export const POST = withSentryErrorHandling(async (request) => {
 *   const transaction = startTransaction('booking_create', 'http.server');
 *   
 *   try {
 *     // Ваш код
 *     trackBookingEvent('booking_created', { bookingId, amount });
 *     
 *     return NextResponse.json({ success: true });
 *   } finally {
 *     transaction.finish();
 *   }
 * });
 * 
 * 
 * // Set user после login
 * setSentryUser({
 *   id: user.id,
 *   email: user.email,
 *   role: user.role
 * });
 * 
 * 
 * // Track payment
 * trackPaymentEvent('payment_success', {
 *   bookingId,
 *   amount,
 *   paymentId
 * });
 */
