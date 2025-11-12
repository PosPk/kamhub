'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { Upload, Video, Check, AlertCircle, Copy, ExternalLink, Sunrise, Sun, Sunset, Moon, Cloud } from 'lucide-react';

type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

interface VideoUpload {
  timeOfDay: TimeOfDay;
  label: string;
  icon: any;
  description: string;
  gradient: string;
}

export default function UploadVideoPage() {
  const [mounted, setMounted] = useState(false);
  const [uploads, setUploads] = useState<Record<TimeOfDay, {
    file: File | null;
    preview: string | null;
    result: any | null;
    uploading: boolean;
    error: string | null;
  }>>({
    dawn: { file: null, preview: null, result: null, uploading: false, error: null },
    morning: { file: null, preview: null, result: null, uploading: false, error: null },
    afternoon: { file: null, preview: null, result: null, uploading: false, error: null },
    evening: { file: null, preview: null, result: null, uploading: false, error: null },
    night: { file: null, preview: null, result: null, uploading: false, error: null },
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const hours = new Date().getHours();
  const isNight = hours >= 23 || hours < 5;
  const textColor = isNight ? 'text-white' : 'text-gray-800';
  const textSecondary = isNight ? 'text-white/80' : 'text-gray-600';

  const videoSlots: VideoUpload[] = [
    {
      timeOfDay: 'dawn',
      label: 'Рассвет',
      icon: Sunrise,
      description: '5:00 - 7:00',
      gradient: 'from-pink-500 to-orange-500'
    },
    {
      timeOfDay: 'morning',
      label: 'Утро',
      icon: Sun,
      description: '7:00 - 12:00',
      gradient: 'from-sky-400 to-blue-500'
    },
    {
      timeOfDay: 'afternoon',
      label: 'День',
      icon: Cloud,
      description: '12:00 - 18:00',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      timeOfDay: 'evening',
      label: 'Вечер',
      icon: Sunset,
      description: '18:00 - 21:00',
      gradient: 'from-orange-500 to-purple-500'
    },
    {
      timeOfDay: 'night',
      label: 'Ночь',
      icon: Moon,
      description: '21:00 - 5:00',
      gradient: 'from-indigo-600 to-blue-900'
    }
  ];

  const handleFileChange = (timeOfDay: TimeOfDay, file: File | null) => {
    if (!file) return;

    setUploads(prev => ({
      ...prev,
      [timeOfDay]: {
        ...prev[timeOfDay],
        file,
        preview: URL.createObjectURL(file),
        error: null,
        result: null
      }
    }));
  };

  const handleUpload = async (timeOfDay: TimeOfDay) => {
    const upload = uploads[timeOfDay];
    if (!upload.file) return;

    setUploads(prev => ({
      ...prev,
      [timeOfDay]: { ...prev[timeOfDay], uploading: true, error: null }
    }));

    try {
      const formData = new FormData();
      formData.append('file', upload.file);
      formData.append('timeOfDay', timeOfDay);

      const response = await fetch('/api/upload-video', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      setUploads(prev => ({
        ...prev,
        [timeOfDay]: {
          ...prev[timeOfDay],
          result: data,
          uploading: false
        }
      }));
    } catch (err: any) {
      setUploads(prev => ({
        ...prev,
        [timeOfDay]: {
          ...prev[timeOfDay],
          error: err.message || 'Ошибка при загрузке видео',
          uploading: false
        }
      }));
    }
  };

  return (
    <PageLayout title="Загрузка видео-фонов" backLink="/">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Инструкция */}
        <GlassCard className="p-6" isNight={isNight}>
          <div className="flex items-start gap-3">
            <Video className={`w-6 h-6 ${textColor} mt-1`} />
            <div>
              <h2 className={`text-lg font-medium ${textColor} mb-2`}>
                Загрузите видео для каждого времени суток
              </h2>
              <p className={`${textSecondary} text-sm mb-2`}>
                Поддерживаются форматы: MP4, WEBM
              </p>
              <p className={`${textSecondary} text-sm`}>
                Максимальный размер: 50 MB на видео
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Слоты для видео */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoSlots.map((slot) => {
            const upload = uploads[slot.timeOfDay];
            const Icon = slot.icon;

            return (
              <GlassCard key={slot.timeOfDay} className="p-4" isNight={isNight}>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${slot.gradient} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-base font-medium ${textColor}`}>
                        {slot.label}
                      </h3>
                      <p className={`text-xs ${textSecondary}`}>
                        {slot.description}
                      </p>
                    </div>
                  </div>

                  {/* File input */}
                  <label
                    htmlFor={`video-${slot.timeOfDay}`}
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                      isNight
                        ? 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
                        : 'border-blue-200/40 hover:border-blue-300/60 bg-blue-50/30 hover:bg-blue-100/40'
                    }`}
                  >
                    {upload.preview ? (
                      <video
                        src={upload.preview}
                        className="w-full h-full object-cover rounded-xl"
                        muted
                        loop
                        autoPlay
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className={`w-8 h-8 mb-2 ${textColor}`} />
                        <p className={`text-xs ${textSecondary} text-center px-2`}>
                          Выбрать видео
                        </p>
                      </div>
                    )}
                    <input
                      id={`video-${slot.timeOfDay}`}
                      type="file"
                      className="hidden"
                      accept="video/mp4,video/webm"
                      onChange={(e) => handleFileChange(slot.timeOfDay, e.target.files?.[0] || null)}
                    />
                  </label>

                  {/* File info */}
                  {upload.file && (
                    <div className={`text-xs ${textSecondary} truncate`}>
                      {upload.file.name}
                    </div>
                  )}

                  {/* Error */}
                  {upload.error && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-rose-100/40 border border-rose-200/50">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <p className="text-xs text-rose-700">{upload.error}</p>
                    </div>
                  )}

                  {/* Success */}
                  {upload.result && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-100/40 border border-emerald-200/50">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <p className="text-xs text-emerald-700">Загружено!</p>
                    </div>
                  )}

                  {/* Upload button */}
                  {upload.file && !upload.result && (
                    <button
                      onClick={() => handleUpload(slot.timeOfDay)}
                      disabled={upload.uploading}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-light text-white bg-gradient-to-r ${slot.gradient} hover:opacity-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                        upload.uploading ? 'animate-pulse' : ''
                      }`}
                    >
                      {upload.uploading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
