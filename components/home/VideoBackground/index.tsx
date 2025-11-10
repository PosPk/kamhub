'use client';

import React, { useState, useEffect } from 'react';

interface VideoBackgroundProps {
  currentHour: number;
  getBackgroundGradient: () => string;
}

export function VideoBackground({ currentHour, getBackgroundGradient }: VideoBackgroundProps) {
  const [mounted, setMounted] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Определяем какое видео показывать
  const getVideoPath = (): string | null => {
    if (currentHour >= 5 && currentHour < 7) return '/videos/video-dawn.mp4';
    if (currentHour >= 7 && currentHour < 12) return '/videos/video-morning.mp4';
    if (currentHour >= 12 && currentHour < 18) return '/videos/video-afternoon.mp4';
    if (currentHour >= 18 && currentHour < 21) return '/videos/video-evening.mp4';
    if (currentHour >= 21 || currentHour < 5) return '/videos/video-night.mp4';
    return null;
  };

  const videoPath = getVideoPath();

  // Если нет видео, показываем статичное изображение
  const fallbackImage = '/uploads/fon-1762759253594.jpg';

  return (
    <div className="absolute inset-0 z-0">
      {!videoError && videoPath ? (
        <>
          <video
            key={videoPath}
            src={videoPath}
            className="w-full h-full object-contain lg:object-cover"
            style={{ objectPosition: 'center top' }}
            autoPlay
            loop
            muted
            playsInline
            onError={() => {
              console.warn(`Video not found: ${videoPath}, falling back to image`);
              setVideoError(true);
            }}
          />
          {/* Gradient overlay для читаемости */}
          <div className={`absolute inset-0 ${getBackgroundGradient()} bg-gradient-to-br opacity-40 transition-opacity duration-1000`}></div>
        </>
      ) : (
        <>
          {/* Fallback to image */}
          <img 
            src={fallbackImage}
            alt="Kamchatka"
            className="w-full h-full object-contain lg:object-cover"
            style={{ objectPosition: 'center top' }}
          />
          {/* Gradient overlay для читаемости */}
          <div className={`absolute inset-0 ${getBackgroundGradient()} bg-gradient-to-br opacity-60 transition-opacity duration-1000`}></div>
        </>
      )}
    </div>
  );
}
