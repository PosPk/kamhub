import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as searchTransfers } from '../../app/api/transfers/search/route';
import { POST as bookTransfer } from '../../app/api/transfers/book/route';

describe('Transfer API Routes', () => {
  describe('POST /api/transfers/search', () => {
    it('should return available transfers for valid search', async () => {
      const request = new NextRequest('http://localhost:3000/api/transfers/search', {
        method: 'POST',
        body: JSON.stringify({
          fromLocation: 'Петропавловск-Камчатский',
          toLocation: 'Елизово',
          departureDate: '2024-12-25',
          passengersCount: 2,
          vehicleType: 'sedan'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await searchTransfers(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return error for invalid search parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/transfers/search', {
        method: 'POST',
        body: JSON.stringify({
          fromLocation: '',
          toLocation: 'Елизово',
          departureDate: '2024-12-25',
          passengersCount: 2
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await searchTransfers(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('POST /api/transfers/book', () => {
    it('should create booking for valid request', async () => {
      const request = new NextRequest('http://localhost:3000/api/transfers/book', {
        method: 'POST',
        body: JSON.stringify({
          scheduleId: 'test_schedule_1',
          passengersCount: 2,
          contactInfo: {
            name: 'Тест Тестович',
            phone: '+7-999-123-45-67',
            email: 'test@example.com'
          },
          specialRequests: 'Тестовый заказ',
          fromCoordinates: { lat: 53.0195, lng: 158.6505 },
          toCoordinates: { lat: 53.1875, lng: 158.3805 },
          departureDate: '2024-12-25',
          vehicleType: 'sedan',
          budgetMax: 5000,
          features: ['wifi', 'air_conditioning'],
          languages: ['ru']
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await bookTransfer(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.bookingId).toBeDefined();
      expect(data.data.confirmationCode).toBeDefined();
    });

    it('should return error for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/transfers/book', {
        method: 'POST',
        body: JSON.stringify({
          scheduleId: 'test_schedule_1',
          passengersCount: 2
          // Missing contactInfo and other required fields
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await bookTransfer(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });
});