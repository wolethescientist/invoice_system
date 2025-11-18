'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface BudgetSummary {
  budget: {
    id: number
    month: number
    year: number
    income_cents: number
    categories: Array<{
      name: string
      allocated_cents: number
    }>
  }
  total_allocated_cents: number
  remaining_cents: number
  is_balanced: boolean
}

export function CurrentBudgetWidget() {
  const router = useRouter()
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentBudget()
  }, [])

  const fetchCurrentBudget = async () => {
    try {
      const now = new Date()
      const month = now.getMonth() + 1
      const year = now.getFullYear()
      
      const response = await api.get(`/api/budgets/period/${year}/${month}`)
      setBudgetSummary(response.data)
    } catch (error) {
      // No budget for current month
      setBudgetSummary(null)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!budgetSummary) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {getMonthName(new Date().getMonth() + 1)} Budget
        </h3>
        <p className="text-gray-600 mb-4">No budget created for this month yet.</p>
        <button
          onClick={() => router.push('/budgets/new')}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Budget
        </button>
      </div>
    )
  }

  const { budget, total_allocated_cents, remaining_cents, is_balanced } = budgetSummary

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {getMonthName(budget.month)} {budget.year} Budget
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          is_balanced 
            ? 'bg-green-100 text-green-800' 
            : remaining_cents > 0 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {is_balanced ? 'Balanced' : remaining_cents > 0 ? 'Unallocated' : 'Over Budget'}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Income:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(budget.income_cents)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Allocated:</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(total_allocated_cents)}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">Remaining:</span>
          <span className={`text-sm font-semibold ${
            remaining_cents === 0 ? 'text-green-600' : remaining_cents > 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {formatCurrency(remaining_cents)}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Top Categories:</div>
        <div className="space-y-2">
          {budget.categories
            .sort((a, b) => b.allocated_cents - a.allocated_cents)
            .slice(0, 3)
            .map((cat, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-700">{cat.name}</span>
                <span className="text-gray-900">{formatCurrency(cat.allocated_cents)}</span>
              </div>
            ))}
        </div>
      </div>

      <button
        onClick={() => router.push(`/budgets/${budget.id}`)}
        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
      >
        View Details
      </button>
    </div>
  )
}
