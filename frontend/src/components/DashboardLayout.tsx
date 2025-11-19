'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from './Button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Budgets', href: '/budgets', icon: '💰' },
  { name: 'Transactions', href: '/transactions', icon: '💳' },
  { name: 'Sinking Funds', href: '/sinking-funds', icon: '🏦' },
  { name: 'Paychecks', href: '/paychecks', icon: '💵' },
  { name: 'Financial Goals', href: '/financial-roadmap', icon: '🎯' },
  { name: 'Net Worth', href: '/net-worth', icon: '📈' },
  { name: 'Reports', href: '/reports', icon: '📑' },
  { name: 'Invoices', href: '/invoices', icon: '🧾' },
  { name: 'Customers', href: '/customers', icon: '👥' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-white border-r border-neutral-200`}
        style={{ width: '280px' }}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-200">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                H
              </div>
              <span className="text-2xl font-bold text-neutral-900">Hikey</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-600 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-200">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-neutral-700 hover:bg-neutral-100"
            >
              <span className="text-xl mr-3">🚪</span>
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-neutral-600">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
