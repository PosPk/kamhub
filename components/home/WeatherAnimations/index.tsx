'use client';

import React, { useMemo } from 'react';
import { CloudSnow } from 'lucide-react';

interface WeatherAnimationsProps {
  condition: string;
  isNight: boolean;
}

export function WeatherAnimations({ condition, isNight }: WeatherAnimationsProps) {
  // Мемоизация анимаций - создаются только при смене погоды
  const animations = useMemo(() => {
    // ОПТИМИЗИРОВАНО: уменьшено количество элементов
    
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
