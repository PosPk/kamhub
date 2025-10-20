import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getLoyaltyStats } from '../../app/api/loyalty/stats/route';
import { POST as applyPromoCode } from '../../app/api/loyalty/promo/apply/route';
import { GET as getLoyaltyLevels } from '../../app/api/loyalty/levels/route';

describe('Loyalty API Routes', () => {
  describe('GET /api/loyalty/stats', () => {
    it('should return loyalty stats for user', async () => {
      const request = new NextRequest('http://localhost:3000/api/loyalty/stats?userId=test_user_123');
      
      const response = await getLoyaltyStats(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.currentLevel).toBeDefined();
      expect(data.data.availablePoints).toBeDefined();
      expect(data.data.totalSpent).toBeDefined();
    });

    it('should return error for missing userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/loyalty/stats');
      
      const response = await getLoyaltyStats(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/loyalty/promo/apply', () => {
    it('should apply valid promo code', async () => {
      const request = new NextRequest('http://localhost:3000/api/loyalty/promo/apply', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test_user_123',
          promoCode: 'WELCOME10',
          bookingId: 'test_booking_123',
          amount: 2000
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await applyPromoCode(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.discount).toBeDefined();
      expect(data.data.message).toBeDefined();
    });

    it('should return error for invalid promo code', async () => {
      const request = new NextRequest('http://localhost:3000/api/loyalty/promo/apply', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test_user_123',
          promoCode: 'INVALID_CODE',
          bookingId: 'test_booking_123'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await applyPromoCode(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('GET /api/loyalty/levels', () => {
    it('should return all loyalty levels', async () => {
      const request = new NextRequest('http://localhost:3000/api/loyalty/levels');
      
      const response = await getLoyaltyLevels(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      // Проверяем структуру уровня
      const level = data.data[0];
      expect(level.name).toBeDefined();
      expect(level.minSpent).toBeDefined();
      expect(level.discountPercentage).toBeDefined();
      expect(level.benefits).toBeDefined();
    });
  });
});