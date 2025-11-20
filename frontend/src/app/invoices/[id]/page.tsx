'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { Invoice } from '@/lib/types'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function InvoiceDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const invoiceId = params.id as string

  const { data: invoice, isLoading } = useQuery<Invoice>({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await api.get(`/api/invoices/${invoiceId}`)
      return response.data
    },
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/invoices/${invoiceId}/send`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice', invoiceId] })
    },
  })

  const downloadPDF = async () => {
    const response = await api.get(`/api/invoices/${invoiceId}/pdf`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${invoice?.invoice_number}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!invoice) {
    return (
      <DashboardLayout>
        <div>Invoice not found</div>
      </DashboardLayout>
    )
  }

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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{invoice.invoice_number}</h1>
            <Badge variant={getStatusBadgeVariant(invoice.status)} className="mt-2">
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
          <div className="flex gap-3">
            {invoice.status === 'draft' && (
              <Button
                variant="secondary"
                onClick={() => sendMutation.mutate()}
                disabled={sendMutation.isPending}
              >
                {sendMutation.isPending ? 'Sending...' : 'Send Invoice'}
              </Button>
            )}
            <Button variant="primary" onClick={downloadPDF}>
              Download PDF
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Invoice Details</h3>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="text-neutral-600">Issue Date:</span>{' '}
                  <span className="font-medium">{formatDate(invoice.issue_date)}</span>
                </p>
                <p className="text-sm">
                  <span className="text-neutral-600">Due Date:</span>{' '}
                  <span className="font-medium">{formatDate(invoice.due_date)}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Line Items</h3>
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2 text-sm font-medium text-neutral-600">
                    Description
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-neutral-600">Qty</th>
                  <th className="text-right py-2 text-sm font-medium text-neutral-600">
                    Unit Price
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-neutral-600">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm">{item.description}</td>
                    <td className="py-3 text-sm text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-right">
                      {formatCurrency(item.unit_price_cents)}
                    </td>
                    <td className="py-3 text-sm text-right font-medium">
                      {formatCurrency(item.line_total_cents || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-6 mt-6">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax:</span>
                  <span className="font-medium">{formatCurrency(invoice.tax_cents)}</span>
                </div>
                {invoice.discount_cents > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Discount:</span>
                    <span className="font-medium">-{formatCurrency(invoice.discount_cents)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-brand-500">{formatCurrency(invoice.total_cents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Balance Due:</span>
                  <span className="font-semibold text-red-500">
                    {formatCurrency(invoice.balance_due_cents)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-sm font-medium text-neutral-600 mb-2">Notes</h3>
              <p className="text-sm text-neutral-700">{invoice.notes}</p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
