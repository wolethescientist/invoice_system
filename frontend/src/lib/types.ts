export interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  created_at: string
}

export interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  unit_price_cents: number
  tax_rate: number
  line_total_cents?: number
}

export interface Invoice {
  id: number
  customer_id: number
  invoice_number: string
  issue_date: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  subtotal_cents: number
  tax_cents: number
  discount_cents: number
  total_cents: number
  balance_due_cents: number
  pdf_path?: string
  notes?: string
  created_at: string
  items: InvoiceItem[]
}

export interface Payment {
  id: number
  invoice_id: number
  amount_cents: number
  paid_at: string
  method: string
  created_at: string
}

export interface MetricsSummary {
  outstanding_count: number
  outstanding_total_cents: number
  overdue_count: number
  overdue_total_cents: number
  monthly_revenue: { month: string; revenue_cents: number }[]
  top_customers: { id: number; name: string; total_paid_cents: number }[]
}
