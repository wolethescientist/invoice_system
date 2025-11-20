'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from './Button'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', gradient: 'from-blue-500 to-blue-600' },
  { name: 'Budgets', href: '/budgets', icon: '💰', gradient: 'from-green-500 to-green-600' },
  { name: 'Transactions', href: '/transactions', icon: '💳', gradient: 'from-purple-500 to-purple-600' },
  { name: 'Sinking Funds', href: '/sinking-funds', icon: '🏦', gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'Paychecks', href: '/paychecks', icon: '💵', gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'Financial Goals', href: '/financial-roadmap', icon: '🎯', gradient: 'from-orange-500 to-orange-600' },
  { name: 'Net Worth', href: '/net-worth', icon: '📈', gradient: 'from-pink-500 to-pink-600' },
  { name: 'Reports', href: '/reports', icon: '📑', gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'Invoices', href: '/invoices', icon: '🧾', gradient: 'from-yellow-500 to-yellow-600' },
  { name: 'Customers', href: '/customers', icon: '👥', gradient: 'from-red-500 to-red-600' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-brand-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4 animate-pulse">
            H
          </div>
          <div className="text-neutral-600">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-brand-50">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 z-40 h-screen glass border-r border-white/20 shadow-large"
        style={{ width: '280px' }}
      >
        <div className="h-full flex flex-col backdrop-blur-xl bg-white/90">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-200/50">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-medium"
              >
                H
              </motion.div>
              <div>
                <span className="text-2xl font-bold gradient-text block">Hikey</span>
                <span className="text-xs text-neutral-500">Financial Manager</span>
              </div>
            </Link>
          </div>

          {/* Quick Search */}
          <div className="p-4 border-b border-neutral-200/50">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-600 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Quick search...</span>
              <kbd className="ml-auto px-2 py-0.5 text-xs bg-white rounded border border-neutral-300">⌘K</kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-medium'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl"
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        />
                      )}
                      <span className="text-xl relative z-10">{item.icon}</span>
                      <span className="font-medium relative z-10">{item.name}</span>
                      {!isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-xl`} />
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-200/50">
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full justify-start text-neutral-700 hover:bg-neutral-100"
              leftIcon={<span className="text-xl">🚪</span>}
            >
              Logout
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Top bar */}
        <header className="glass border-b border-white/20 sticky top-0 z-30 backdrop-blur-xl bg-white/80">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-50 to-brand-100 border border-brand-200">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-brand-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-700 transition-colors relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 p-4"
            >
              <div className="glass rounded-2xl shadow-large p-4 bg-white/95 backdrop-blur-xl">
                <input
                  type="text"
                  placeholder="Search for pages, features, or actions..."
                  className="w-full px-4 py-3 bg-transparent border-none outline-none text-lg"
                  autoFocus
                />
                <div className="mt-4 space-y-2">
                  {navigation.slice(0, 5).map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
