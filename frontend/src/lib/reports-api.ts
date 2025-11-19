import { api } from './api'

export interface ReportFilters {
  budget_ids?: number[]
  category_ids?: number[]
  category_groups?: string[]
  min_amount_cents?: number
  max_amount_cents?: number
}

export interface ReportRequest {
  report_type: 'spending' | 'income' | 'category' | 'trend' | 'comparison'
  date_range_start: string
  date_range_end: string
  filters?: ReportFilters
  group_by?: 'day' | 'week' | 'month' | 'category' | 'budget'
}

export interface CategorySpending {
  category_id: number
  category_name: string
  total_spent_cents: number
  transaction_count: number
  percentage: number
}

export interface MonthlyTrend {
  period: string
  total_cents: number
  transaction_count: number
  avg_transaction_cents: number
}

export interface BudgetComparison {
  budget_id: number
  month: number
  year: number
  income_cents: number
  allocated_cents: number
  spent_cents: number
  remaining_cents: number
  utilization_percentage: number
}

export interface SpendingReport {
  total_spent_cents: number
  transaction_count: number
  avg_transaction_cents: number
  by_category: CategorySpending[]
  trends: MonthlyTrend[]
}

export interface IncomeReport {
  total_income_cents: number
  budget_count: number
  avg_monthly_income_cents: number
  by_month: Array<{
    month: number
    year: number
    income_cents: number
    budget_id: number
  }>
}

export interface CategoryReport {
  category_id: number
  category_name: string
  total_allocated_cents: number
  total_spent_cents: number
  budget_count: number
  avg_allocated_cents: number
  avg_spent_cents: number
  utilization_percentage: number
}

export interface TrendReport {
  period_type: string
  trends: MonthlyTrend[]
  growth_rate: number
  forecast?: Array<{
    period: string
    predicted_cents: number
  }>
}

export interface ComparisonReport {
  budgets: BudgetComparison[]
  total_income_cents: number
  total_spent_cents: number
  avg_utilization: number
}

export interface SavedReport {
  id: number
  user_id: number
  name: string
  report_type: string
  date_range_start: string
  date_range_end: string
  filters?: any
  created_at: string
  updated_at: string
}

export interface DashboardSummary {
  total_spent_cents: number
  total_income_cents: number
  remaining_cents: number
  top_categories: Array<{
    name: string
    total_cents: number
  }>
  monthly_trend: Array<{
    month: string
    total_cents: number
  }>
}

export class ReportsAPI {
  static async generateSpendingReport(request: ReportRequest): Promise<SpendingReport> {
    const response = await api.post('/api/reports/spending', request)
    return response.data
  }

  static async generateIncomeReport(request: ReportRequest): Promise<IncomeReport> {
    const response = await api.post('/api/reports/income', request)
    return response.data
  }

  static async generateCategoryReport(request: ReportRequest): Promise<CategoryReport[]> {
    const response = await api.post('/api/reports/category', request)
    return response.data
  }

  static async generateTrendReport(request: ReportRequest): Promise<TrendReport> {
    const response = await api.post('/api/reports/trends', request)
    return response.data
  }

  static async generateComparisonReport(request: ReportRequest): Promise<ComparisonReport> {
    const response = await api.post('/api/reports/comparison', request)
    return response.data
  }

  static async getDashboardSummary(months: number = 3): Promise<DashboardSummary> {
    const response = await api.get(`/api/reports/dashboard?months=${months}`)
    return response.data
  }

  // Saved reports
  static async createSavedReport(data: {
    name: string
    report_type: string
    date_range_start: string
    date_range_end: string
    filters?: any
  }): Promise<SavedReport> {
    const response = await api.post('/api/reports/saved', data)
    return response.data
  }

  static async listSavedReports(): Promise<SavedReport[]> {
    const response = await api.get('/api/reports/saved')
    return response.data
  }

  static async getSavedReport(reportId: number): Promise<SavedReport> {
    const response = await api.get(`/api/reports/saved/${reportId}`)
    return response.data
  }

  static async updateSavedReport(
    reportId: number,
    data: Partial<SavedReport>
  ): Promise<SavedReport> {
    const response = await api.put(`/api/reports/saved/${reportId}`, data)
    return response.data
  }

  static async deleteSavedReport(reportId: number): Promise<void> {
    await api.delete(`/api/reports/saved/${reportId}`)
  }

  static async runSavedReport(reportId: number): Promise<any> {
    const response = await api.post(`/api/reports/saved/${reportId}/run`)
    return response.data
  }
}

export const ReportUtils = {
  formatCurrency: (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  },

  formatPeriod: (period: string): string => {
    if (period.includes('W')) {
      return period.replace('W', ' Week ')
    }
    const [year, month] = period.split('-')
    if (month) {
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    }
    return period
  },

  getDateRangePresets: () => [
    {
      label: 'Last 30 Days',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - 30)
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      }
    },
    {
      label: 'Last 3 Months',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 3)
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      }
    },
    {
      label: 'Last 6 Months',
      getValue: () => {
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 6)
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      }
    },
    {
      label: 'This Year',
      getValue: () => {
        const now = new Date()
        const start = new Date(now.getFullYear(), 0, 1)
        return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] }
      }
    },
    {
      label: 'Last Year',
      getValue: () => {
        const now = new Date()
        const start = new Date(now.getFullYear() - 1, 0, 1)
        const end = new Date(now.getFullYear() - 1, 11, 31)
        return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] }
      }
    }
  ]
}
