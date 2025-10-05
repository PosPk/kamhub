export const metadata = {
  title: 'Kamhub',
  description: 'Экосистема туризма Камчатки',
}

import './globals.css'
import React from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-black text-white">
        <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/80 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gold-gradient" />
              <b>Kamchatour Hub</b>
            </div>
            <a href="/tg" className="button-gold">Витрина</a>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4">{children}</main>
      </body>
    </html>
  )
}

