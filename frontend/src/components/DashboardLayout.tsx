'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from './Button'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <nav className="bg-white shadow-soft">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-2xl font-bold text-brand-500">
              InvoiceDemo
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard" className="text-neutral-700 hover:text-brand-500">
                Dashboard
              </Link>
              <Link href="/invoices" className="text-neutral-700 hover:text-brand-500">
                Invoices
              </Link>
              <Link href="/customers" className="text-neutral-700 hover:text-brand-500">
                Customers
              </Link>
            </div>
          </div>
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </nav>
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
