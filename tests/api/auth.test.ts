/**
 * Тесты для аутентификации
 */

import { describe, it, expect } from 'vitest';
import { createToken, verifyToken } from '@/lib/auth/jwt';

describe('JWT Authentication', () => {
  it('должен создать валидный токен', async () => {
    const payload = {
      userId: 'test-user-1',
      email: 'test@example.com',
      role: 'operator',
      name: 'Test User'
    };

    const token = await createToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // JWT формат
  });

  it('должен верифицировать токен', async () => {
    const payload = {
      userId: 'test-user-2',
      email: 'test2@example.com',
      role: 'admin',
      name: 'Admin User'
    };

    const token = await createToken(payload);
    const verified = await verifyToken(token);

    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(payload.userId);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe(payload.role);
  });

  it('должен отклонить невалидный токен', async () => {
    const invalidToken = 'invalid.token.here';
    const verified = await verifyToken(invalidToken);

    expect(verified).toBeNull();
  });
});

