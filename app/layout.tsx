export const metadata = {
  title: 'Kamchatour Hub - Экосистема туризма Камчатки',
  description: 'Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.',
}

import './globals.css'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-premium-black text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-premium-black/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gold-gradient" />
              <b className="text-premium-gold">Kamchatour Hub</b>
            </div>
            <a href="/tg" className="button-gold">Витрина</a>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4">{children}</main>
      </body>
    </html>
  )
}

