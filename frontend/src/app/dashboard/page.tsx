'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { MetricsSummary } from '@/lib/types'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { SkeletonCard } from '@/components/Skeleton'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery<MetricsSummary>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await api.get('/api/metrics/summary')
      return response.data
    },
  })

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Outstanding</div>
              <div className="text-3xl font-bold text-brand-500">
                {formatCurrency(metrics?.outstanding_total_cents || 0)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {metrics?.outstanding_count || 0} invoices
              </div>
            </Card>

            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Overdue</div>
              <div className="text-3xl font-bold text-red-500">
                {formatCurrency(metrics?.overdue_total_cents || 0)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {metrics?.overdue_count || 0} invoices
              </div>
            </Card>

            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Total Invoices</div>
              <div className="text-3xl font-bold text-neutral-900">
                {(metrics?.outstanding_count || 0) + (metrics?.overdue_count || 0)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Active</div>
            </Card>

            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">This Month</div>
              <div className="text-3xl font-bold text-green-500">
                {formatCurrency(
                  metrics?.monthly_revenue[metrics.monthly_revenue.length - 1]?.revenue_cents || 0
                )}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Revenue</div>
            </Card>
          </>
        )}
      </div>

      {!isLoading && metrics && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.monthly_revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${value / 100}`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="revenue_cents" fill="#0B6CF1" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Top Customers</h2>
            <div className="space-y-3">
              {metrics.top_customers.map((customer) => (
                <div key={customer.id} className="flex justify-between items-center">
                  <span className="text-neutral-700">{customer.name}</span>
                  <span className="font-semibold text-brand-500">
                    {formatCurrency(customer.total_paid_cents)}
                  </span>
                </div>
              ))}
              {metrics.top_customers.length === 0 && (
                <p className="text-neutral-500 text-center py-4">No payment data yet</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  )
}
