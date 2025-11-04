export const metadata = {
  title: 'Kamchatour Hub - Экосистема туризма Камчатки',
  description: 'Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.',
}

import './globals.css'
import React from 'react'
import { RoleProvider } from '@/contexts/RoleContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { OrdersProvider } from '@/contexts/OrdersContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-white dark:bg-premium-black text-gray-900 dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            <RoleProvider>
              <OrdersProvider>
              <header className="sticky top-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/80 dark:bg-premium-black/80 backdrop-blur transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-gold-gradient" />
                    <b className="text-premium-gold">Kamchatour Hub</b>
                  </div>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <a href="/auth/login" className="text-gold hover:text-gold/80 transition-colors">Войти</a>
                    <a href="/operator" className="text-gold hover:text-gold/80 transition-colors">CRM</a>
                    <a href="/tg" className="button-gold">Витрина</a>
                  </div>
                </div>
              </header>
              <main className="max-w-6xl mx-auto px-4">{children}</main>
              </OrdersProvider>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

