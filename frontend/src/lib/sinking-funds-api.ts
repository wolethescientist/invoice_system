import { api } from './api'

export interface SinkingFund {
  id: number
  user_id: number
  name: string
  target_cents: number
  current_balance_cents: number
  monthly_contribution_cents: number
  target_date?: string
  description?: string
  color?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SinkingFundContribution {
  id: number
  fund_id: number
  amount_cents: number
  contribution_date: string
  notes?: string
  created_at: string
}

export interface SinkingFundWithContributions extends SinkingFund {
  contributions: SinkingFundContribution[]
}

export interface SinkingFundProgress {
  fund: SinkingFund
  progress_percentage: number
  remaining_cents: number
  months_to_target?: number
  on_track: boolean
  total_contributed_cents: number
  contribution_count: number
}

export interface SinkingFundSummary {
  total_funds: number
  total_target_cents: number
  total_saved_cents: number
  total_remaining_cents: number
  overall_progress_percentage: number
  active_funds: number
}

export interface CreateSinkingFundData {
  name: string
  target_cents: number
  monthly_contribution_cents?: number
  target_date?: string
  description?: string
  color?: string
}

export interface UpdateSinkingFundData {
  name?: string
  target_cents?: number
  monthly_contribution_cents?: number
  target_date?: string
  description?: string
  color?: string
  is_active?: boolean
}

export interface CreateContributionData {
  amount_cents: number
  contribution_date?: string
  notes?: string
}

export class SinkingFundsAPI {
  /**
   * Create a new sinking fund
   */
  static async createFund(data: CreateSinkingFundData): Promise<SinkingFund> {
    const response = await api.post('/api/sinking-funds', data)
    return response.data
  }

  /**
   * List all sinking funds
   */
  static async listFunds(includeInactive = false): Promise<SinkingFund[]> {
    const params = new URLSearchParams()
    if (includeInactive) params.append('include_inactive', 'true')
    
    const response = await api.get(`/api/sinking-funds?${params}`)
    return response.data
  }

  /**
   * Get summary of all sinking funds
   */
  static async getSummary(): Promise<SinkingFundSummary> {
    const response = await api.get('/api/sinking-funds/summary')
    return response.data
  }

  /**
   * Get a specific sinking fund with contributions
   */
  static async getFund(
    fundId: number,
    includeContributions = true,
    contributionLimit = 50
  ): Promise<SinkingFundWithContributions> {
    const params = new URLSearchParams()
    params.append('include_contributions', includeContributions.toString())
    params.append('contribution_limit', contributionLimit.toString())
    
    const response = await api.get(`/api/sinking-funds/${fundId}?${params}`)
    return response.data
  }

  /**
   * Get progress information for a fund
   */
  static async getFundProgress(fundId: number): Promise<SinkingFundProgress> {
    const response = await api.get(`/api/sinking-funds/${fundId}/progress`)
    return response.data
  }

  /**
   * Update a sinking fund
   */
  static async updateFund(
    fundId: number,
    data: UpdateSinkingFundData
  ): Promise<SinkingFund> {
    const response = await api.put(`/api/sinking-funds/${fundId}`, data)
    return response.data
  }

  /**
   * Delete a sinking fund
   */
  static async deleteFund(fundId: number): Promise<void> {
    await api.delete(`/api/sinking-funds/${fundId}`)
  }

  /**
   * Add a contribution to a fund
   */
  static async addContribution(
    fundId: number,
    data: CreateContributionData
  ): Promise<SinkingFundContribution> {
    const response = await api.post(`/api/sinking-funds/${fundId}/contributions`, data)
    return response.data
  }

  /**
   * List contributions for a fund
   */
  static async listContributions(
    fundId: number,
    limit = 50,
    offset = 0
  ): Promise<SinkingFundContribution[]> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    params.append('offset', offset.toString())
    
    const response = await api.get(`/api/sinking-funds/${fundId}/contributions?${params}`)
    return response.data
  }

  /**
   * Delete a contribution
   */
  static async deleteContribution(fundId: number, contributionId: number): Promise<void> {
    await api.delete(`/api/sinking-funds/${fundId}/contributions/${contributionId}`)
  }
}

// Utility functions for sinking funds
export const SinkingFundUtils = {
  /**
   * Format currency from cents
   */
  formatCurrency: (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  },

  /**
   * Calculate progress percentage
   */
  calculateProgress: (currentCents: number, targetCents: number): number => {
    if (targetCents === 0) return 0
    return Math.min((currentCents / targetCents) * 100, 100)
  },

  /**
   * Calculate months to target
   */
  calculateMonthsToTarget: (
    remainingCents: number,
    monthlyContributionCents: number
  ): number | null => {
    if (monthlyContributionCents === 0 || remainingCents <= 0) return null
    return Math.ceil(remainingCents / monthlyContributionCents)
  },

  /**
   * Format date
   */
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  },

  /**
   * Get progress color based on percentage
   */
  getProgressColor: (percentage: number): string => {
    if (percentage >= 100) return 'text-green-600'
    if (percentage >= 75) return 'text-blue-600'
    if (percentage >= 50) return 'text-yellow-600'
    if (percentage >= 25) return 'text-orange-600'
    return 'text-red-600'
  },

  /**
   * Get progress bar color
   */
  getProgressBarColor: (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    if (percentage >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  },

  /**
   * Validate fund data
   */
  validateFund: (fund: Partial<CreateSinkingFundData>): string[] => {
    const errors: string[] = []
    
    if (!fund.name || fund.name.trim().length === 0) {
      errors.push('Fund name is required')
    }
    
    if (fund.name && fund.name.length > 255) {
      errors.push('Fund name must be less than 255 characters')
    }
    
    if (fund.target_cents === undefined || fund.target_cents <= 0) {
      errors.push('Target amount must be greater than 0')
    }
    
    if (fund.monthly_contribution_cents !== undefined && fund.monthly_contribution_cents < 0) {
      errors.push('Monthly contribution cannot be negative')
    }
    
    return errors
  },

  /**
   * Sort funds by various criteria
   */
  sortFunds: (
    funds: SinkingFund[],
    sortBy: 'name' | 'progress' | 'target' | 'created' = 'created',
    descending = false
  ): SinkingFund[] => {
    return [...funds].sort((a, b) => {
      let aVal: any, bVal: any
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break
        case 'progress':
          aVal = (a.current_balance_cents / a.target_cents) * 100
          bVal = (b.current_balance_cents / b.target_cents) * 100
          break
        case 'target':
          aVal = a.target_cents
          bVal = b.target_cents
          break
        case 'created':
        default:
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
      }

      if (aVal < bVal) return descending ? 1 : -1
      if (aVal > bVal) return descending ? -1 : 1
      return 0
    })
  },
}
