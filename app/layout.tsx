export const metadata = {
  title: 'Kamchatour Hub - Экосистема туризма Камчатки',
  description: 'Туры, партнёры, CRM, бронирование, безопасность, рефералы и экология — в едином центре.',
  icons: {
    icon: '/favicon.ico',
  },
}

import './globals.css'
import React from 'react'
import Link from 'next/link'
import { RoleProvider } from '@/contexts/RoleContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { OrdersProvider } from '@/contexts/OrdersContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <RoleProvider>
              <OrdersProvider>
                <header className="sticky top-0 z-50 border-b backdrop-blur-lg bg-primary/80 border-color">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                        K
                      </div>
                      <div>
                        <div className="font-bold text-lg text-primary">Kamchatour Hub</div>
                        <div className="text-xs text-tertiary">Экосистема туризма</div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-4">
                      <Link href="/auth/login" className="accent-primary hover:underline transition-all">
                        Войти
                      </Link>
                      <Link href="/hub/operator" className="accent-primary hover:underline transition-all">
                        CRM
                      </Link>
                      <Link href="/demo" className="btn-primary">
                        Демо
                      </Link>
                      <ThemeToggle />
                    </div>
                  </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6">{children}</main>
              </OrdersProvider>
            </RoleProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
