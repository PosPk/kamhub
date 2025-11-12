/**
 * EMAIL SERVICE
 * Отправка email уведомлений через SMTP
 */

import nodemailer from 'nodemailer';
import { logger } from '@/lib/logger';

// =============================================
// ТИПЫ
// =============================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// =============================================
// MAILER CLASS
// =============================================

class Mailer {
  private transporter: nodemailer.Transporter | null = null;
  private isEnabled: boolean = false;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@kamchatour.ru';
    this.fromName = process.env.SMTP_FROM_NAME || 'Kamchatour Hub';
    
    this.initialize();
  }

  /**
   * Инициализация SMTP транспорта
   */
  private initialize() {
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = parseInt(process.env.SMTP_PORT || '587');
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASSWORD;

      if (!smtpHost || !smtpUser || !smtpPass) {
        logger.warn('SMTP не настроен. Email уведомления отключены.');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true для 465, false для других портов
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      this.isEnabled = true;
      logger.info('✅ Email сервис инициализирован', {
        host: smtpHost,
        port: smtpPort,
      });

    } catch (error) {
      logger.error('Ошибка инициализации email сервиса', error);
      this.isEnabled = false;
    }
  }

  /**
   * Отправить email
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      logger.warn('Email сервис недоступен', { to: options.to });
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: options.from || `"${this.fromName}" <${this.fromEmail}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        replyTo: options.replyTo,
        attachments: options.attachments,
      });

      logger.info('Email отправлен', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });

      return true;

    } catch (error) {
      logger.error('Ошибка отправки email', error, {
        to: options.to,
        subject: options.subject,
      });
      return false;
    }
  }

  /**
   * Проверка соединения
   */
  async verify(): Promise<boolean> {
    if (!this.isEnabled || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('SMTP проверка провалилась', error);
      return false;
    }
  }
}

// =============================================
// SINGLETON
// =============================================

export const mailer = new Mailer();

// =============================================
// ШАБЛОНЫ EMAIL
// =============================================

/**
 * Подтверждение бронирования
 */
export function createBookingConfirmationEmail(data: {
  userName: string;
  bookingNumber: string;
  tourName: string;
  date: string;
  price: number;
  confirmationUrl: string;
}): EmailTemplate {
  return {
    subject: `Подтверждение бронирования #${data.bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">✅ Бронирование подтверждено!</h1>
        
        <p>Здравствуйте, ${data.userName}!</p>
        
        <p>Ваше бронирование успешно оформлено.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Детали бронирования:</h2>
          <p><strong>Номер:</strong> #${data.bookingNumber}</p>
          <p><strong>Тур:</strong> ${data.tourName}</p>
          <p><strong>Дата:</strong> ${data.date}</p>
          <p><strong>Стоимость:</strong> ${data.price.toLocaleString('ru-RU')}₽</p>
        </div>
        
        <a href="${data.confirmationUrl}" 
           style="display: inline-block; background: #D4AF37; color: #000; 
                  padding: 15px 30px; text-decoration: none; border-radius: 5px; 
                  font-weight: bold; margin: 20px 0;">
          Посмотреть бронирование
        </a>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          С уважением,<br>
          Команда Kamchatour Hub
        </p>
      </div>
    `,
    text: `
Подтверждение бронирования #${data.bookingNumber}

Здравствуйте, ${data.userName}!

Ваше бронирование успешно оформлено.

Детали:
- Номер: #${data.bookingNumber}
- Тур: ${data.tourName}
- Дата: ${data.date}
- Стоимость: ${data.price.toLocaleString('ru-RU')}₽

Ссылка: ${data.confirmationUrl}

С уважением,
Команда Kamchatour Hub
    `,
  };
}

/**
 * Напоминание о туре
 */
export function createTourReminderEmail(data: {
  userName: string;
  tourName: string;
  date: string;
  time: string;
  meetingPoint: string;
}): EmailTemplate {
  return {
    subject: `Напоминание: ${data.tourName} завтра!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">⏰ Напоминание о туре</h1>
        
        <p>Здравствуйте, ${data.userName}!</p>
        
        <p>Напоминаем, что завтра вас ждет:</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="margin-top: 0;">${data.tourName}</h2>
          <p><strong>📅 Дата:</strong> ${data.date}</p>
          <p><strong>🕐 Время:</strong> ${data.time}</p>
          <p><strong>📍 Место встречи:</strong> ${data.meetingPoint}</p>
        </div>
        
        <p><strong>Что взять с собой:</strong></p>
        <ul>
          <li>Удобная обувь</li>
          <li>Теплая одежда</li>
          <li>Вода и перекус</li>
          <li>Документы</li>
        </ul>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          До встречи на маршруте! 🏔️<br>
          Команда Kamchatour Hub
        </p>
      </div>
    `,
    text: `
Напоминание о туре

Здравствуйте, ${data.userName}!

Напоминаем, что завтра вас ждет:
${data.tourName}

Дата: ${data.date}
Время: ${data.time}
Место встречи: ${data.meetingPoint}

Что взять с собой:
- Удобная обувь
- Теплая одежда
- Вода и перекус
- Документы

До встречи на маршруте!
Команда Kamchatour Hub
    `,
  };
}

/**
 * Приветственное письмо
 */
export function createWelcomeEmail(data: {
  userName: string;
  email: string;
}): EmailTemplate {
  return {
    subject: 'Добро пожаловать в Kamchatour Hub! 🏔️',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #D4AF37;">Добро пожаловать! 🎉</h1>
        
        <p>Здравствуйте, ${data.userName}!</p>
        
        <p>Мы рады приветствовать вас в Kamchatour Hub - современной платформе для путешествий по Камчатке.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Что вас ждет:</h3>
          <ul style="list-style: none; padding: 0;">
            <li>🗺️ Эксклюзивные туры к вулканам и гейзерам</li>
            <li>🚗 Трансферы по всей Камчатке</li>
            <li>🤖 AI-помощник для планирования</li>
            <li>🎁 Бонусная программа</li>
          </ul>
        </div>
        
        <p><strong>Начните прямо сейчас:</strong></p>
        <p>Посмотрите популярные туры или спросите у AI-гида что посетить!</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          С уважением,<br>
          Команда Kamchatour Hub
        </p>
      </div>
    `,
    text: `
Добро пожаловать в Kamchatour Hub!

Здравствуйте, ${data.userName}!

Мы рады приветствовать вас в Kamchatour Hub.

Что вас ждет:
- Эксклюзивные туры к вулканам и гейзерам
- Трансферы по всей Камчатке
- AI-помощник для планирования
- Бонусная программа

Начните прямо сейчас - посмотрите популярные туры!

С уважением,
Команда Kamchatour Hub
    `,
  };
}
