'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Invoice } from '@/lib/types'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { SkeletonTable } from '@/components/Skeleton'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data: invoices, isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices', statusFilter, search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (search) params.append('q', search)
      const response = await api.get(`/api/invoices?${params}`)
      return response.data
    },
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'sent':
        return 'info'
      case 'overdue':
        return 'error'
      case 'draft':
      default:
        return 'neutral'
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Invoices</h1>
        <Link href="/invoices/new">
          <Button variant="primary">Create Invoice</Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : (
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">
                  Balance
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {invoices?.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {formatDate(invoice.issue_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status.toUpperCase()}</Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    {formatCurrency(invoice.total_cents)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-medium">
                    {formatCurrency(invoice.balance_due_cents)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button variant="ghost" className="text-sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {invoices?.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              No invoices found
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
