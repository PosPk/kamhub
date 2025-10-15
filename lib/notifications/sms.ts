// =============================================
// СЕРВИС SMS УВЕДОМЛЕНИЙ
// Kamchatour Hub - SMS Notification Service
// =============================================

import { config } from '@/lib/config';

interface SMSMessage {
  to: string;
  text: string;
  sender?: string;
}

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SMSNotificationService {
  private apiKey: string;
  private baseUrl: string = 'https://sms.ru/sms/send';

  constructor() {
    this.apiKey = process.env.SMS_RU_API_KEY || '';
    if (!this.apiKey) {
      console.warn('SMS_RU_API_KEY not configured');
    }
  }

  // Отправка SMS
  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const formData = new URLSearchParams({
        api_id: this.apiKey,
        to: message.to,
        msg: message.text,
        from: message.sender || 'Kamchatour',
        json: '1'
      });

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const data = await response.json();

      if (data.status === 'OK') {
        return {
          success: true,
          messageId: data.sms[message.to]?.sms_id
        };
      } else {
        return {
          success: false,
          error: data.status_text || 'Unknown error'
        };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Уведомление о новой заявке на трансфер
  async sendBookingRequest(phone: string, bookingDetails: {
    route: string;
    date: string;
    time: string;
    passengers: number;
    price: number;
  }): Promise<SMSResponse> {
    const text = `🚌 Новая заявка на трансфер\n` +
      `Маршрут: ${bookingDetails.route}\n` +
      `Дата: ${bookingDetails.date}\n` +
      `Время: ${bookingDetails.time}\n` +
      `Пассажиры: ${bookingDetails.passengers}\n` +
      `Цена: ${bookingDetails.price} ₽\n\n` +
      `Подтвердите в течение 15 минут`;

    return this.sendSMS({
      to: phone,
      text,
      sender: 'Kamchatour'
    });
  }

  // Подтверждение бронирования
  async sendBookingConfirmation(phone: string, confirmationDetails: {
    confirmationCode: string;
    route: string;
    date: string;
    time: string;
    driverName: string;
    driverPhone: string;
  }): Promise<SMSResponse> {
    const text = `✅ Бронирование подтверждено\n` +
      `Код: ${confirmationDetails.confirmationCode}\n` +
      `Маршрут: ${confirmationDetails.route}\n` +
      `Дата: ${confirmationDetails.date}\n` +
      `Время: ${confirmationDetails.time}\n` +
      `Водитель: ${confirmationDetails.driverName}\n` +
      `Телефон: ${confirmationDetails.driverPhone}`;

    return this.sendSMS({
      to: phone,
      text,
      sender: 'Kamchatour'
    });
  }

  // Напоминание о поездке
  async sendTripReminder(phone: string, tripDetails: {
    route: string;
    departureTime: string;
    meetingPoint: string;
    driverName: string;
    driverPhone: string;
  }): Promise<SMSResponse> {
    const text = `⏰ Напоминание о поездке\n` +
      `Маршрут: ${tripDetails.route}\n` +
      `Время отправления: ${tripDetails.departureTime}\n` +
      `Место встречи: ${tripDetails.meetingPoint}\n` +
      `Водитель: ${tripDetails.driverName}\n` +
      `Телефон: ${tripDetails.driverPhone}`;

    return this.sendSMS({
      to: phone,
      text,
      sender: 'Kamchatour'
    });
  }

  // Отмена поездки
  async sendTripCancellation(phone: string, cancellationDetails: {
    route: string;
    date: string;
    reason: string;
    refundAmount?: number;
  }): Promise<SMSResponse> {
    let text = `❌ Поездка отменена\n` +
      `Маршрут: ${cancellationDetails.route}\n` +
      `Дата: ${cancellationDetails.date}\n` +
      `Причина: ${cancellationDetails.reason}`;

    if (cancellationDetails.refundAmount) {
      text += `\nВозврат: ${cancellationDetails.refundAmount} ₽`;
    }

    return this.sendSMS({
      to: phone,
      text,
      sender: 'Kamchatour'
    });
  }

  // Уведомление водителю о новой заявке
  async sendDriverNotification(phone: string, bookingDetails: {
    route: string;
    date: string;
    time: string;
    passengers: number;
    price: number;
    bookingId: string;
  }): Promise<SMSResponse> {
    const text = `🚗 Новая заявка для водителя\n` +
      `Маршрут: ${bookingDetails.route}\n` +
      `Дата: ${bookingDetails.date}\n` +
      `Время: ${bookingDetails.time}\n` +
      `Пассажиры: ${bookingDetails.passengers}\n` +
      `Цена: ${bookingDetails.price} ₽\n` +
      `ID заявки: ${bookingDetails.bookingId}\n\n` +
      `Подтвердите в приложении`;

    return this.sendSMS({
      to: phone,
      text,
      sender: 'Kamchatour'
    });
  }

  // Статистика для оператора
  async sendOperatorStats(phone: string, stats: {
    date: string;
    totalBookings: number;
    totalRevenue: number;
    completedTrips: number;
  }): Promise<SMSResponse> {
    const text = `📊 Статистика за ${stats.date}\n` +
      `Заявок: ${stats.totalBookings}\n` +
      `Выполнено: ${stats.completedTrips}\n` +
      `Доход: ${stats.totalRevenue} ₽`;

    return this.sendSMS({
      to: phone,
      text,
      sender: 'Kamchatour'
    });
  }

  // Проверка статуса SMS
  async checkSMSStatus(messageId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const response = await fetch(
        `https://sms.ru/sms/status?api_id=${this.apiKey}&sms_id=${messageId}&json=1`
      );
      const data = await response.json();

      return {
        success: true,
        status: data.status
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Получение баланса
  async getBalance(): Promise<{
    success: boolean;
    balance?: number;
    error?: string;
  }> {
    if (!this.apiKey) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      const response = await fetch(
        `https://sms.ru/my/balance?api_id=${this.apiKey}&json=1`
      );
      const data = await response.json();

      return {
        success: true,
        balance: data.balance
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Создаем глобальный экземпляр
export const smsService = new SMSNotificationService();

// Экспортируем типы
export type { SMSMessage, SMSResponse };