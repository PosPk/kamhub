'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';
import { GlassCard } from '@/components/GlassCard';
import { Upload, Image as ImageIcon, Check, AlertCircle, Copy, ExternalLink } from 'lucide-react';

export default function UploadPage() {
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    filename: string;
    size: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      
      // Создаем превью
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = () => {
    if (result) {
      const fullUrl = `${window.location.origin}${result.url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <PageLayout title="Загрузка фона" backLink="/">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Инструкция */}
        <GlassCard className="p-6" isNight={isNight}>
          <div className="flex items-start gap-3">
            <ImageIcon className={`w-6 h-6 ${textColor} mt-1`} />
            <div>
              <h2 className={`text-lg font-medium ${textColor} mb-2`}>
                Загрузите фон для главной страницы
              </h2>
              <p className={`${textSecondary} text-sm mb-2`}>
                Поддерживаются форматы: JPG, PNG, WEBP
              </p>
              <p className={`${textSecondary} text-sm`}>
                Максимальный размер: 10 MB
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Форма загрузки */}
        <GlassCard className="p-6" isNight={isNight}>
          <div className="space-y-4">
            {/* File input */}
            <div>
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isNight
                    ? 'border-white/30 hover:border-white/50 bg-white/5 hover:bg-white/10'
                    : 'border-blue-200/40 hover:border-blue-300/60 bg-blue-50/30 hover:bg-blue-100/40'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className={`w-10 h-10 mb-3 ${textColor}`} />
                  <p className={`mb-2 text-sm ${textColor}`}>
                    <span className="font-semibold">Нажмите для выбора</span> или перетащите файл
                  </p>
                  <p className={`text-xs ${textSecondary}`}>
                    JPG, PNG или WEBP (макс. 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="space-y-3">
                <h3 className={`text-sm font-medium ${textColor}`}>Превью:</h3>
                <div className="relative w-full h-64 rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={`text-xs ${textSecondary}`}>
                  {file?.name} • {(file!.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-100/40 border border-rose-200/50">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Upload button */}
            {file && !result && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full py-3 px-4 rounded-xl font-light text-white bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  uploading ? 'animate-pulse' : ''
                }`}
              >
                {uploading ? 'Загрузка...' : 'Загрузить фон'}
              </button>
            )}
          </div>
        </GlassCard>

        {/* Result */}
        {result && (
          <GlassCard className="p-6" isNight={isNight}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <h3 className={`text-lg font-light ${textColor}`}>
                  Файл успешно загружен!
                </h3>
              </div>

              {/* Preview result */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden">
                <img
                  src={result.url}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* URL */}
              <div className="space-y-2">
                <label className={`text-sm font-medium ${textColor}`}>
                  Ссылка на файл:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}${result.url}`}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-mono ${
                      isNight
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-sky-50/50 text-blue-900 border border-blue-200/40'
                    }`}
                  />
                  <button
                    onClick={handleCopyUrl}
                    className={`px-4 py-2 rounded-xl transition-all shadow-sm ${
                      copied
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                        : isNight
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 border border-blue-200/40'
                    }`}
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl transition-all shadow-sm ${
                      isNight
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        : 'bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 border border-blue-200/40'
                    }`}
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Info */}
              <div className={`text-sm ${textSecondary} space-y-1`}>
                <div>Имя файла: {result.filename}</div>
                <div>Размер: {(result.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>

              {/* New upload */}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setResult(null);
                }}
                className={`w-full py-2 px-4 rounded-xl text-sm font-light transition-all shadow-sm ${
                  isNight
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-blue-50/50 hover:bg-blue-100/60 text-blue-700 border border-blue-200/40'
                }`}
              >
                Загрузить другой файл
              </button>
            </div>
          </GlassCard>
        )}
      </div>
    </PageLayout>
  );
}
