'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle, X, Copy, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function UploadSamplePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Проверка типа файла
    if (!selectedFile.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Файл слишком большой. Максимум 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Предварительный просмотр
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'sample');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setUploadedUrl(data.url);
      } else {
        setError(data.error || 'Ошибка загрузки');
      }
    } catch (err) {
      setError('Ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setUploadedUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-cyan-200 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 mb-4 font-medium">
            <X className="w-5 h-5" />
            Назад на главную
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 drop-shadow-sm">
            Загрузка образца иконок
          </h1>
          <p className="text-gray-700">
            Загрузите изображение с образцом иконок для дизайна
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white/70 border-2 border-white/50 backdrop-blur-xl rounded-2xl shadow-lg p-8">
          {!uploadedUrl ? (
            <>
              {/* File Input */}
              <div className="mb-6">
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-blue-200/40 border-dashed rounded-xl cursor-pointer bg-sky-50/50 hover:bg-sky-100/60 transition-all"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-12 h-12 text-blue-600 mb-3" />
                    <p className="mb-2 text-sm font-medium text-blue-900">
                      <span className="font-bold">Нажмите для выбора</span> или перетащите файл
                    </p>
                    <p className="text-xs text-blue-700">
                      PNG, JPG, WEBP до 10MB
                    </p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {/* Preview */}
              {preview && (
                <div className="mb-6">
                  <p className="text-sm font-bold text-gray-900 mb-3 drop-shadow-sm">
                    Предварительный просмотр:
                  </p>
                  <div className="relative bg-white/60 border-2 border-white/50 rounded-xl p-4 shadow-sm">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-auto rounded-lg"
                    />
                    <button
                      onClick={reset}
                      className="absolute top-2 right-2 p-2 bg-rose-100/80 hover:bg-rose-200/80 text-rose-700 rounded-full transition-colors shadow-md"
                      title="Удалить"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* File Info */}
              {file && (
                <div className="mb-6 p-4 bg-blue-50/60 border border-blue-200/40 rounded-xl">
                  <p className="text-sm font-medium text-blue-900">
                    <strong>Файл:</strong> {file.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Размер:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-6 p-4 bg-rose-100/60 border border-rose-200/60 rounded-xl">
                  <p className="text-sm font-medium text-rose-800">{error}</p>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Загрузить образец
                  </>
                )}
              </button>
            </>
          ) : (
            /* Success */
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100/60 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-200/60">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 drop-shadow-sm">
                Образец загружен!
              </h2>
              <p className="text-gray-700 mb-6">
                Теперь я вижу образец и могу сделать иконки в этом стиле
              </p>

              {/* Preview uploaded */}
              <div className="mb-6 bg-white/60 border-2 border-white/50 rounded-xl p-4 shadow-sm">
                <img
                  src={uploadedUrl}
                  alt="Uploaded sample"
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* URL */}
              <div className="mb-6 p-4 bg-sky-50/60 border border-blue-200/40 rounded-xl">
                <p className="text-sm font-medium text-blue-900 mb-2">URL образца:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={uploadedUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white/70 border-2 border-white/50 rounded-lg text-sm text-gray-900 font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 bg-blue-100/60 hover:bg-blue-200/70 text-blue-700 rounded-lg transition-colors border border-blue-200/40"
                    title="Копировать"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={reset}
                  className="flex-1 bg-white/70 border-2 border-white/50 hover:bg-white/90 text-gray-900 font-bold py-3 px-6 rounded-xl transition-all shadow-sm"
                >
                  Загрузить другой
                </button>
                <Link
                  href="/"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-6 rounded-xl transition-all text-center shadow-lg"
                >
                  Готово
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-blue-700">
          <p>
            Загрузите изображение с образцом стиля иконок.<br />
            Я проанализирую образец и применю этот стиль ко всем иконкам в проекте.
          </p>
        </div>
      </div>
    </div>
  );
}
