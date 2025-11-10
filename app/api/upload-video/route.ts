import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const timeOfDay = formData.get('timeOfDay') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    if (!timeOfDay) {
      return NextResponse.json(
        { error: 'Не указано время суток' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    const allowedTypes = ['video/mp4', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Разрешены только видео MP4 и WEBM' },
        { status: 400 }
      );
    }

    // Проверка размера (макс 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Видео слишком большое (максимум 50MB)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем директорию если не существует
    const uploadDir = path.join(process.cwd(), 'public', 'videos');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Директория уже существует
    }

    // Генерируем имя файла: video-{timeOfDay}.{ext}
    const ext = path.extname(file.name);
    const filename = `video-${timeOfDay}${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Сохраняем файл
    await writeFile(filepath, buffer);

    // Формируем URL для доступа
    const fileUrl = `/videos/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      timeOfDay: timeOfDay,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке видео' },
      { status: 500 }
    );
  }
}
