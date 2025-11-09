import { Suspense } from 'react';
import { KamchatourWeatherHome } from '@/components/samsung-weather-home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
          <div className="text-white text-2xl font-light">Загрузка...</div>
        </div>
      }>
        <KamchatourWeatherHome />
      </Suspense>
    </main>
  );
}
