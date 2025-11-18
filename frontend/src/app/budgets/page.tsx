'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface Budget {
  id: number
  month: number
  year: number
  income_cents: number
  categories: BudgetCategory[]
}

interface BudgetCategory {
  id: number
  name: string
  allocated_cents: number
}

export default function BudgetsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }
    if (isAuthenticated) {
      fetchBudgets()
      
      // Auto-refresh every 30 seconds to sync across devices
      const interval = setInterval(() => {
        fetchBudgets()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, authLoading, router])

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/api/budgets')
      setBudgets(response.data)
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
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

  const calculateTotalAllocated = (categories: BudgetCategory[]) => {
    return categories.reduce((sum, cat) => sum + cat.allocated_cents, 0)
  }

  const filteredBudgets = budgets.filter(budget => 
    selectedYear === 'all' || budget.year === selectedYear
  )

  const availableYears = Array.from(new Set(budgets.map(b => b.year))).sort((a, b) => b - a)

  const totalIncome = filteredBudgets.reduce((sum, b) => sum + b.income_cents, 0)
  const totalAllocatedAll = filteredBudgets.reduce((sum, b) => 
    sum + calculateTotalAllocated(b.categories), 0
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading budgets...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Budgets</h1>
          <button
            onClick={() => router.push('/budgets/new')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Budget
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No budgets yet</h2>
            <p className="text-gray-600 mb-6">Create your first zero-based budget to start managing your finances.</p>
            <button
              onClick={() => router.push('/budgets/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Budget
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Budgets</div>
                <div className="text-3xl font-bold text-gray-900">{filteredBudgets.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Income</div>
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalIncome)}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Allocated</div>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(totalAllocatedAll)}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <label className="text-sm font-medium text-gray-700">Filter by Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            {filteredBudgets.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No budgets found</h2>
                <p className="text-gray-600">Try adjusting your filters or create a new budget.</p>
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBudgets.map((budget) => {
              const totalAllocated = calculateTotalAllocated(budget.categories)
              const remaining = budget.income_cents - totalAllocated
              const isBalanced = remaining === 0

              return (
                <div
                  key={budget.id}
                  onClick={() => router.push(`/budgets/${budget.id}`)}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {getMonthName(budget.month)} {budget.year}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {budget.categories.length} categories
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isBalanced 
                        ? 'bg-green-100 text-green-800' 
                        : remaining > 0 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isBalanced ? 'Balanced' : remaining > 0 ? 'Unallocated' : 'Over Budget'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Income:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(budget.income_cents)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Allocated:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(totalAllocated)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-semibold ${
                        remaining === 0 ? 'text-green-600' : remaining > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Income
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allocated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBudgets.map((budget) => {
                    const totalAllocated = calculateTotalAllocated(budget.categories)
                    const remaining = budget.income_cents - totalAllocated
                    const isBalanced = remaining === 0

                    return (
                      <tr
                        key={budget.id}
                        onClick={() => router.push(`/budgets/${budget.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {getMonthName(budget.month)} {budget.year}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(budget.income_cents)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(totalAllocated)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            remaining === 0 ? 'text-green-600' : remaining > 0 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(remaining)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{budget.categories.length}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isBalanced 
                              ? 'bg-green-100 text-green-800' 
                              : remaining > 0 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {isBalanced ? 'Balanced' : remaining > 0 ? 'Unallocated' : 'Over Budget'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}
