export const metadata = {
  title: 'Kamchatour Hub - Экосистема туризма Камчатки',
  description: 'Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.',
}

import './globals.css'
import React from 'react'
import { RoleProvider } from '@/contexts/RoleContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { OrdersProvider } from '@/contexts/OrdersContext'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-premium-black text-white">
        <AuthProvider>
          <RoleProvider>
            <OrdersProvider>
              <header className="sticky top-0 z-50 border-b border-white/10 bg-premium-black/80 backdrop-blur">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                  <a href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                    <img src="/logo-tourhub.svg" alt="Tourhub" className="h-8" />
                  </a>
                  <div className="flex items-center gap-4">
                    <a href="/tours" className="text-gold hover:text-gold/80 transition-colors hidden md:inline">Туры</a>
                    <a href="/auth/login" className="text-gold hover:text-gold/80 transition-colors">Войти</a>
                    <a href="/operator" className="text-gold hover:text-gold/80 transition-colors hidden md:inline">CRM</a>
                    <a href="/tg" className="button-gold">Витрина</a>
                  </div>
                </div>
              </header>
              <main className="max-w-6xl mx-auto px-4">{children}</main>
            </OrdersProvider>
          </RoleProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

