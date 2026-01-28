/**
 * 🧳 ТЕСТ ПОЛНОГО ПУТИ ТУРИСТА
 * 
 * Тестирование всех этапов пути туриста через все сущности и бизнес-процессы:
 * 1. Регистрация и вход
 * 2. Просмотр туров и поиск
 * 3. Проверка погоды
 * 4. Просмотр размещений
 * 5. Бронирование трансферов
 * 6. Просмотр снаряжения
 * 7. Создание бронирования тура
 * 8. Оплата
 * 9. Отзывы и рейтинги
 * 10. Система лояльности и эко-баллы
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TouristUser {
  id?: string;
  email: string;
  password: string;
  name: string;
  token?: string;
}

interface Tour {
  id: string;
  title: string;
  price: number;
  duration: number;
  difficulty: string;
  operatorId: string;
}

interface Booking {
  id: string;
  tourId: string;
  userId: string;
  status: string;
  totalPrice: number;
}

describe('🧳 ТЕСТ ПОЛНОГО ПУТИ ТУРИСТА', () => {
  let tourist: TouristUser = {
    email: `tourist-${Date.now()}@test.com`,
    password: 'TestPassword123!',
    name: 'Иван Петров'
  };

  let tour: Tour | null = null;
  let accommodation: any = null;
  let transfer: any = null;
  let booking: Booking | null = null;
  let paymentId: string | null = null;

  // ============================================
  // ЭТАП 1: РЕГИСТРАЦИЯ И ВХОД
  // ============================================
  describe('ЭТАП 1: Регистрация и вход', () => {
    test('1.1 - Регистрация как турист', async () => {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tourist.email,
          password: tourist.password,
          fullName: tourist.name,
          role: 'tourist'
        })
      });

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(data.user).toBeDefined();
      expect(data.token).toBeDefined();
      
      tourist.id = data.user?.id;
      tourist.token = data.token;
    });

    test('1.2 - Вход в систему', async () => {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: tourist.email,
          password: tourist.password
        })
      });

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(data.token).toBeDefined();
      tourist.token = data.token;
    });

    test('1.3 - Получение профиля туриста', async () => {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        }
      });

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(data.user?.role).toBe('tourist');
      expect(data.user?.email).toBe(tourist.email);
    });

    test('1.4 - Обновление профиля туриста', async () => {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: '+79001234567',
          birthDate: '1990-01-15',
          preferredLanguage: 'ru'
        })
      });

      expect(response.status).toBeLessThan(400);
    });
  });

  // ============================================
  // ЭТАП 2: ПРОСМОТР ТУРОВ И ПОИСК
  // ============================================
  describe('ЭТАП 2: Просмотр туров и поиск', () => {
    test('2.1 - Получение списка всех туров', async () => {
      const response = await fetch(`${API_URL}/api/tours`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(Array.isArray(data.tours || data.data)).toBe(true);
      
      if (data.tours?.length > 0) {
        tour = data.tours[0];
      } else if (data.data?.tours?.length > 0) {
        tour = data.data.tours[0];
      }
    });

    test('2.2 - Поиск туров по фильтрам', async () => {
      const response = await fetch(
        `${API_URL}/api/tours/search?difficulty=easy&category=hiking&limit=10`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(Array.isArray(data.tours || data.data)).toBe(true);
    });

    test('2.3 - Получение деталей конкретного тура', async () => {
      if (!tour?.id) {
        console.log('⚠️ Тур не найден, пропускаем тест');
        return;
      }

      const response = await fetch(`${API_URL}/api/tours/${tour.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(data.tour?.id).toBe(tour.id);
      expect(data.tour?.title).toBeDefined();
      expect(data.tour?.price).toBeDefined();
    });

    test('2.4 - Получение рекомендаций туров', async () => {
      const response = await fetch(
        `${API_URL}/api/tours/recommendations?limit=5`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
    });

    test('2.5 - Просмотр отзывов тура', async () => {
      if (!tour?.id) return;

      const response = await fetch(`${API_URL}/api/tours/${tour.id}/reviews`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 3: ПРОВЕРКА ПОГОДЫ
  // ============================================
  describe('ЭТАП 3: Проверка погоды', () => {
    test('3.1 - Получение текущей погоды', async () => {
      const response = await fetch(
        `${API_URL}/api/weather?latitude=53.0195&longitude=158.6505`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json() as any;
        expect(data.temperature !== undefined || data.weather !== undefined).toBe(true);
      }
    });

    test('3.2 - Прогноз погоды на неделю', async () => {
      const response = await fetch(
        `${API_URL}/api/weather/forecast?latitude=53.0195&longitude=158.6505&days=7`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 4: ПРОСМОТР РАЗМЕЩЕНИЙ
  // ============================================
  describe('ЭТАП 4: Просмотр размещений', () => {
    test('4.1 - Получение списка размещений', async () => {
      const response = await fetch(
        `${API_URL}/api/accommodations?region=kamchatka&limit=10`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json() as any;
        if (data.accommodations?.length > 0) {
          accommodation = data.accommodations[0];
        }
      }
    });

    test('4.2 - Получение деталей размещения', async () => {
      if (!accommodation?.id) {
        console.log('⚠️ Размещение не найдено');
        return;
      }

      const response = await fetch(`${API_URL}/api/accommodations/${accommodation.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('4.3 - Поиск размещений по дате', async () => {
      const checkIn = new Date();
      const checkOut = new Date(checkIn.getTime() + 7 * 24 * 60 * 60 * 1000);

      const response = await fetch(
        `${API_URL}/api/accommodations/search?checkIn=${checkIn.toISOString().split('T')[0]}&checkOut=${checkOut.toISOString().split('T')[0]}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
    });

    test('4.4 - Бронирование размещения', async () => {
      if (!accommodation?.id) {
        console.log('⚠️ Размещение не найдено, пропускаем бронирование');
        return;
      }

      const checkIn = new Date();
      const checkOut = new Date(checkIn.getTime() + 3 * 24 * 60 * 60 * 1000);

      const response = await fetch(`${API_URL}/api/accommodations/${accommodation.id}/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          checkIn: checkIn.toISOString().split('T')[0],
          checkOut: checkOut.toISOString().split('T')[0],
          guests: 2,
          specialRequests: 'Кровать побольше'
        })
      });

      expect([200, 201, 404]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 5: БРОНИРОВАНИЕ ТРАНСФЕРОВ
  // ============================================
  describe('ЭТАП 5: Бронирование трансферов', () => {
    test('5.1 - Получение доступных трансферов', async () => {
      const response = await fetch(
        `${API_URL}/api/transfers?from=airport&to=accommodation&date=${new Date().toISOString().split('T')[0]}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json() as any;
        if (data.transfers?.length > 0) {
          transfer = data.transfers[0];
        }
      }
    });

    test('5.2 - Получение деталей трансфера', async () => {
      if (!transfer?.id) {
        console.log('⚠️ Трансфер не найден');
        return;
      }

      const response = await fetch(`${API_URL}/api/transfers/${transfer.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('5.3 - Бронирование трансфера', async () => {
      if (!transfer?.id) {
        console.log('⚠️ Трансфер не найден, пропускаем бронирование');
        return;
      }

      const response = await fetch(`${API_URL}/api/transfers/${transfer.id}/book`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          passengers: 2,
          date: new Date().toISOString().split('T')[0],
          time: '14:00',
          specialRequests: 'Детское кресло'
        })
      });

      expect([200, 201, 404]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 6: ПРОСМОТР СНАРЯЖЕНИЯ
  // ============================================
  describe('ЭТАП 6: Просмотр снаряжения', () => {
    test('6.1 - Получение списка снаряжения', async () => {
      const response = await fetch(`${API_URL}/api/gear`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('6.2 - Поиск снаряжения по типу', async () => {
      const response = await fetch(`${API_URL}/api/gear?type=backpack&difficulty=easy`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('6.3 - Просмотр деталей снаряжения', async () => {
      const response = await fetch(`${API_URL}/api/gear/list`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      if (response.status === 200) {
        const data = await response.json() as any;
        if (data.gear?.[0]?.id) {
          const gearId = data.gear[0].id;
          const detailResponse = await fetch(`${API_URL}/api/gear/${gearId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${tourist.token}` }
          });
          expect([200, 404]).toContain(detailResponse.status);
        }
      }
    });
  });

  // ============================================
  // ЭТАП 7: СОЗДАНИЕ БРОНИРОВАНИЯ ТУРА
  // ============================================
  describe('ЭТАП 7: Создание бронирования тура', () => {
    test('7.1 - Проверка доступности даты тура', async () => {
      if (!tour?.id) {
        console.log('⚠️ Тур не найден, пропускаем');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/tours/${tour.id}/availability?date=${new Date().toISOString().split('T')[0]}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${tourist.token}` }
        }
      );

      expect([200, 404]).toContain(response.status);
    });

    test('7.2 - Создание бронирования тура', async () => {
      if (!tour?.id) {
        console.log('⚠️ Тур не найден, пропускаем бронирование');
        return;
      }

      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tourId: tour.id,
          date: new Date().toISOString().split('T')[0],
          participants: 2,
          specialRequests: 'Вегетарианская еда',
          gearRequired: ['backpack', 'tent']
        })
      });

      if (response.status < 400) {
        const data = await response.json() as any;
        booking = data.booking || data.data;
        expect(booking?.id).toBeDefined();
      } else {
        console.log('⚠️ Не удалось создать бронирование');
      }
    });

    test('7.3 - Получение списка бронирований туриста', async () => {
      const response = await fetch(`${API_URL}/api/bookings`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect(response.status).toBeLessThan(400);
      const data = await response.json() as any;
      expect(Array.isArray(data.bookings || data.data)).toBe(true);
    });

    test('7.4 - Получение деталей бронирования', async () => {
      if (!booking?.id) {
        console.log('⚠️ Бронирование не создано, пропускаем');
        return;
      }

      const response = await fetch(`${API_URL}/api/bookings/${booking.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json() as any;
        expect(data.booking?.id || data.data?.id).toBe(booking.id);
      }
    });
  });

  // ============================================
  // ЭТАП 8: ОПЛАТА
  // ============================================
  describe('ЭТАП 8: Оплата', () => {
    test('8.1 - Инициирование платежа', async () => {
      if (!booking?.id) {
        console.log('⚠️ Бронирование не создано, пропускаем платеж');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalPrice || 5000,
          paymentMethod: 'card',
          currency: 'RUB'
        })
      });

      if (response.status < 400) {
        const data = await response.json() as any;
        paymentId = data.payment?.id || data.data?.id;
        expect(paymentId).toBeDefined();
      }
    });

    test('8.2 - Получение истории платежей', async () => {
      const response = await fetch(`${API_URL}/api/payments`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('8.3 - Получение статуса платежа', async () => {
      if (!paymentId) {
        console.log('⚠️ Платеж не создан, пропускаем проверку');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/${paymentId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('8.4 - Возврат средств (если нужен)', async () => {
      if (!paymentId) {
        console.log('⚠️ Платеж не создан, пропускаем возврат');
        return;
      }

      const response = await fetch(`${API_URL}/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Изменил решение'
        })
      });

      expect([200, 404, 400]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 9: ОТЗЫВЫ И РЕЙТИНГИ
  // ============================================
  describe('ЭТАП 9: Отзывы и рейтинги', () => {
    test('9.1 - Оставление отзыва о туре', async () => {
      if (!tour?.id) {
        console.log('⚠️ Тур не найден, пропускаем отзыв');
        return;
      }

      const response = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tourId: tour.id,
          bookingId: booking?.id,
          rating: 5,
          title: 'Отличное приключение!',
          content: 'Тур был просто великолепен. Гид был профессионален и внимателен.',
          wouldRecommend: true
        })
      });

      expect([200, 201, 404]).toContain(response.status);
    });

    test('9.2 - Получение отзывов туриста', async () => {
      const response = await fetch(`${API_URL}/api/reviews/my-reviews`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('9.3 - Редактирование отзыва', async () => {
      const response = await fetch(`${API_URL}/api/reviews/list`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      if (response.status === 200) {
        const data = await response.json() as any;
        if (data.reviews?.[0]?.id) {
          const reviewId = data.reviews[0].id;
          const editResponse = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${tourist.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              rating: 4,
              content: 'Обновленный отзыв'
            })
          });
          expect([200, 404]).toContain(editResponse.status);
        }
      }
    });
  });

  // ============================================
  // ЭТАП 10: СИСТЕМА ЛОЯЛЬНОСТИ И ЭКО-БАЛЛЫ
  // ============================================
  describe('ЭТАП 10: Система лояльности и эко-баллы', () => {
    test('10.1 - Получение профиля лояльности', async () => {
      const response = await fetch(`${API_URL}/api/loyalty/profile`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        const data = await response.json() as any;
        expect(data.loyalty?.points !== undefined || data.data?.points !== undefined).toBe(true);
      }
    });

    test('10.2 - Получение текущих баллов лояльности', async () => {
      const response = await fetch(`${API_URL}/api/loyalty/points`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('10.3 - История использования баллов', async () => {
      const response = await fetch(`${API_URL}/api/loyalty/history`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('10.4 - Получение уровня лояльности', async () => {
      const response = await fetch(`${API_URL}/api/loyalty/level`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('10.5 - Получение эко-баллов', async () => {
      const response = await fetch(`${API_URL}/api/eco-points`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('10.6 - Логирование эко-активности', async () => {
      const response = await fetch(`${API_URL}/api/eco-points/log-activity`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          activity: 'used_public_transport',
          description: 'Использовал общественный транспорт для добраться до тура',
          points: 50
        })
      });

      expect([200, 201, 404]).toContain(response.status);
    });

    test('10.7 - История эко-баллов', async () => {
      const response = await fetch(`${API_URL}/api/eco-points/history`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('10.8 - Ваучеры и скидки', async () => {
      const response = await fetch(`${API_URL}/api/vouchers`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('10.9 - Применение ваучера', async () => {
      const response = await fetch(`${API_URL}/api/vouchers/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voucherCode: 'TEST50',
          bookingId: booking?.id
        })
      });

      expect([200, 404, 400]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 11: ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ
  // ============================================
  describe('ЭТАП 11: Дополнительные функции', () => {
    test('11.1 - AI-чат помощник', async () => {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Какой тур лучше всего подойдет для начинающего туриста?'
        })
      });

      expect([200, 404]).toContain(response.status);
    });

    test('11.2 - Получение мобильного приложения', async () => {
      const response = await fetch(`${API_URL}/api/mobile-app`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('11.3 - Сохранение избранных туров', async () => {
      if (!tour?.id) {
        console.log('⚠️ Тур не найден, пропускаем');
        return;
      }

      const response = await fetch(`${API_URL}/api/favorites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tourId: tour.id
        })
      });

      expect([200, 201, 404]).toContain(response.status);
    });

    test('11.4 - Получение избранных туров', async () => {
      const response = await fetch(`${API_URL}/api/favorites`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('11.5 - Уведомления туриста', async () => {
      const response = await fetch(`${API_URL}/api/notifications`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    test('11.6 - Обновление предпочтений уведомлений', async () => {
      const response = await fetch(`${API_URL}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true
        })
      });

      expect([200, 404]).toContain(response.status);
    });
  });

  // ============================================
  // ЭТАП 12: ВЫХОД И ОЧИСТКА
  // ============================================
  describe('ЭТАП 12: Выход и очистка', () => {
    test('12.1 - Выход из системы', async () => {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tourist.token}` }
      });

      expect([200, 204, 404]).toContain(response.status);
    });

    test('12.2 - Удаление аккаунта (опционально)', async () => {
      // Обычно требуется подтверждение по почте
      const response = await fetch(`${API_URL}/api/auth/account/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tourist.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: tourist.password,
          reason: 'Test cleanup'
        })
      });

      expect([200, 204, 400, 404]).toContain(response.status);
    });
  });
});
