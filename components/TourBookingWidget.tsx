'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// =====================================================
// ТИПЫ
// =====================================================

interface TourSchedule {
  id: string;
  tourId: string;
  tourTitle: string;
  startDate: string;
  departureTime: string;
  returnTime?: string;
  pricePerPerson: number;
  availableSlots: number;
  maxParticipants: number;
  minParticipants: number;
  status: string;
  meetingPoint?: string;
}

interface Availability {
  available: boolean;
  slotsLeft: number;
  activeHolds: number;
  scheduleInfo?: {
    maxParticipants: number;
    minParticipants: number;
    currentBookings: number;
    status: string;
    pricePerPerson: number;
  };
}

interface TourBookingWidgetProps {
  schedule: TourSchedule;
  userId?: string;
  className?: string;
  onBookingSuccess?: (booking: any) => void;
  onBookingError?: (error: string) => void;
}

interface ParticipantForm {
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

// =====================================================
// КОМПОНЕНТ
// =====================================================

export function TourBookingWidget({
  schedule,
  userId,
  className,
  onBookingSuccess,
  onBookingError
}: TourBookingWidgetProps) {
  // State
  const [step, setStep] = useState<'select' | 'details' | 'confirm' | 'processing'>('select');
  const [participantsCount, setParticipantsCount] = useState(1);
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  
  const [holdId, setHoldId] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [holdTimer, setHoldTimer] = useState<number>(0);
  
  // Форма контактов
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Форма участников
  const [participants, setParticipants] = useState<ParticipantForm[]>([]);
  
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const totalPrice = schedule.pricePerPerson * participantsCount;
  
  // =====================================================
  // ЭФФЕКТЫ
  // =====================================================
  
  // Проверка доступности при изменении количества участников
  useEffect(() => {
    if (participantsCount > 0) {
      checkAvailability();
    }
  }, [participantsCount]);
  
  // Таймер для hold
  useEffect(() => {
    if (holdExpiresAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = holdExpiresAt.getTime() - now.getTime();
        const seconds = Math.max(0, Math.floor(diff / 1000));
        setHoldTimer(seconds);
        
        if (seconds === 0) {
          clearInterval(interval);
          releaseHoldAndReset();
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [holdExpiresAt]);
  
  // =====================================================
  // ФУНКЦИИ
  // =====================================================
  
  const checkAvailability = useCallback(async () => {
    setIsCheckingAvailability(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/tours/availability?scheduleId=${schedule.id}&participantsCount=${participantsCount}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to check availability');
      }
      
      const data = await response.json();
      setAvailability(data.data);
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Ошибка проверки доступности');
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [schedule.id, participantsCount]);
  
  const handleHoldSeats = async () => {
    if (!userId) {
      setError('Необходимо войти в систему');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/tours/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: schedule.id,
          userId,
          participantsCount,
          timeoutMinutes: 15
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to hold seats');
      }
      
      setHoldId(data.hold.id);
      setHoldExpiresAt(new Date(data.hold.expiresAt));
      setStep('details');
    } catch (err: any) {
      console.error('Error holding seats:', err);
      setError(err.message || 'Ошибка блокировки мест');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const releaseHoldAndReset = async () => {
    if (holdId) {
      try {
        await fetch('/api/tours/hold', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ holdId })
        });
      } catch (err) {
        console.error('Error releasing hold:', err);
      }
    }
    
    setHoldId(null);
    setHoldExpiresAt(null);
    setStep('select');
  };
  
  const handleBook = async () => {
    if (!userId) {
      setError('Необходимо войти в систему');
      return;
    }
    
    // Валидация
    if (!contactName || !contactPhone || !contactEmail) {
      setError('Заполните все обязательные поля');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    setStep('processing');
    
    try {
      const response = await fetch('/api/tours/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: schedule.id,
          userId,
          participantsCount,
          adultsCount,
          childrenCount,
          contactInfo: {
            name: contactName,
            phone: contactPhone,
            email: contactEmail
          },
          participantsDetails: participants.length > 0 ? participants : undefined,
          specialRequests: specialRequests || undefined,
          dietaryRequirements: dietaryRequirements.length > 0 ? dietaryRequirements : undefined,
          medicalConditions: medicalConditions.length > 0 ? medicalConditions : undefined,
          source: 'web'
        })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create booking');
      }
      
      // Успех!
      if (onBookingSuccess) {
        onBookingSuccess(data.booking);
      }
      
      // Очищаем hold (он уже конвертирован в booking)
      setHoldId(null);
      setHoldExpiresAt(null);
      
    } catch (err: any) {
      console.error('Error creating booking:', err);
      const errorMsg = err.message || 'Ошибка создания бронирования';
      setError(errorMsg);
      if (onBookingError) {
        onBookingError(errorMsg);
      }
      setStep('details');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  // =====================================================
  // РЕНДЕР
  // =====================================================
  
  return (
    <div className={cn('bg-white/5 border border-white/10 rounded-2xl p-6', className)}>
      {/* Заголовок */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{schedule.tourTitle}</h3>
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>📅 {new Date(schedule.startDate).toLocaleDateString('ru-RU')}</span>
          <span>⏰ {schedule.departureTime}</span>
          <span>💰 {schedule.pricePerPerson.toLocaleString('ru-RU')} ₽/чел</span>
        </div>
      </div>
      
      {/* Hold таймер */}
      {holdExpiresAt && (
        <div className="mb-4 p-4 bg-premium-gold/20 border border-premium-gold rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-premium-gold font-bold">Места заблокированы</span>
            <span className="text-premium-gold text-xl font-mono">{formatTime(holdTimer)}</span>
          </div>
          <div className="text-sm text-white/70 mt-1">
            Завершите бронирование до истечения времени
          </div>
        </div>
      )}
      
      {/* Ошибка */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-400">
          {error}
        </div>
      )}
      
      {/* Шаг 1: Выбор количества участников */}
      {step === 'select' && (
        <div>
          <div className="mb-6">
            <label className="block text-white font-bold mb-2">Количество участников</label>
            
            {/* Взрослые */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70">Взрослые (18+)</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newCount = Math.max(0, adultsCount - 1);
                    setAdultsCount(newCount);
                    setParticipantsCount(newCount + childrenCount);
                  }}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-white font-bold w-8 text-center">{adultsCount}</span>
                <button
                  onClick={() => {
                    const newCount = adultsCount + 1;
                    setAdultsCount(newCount);
                    setParticipantsCount(newCount + childrenCount);
                  }}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                  disabled={participantsCount >= schedule.maxParticipants}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Дети */}
            <div className="flex items-center justify-between">
              <span className="text-white/70">Дети (до 18)</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const newCount = Math.max(0, childrenCount - 1);
                    setChildrenCount(newCount);
                    setParticipantsCount(adultsCount + newCount);
                  }}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-white font-bold w-8 text-center">{childrenCount}</span>
                <button
                  onClick={() => {
                    const newCount = childrenCount + 1;
                    setChildrenCount(newCount);
                    setParticipantsCount(adultsCount + newCount);
                  }}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center"
                  disabled={participantsCount >= schedule.maxParticipants}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          {/* Доступность */}
          {availability && (
            <div className="mb-6 p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Доступно мест:</span>
                <span className={cn(
                  'font-bold',
                  availability.available ? 'text-green-400' : 'text-red-400'
                )}>
                  {availability.slotsLeft}
                </span>
              </div>
              {availability.activeHolds > 0 && (
                <div className="text-sm text-white/50 mt-1">
                  (еще {availability.activeHolds} блокировок активны)
                </div>
              )}
            </div>
          )}
          
          {/* Цена */}
          <div className="mb-6 p-4 bg-premium-gold/10 border border-premium-gold rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold">Итого:</span>
              <span className="text-premium-gold text-2xl font-black">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
          
          {/* Кнопка */}
          <button
            onClick={handleHoldSeats}
            disabled={isProcessing || !availability?.available || participantsCount === 0}
            className="w-full bg-premium-gold hover:bg-premium-gold/90 disabled:bg-white/10 disabled:cursor-not-allowed text-premium-black font-bold py-4 px-6 rounded-xl transition-all"
          >
            {isProcessing ? 'Блокируем места...' : 'Продолжить →'}
          </button>
        </div>
      )}
      
      {/* Шаг 2: Детали бронирования */}
      {step === 'details' && (
        <div>
          <h4 className="text-xl font-bold text-white mb-4">Контактная информация</h4>
          
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Ваше имя *"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-premium-gold"
            />
            <input
              type="tel"
              placeholder="Телефон *"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-premium-gold"
            />
            <input
              type="email"
              placeholder="Email *"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-premium-gold"
            />
            <textarea
              placeholder="Особые пожелания (опционально)"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-premium-gold"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={releaseHoldAndReset}
              disabled={isProcessing}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl"
            >
              ← Назад
            </button>
            <button
              onClick={handleBook}
              disabled={isProcessing || !contactName || !contactPhone || !contactEmail}
              className="flex-1 bg-premium-gold hover:bg-premium-gold/90 disabled:bg-white/10 disabled:cursor-not-allowed text-premium-black font-bold py-3 px-4 rounded-xl"
            >
              Забронировать
            </button>
          </div>
        </div>
      )}
      
      {/* Шаг 3: Обработка */}
      {step === 'processing' && (
        <div className="py-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-premium-gold border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Создаем бронирование...</p>
        </div>
      )}
    </div>
  );
}
