'use client';

import React, { useMemo } from 'react';
import { CloudSnow, Sunrise } from 'lucide-react';

interface WeatherAnimationsProps {
  condition: string;
  isNight: boolean;
  isDawn?: boolean;
}

export function WeatherAnimations({ condition, isNight, isDawn = false }: WeatherAnimationsProps) {
  // Мемоизация анимаций - создаются только при смене погоды
  const animations = useMemo(() => {
    // ОПТИМИЗИРОВАНО: уменьшено количество элементов
    
    // 🌅 РАССВЕТ (5:00-7:00): восходящее солнце
    if (isDawn && condition === 'clear') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Восходящее солнце */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-sunrise"
            style={{ width: '200px', height: '200px' }}
          >
            <div className="relative w-full h-full">
              {/* Солнце */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-300 via-yellow-200 to-pink-200 animate-dawn-glow"></div>
              {/* Лучи */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-1 h-20 bg-gradient-to-t from-orange-200/40 to-transparent origin-bottom"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${i * 30}deg)`,
                    animation: `pulse ${2 + Math.random()}s ease-in-out infinite`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Розовые облака рассвета */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute opacity-30 animate-float-delayed"
              style={{
                left: `${10 + i * 20}%`,
                top: `${20 + Math.random() * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            >
              <div className="w-32 h-12 bg-gradient-to-r from-pink-200/50 via-orange-100/50 to-rose-200/50 rounded-full blur-xl"></div>
            </div>
          ))}
        </div>
      );
    }
    
    // Звезды (ясная ночь) - 40 вместо 100
    if (condition === 'clear' && isNight) {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-pulse" 
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              <div className="w-1 h-1 bg-white/80 rounded-full" />
            </div>
          ))}
        </div>
      );
    }

    // Снег - 25 вместо 50
    if (condition === 'snow') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-snow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 5}s`
              }}
            >
              <CloudSnow className="w-3 h-3 text-white/60" />
            </div>
          ))}
        </div>
      );
    }

    // Дождь - 40 вместо 100
    if (condition === 'rain') {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-snow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              <div className="w-0.5 h-4 bg-blue-400/40" />
            </div>
          ))}
        </div>
      );
    }

    // Ветер - 10 линий + 20 частиц вместо 15 + 30
    if (condition === 'clouds' || condition === 'wind') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Волнистые линии ветра */}
          {[...Array(10)].map((_, i) => (
            <div 
              key={i} 
              className="absolute animate-wind-flow"
              style={{
                top: `${10 + i * 8}%`,
                left: `-20%`,
                width: '150%',
                height: '2px',
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${4 + Math.random() * 2}s`
              }}
            >
              <svg width="100%" height="100%" className="opacity-20">
                <path
                  d={`M 0 0 Q ${50 + Math.random() * 100} ${-10 + Math.random() * 20}, ${100 + Math.random() * 100} 0 T ${200 + Math.random() * 100} 0`}
                  stroke={isNight ? 'rgba(255,255,255,0.3)' : 'rgba(100,100,100,0.3)'}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,10"
                />
              </svg>
            </div>
          ))}
          
          {/* Частицы */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={`particle-${i}`} 
              className="absolute animate-wind-particle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `-5%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 3}s`
              }}
            >
              <div 
                className="w-1 h-1 rounded-full opacity-40"
                style={{
                  background: isNight ? 'rgba(255,255,255,0.6)' : 'rgba(120,120,120,0.6)',
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    return null;
  }, [condition, isNight]);

  return animations;
}
