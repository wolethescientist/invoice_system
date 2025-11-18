'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '@/lib/api'
import VirtualizedCategoryList from '@/components/VirtualizedCategoryList'

interface Category {
  id?: number
  name: string
  allocated_cents: number
  order: number
  description?: string
  category_group?: string
  is_active?: number
}

interface Budget {
  id: number
  month: number
  year: number
  income_cents: number
  categories: Category[]
}

interface BudgetSummary {
  budget: Budget
  total_allocated_cents: number
  remaining_cents: number
  is_balanced: boolean
}

interface CategorySpending {
  category_id: number
  category_name: string
  allocated_cents: number
  spent_cents: number
  remaining_cents: number
}

export default function BudgetDetailPage() {
  const router = useRouter()
  const params = useParams()
  const budgetId = params.id

  const [budgetData, setBudgetData] = useState<BudgetSummary | null>(null)
  const [editing, setEditing] = useState(false)
  const [income, setIncome] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([])
  const [showTransactions, setShowTransactions] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'grouped'>('list')

  useEffect(() => {
    fetchBudget()
    fetchCategorySpending()
    
    // Auto-refresh every 30 seconds to sync across devices
    const interval = setInterval(() => {
      if (!editing) {
        fetchBudget()
        fetchCategorySpending()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [budgetId, editing])

  const fetchBudget = async () => {
    try {
      const response = await api.get(`/api/budgets/${budgetId}`)
      setBudgetData(response.data)
      setIncome((response.data.budget.income_cents / 100).toFixed(2))
      setCategories(response.data.budget.categories)
    } catch (error) {
      console.error('Failed to fetch budget:', error)
      setError('Failed to load budget')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategorySpending = async () => {
    try {
      const response = await api.get(`/api/transactions/budget/${budgetId}/summary`)
      setCategorySpending(response.data.categories)
    } catch (error) {
      console.error('Failed to fetch category spending:', error)
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

  const incomeCents = Math.round(parseFloat(income || '0') * 100)
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_cents, 0)
  const remaining = incomeCents - totalAllocated

  const addCategory = () => {
    if (!newCategoryName.trim()) return
    
    setCategories([
      ...categories,
      {
        name: newCategoryName.trim(),
        allocated_cents: 0,
        order: categories.length,
      },
    ])
    setNewCategoryName('')
  }

  const updateCategoryAmount = (index: number, value: string) => {
    const cents = Math.round(parseFloat(value || '0') * 100)
    const updated = [...categories]
    updated[index].allocated_cents = cents
    setCategories(updated)
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (remaining !== 0) {
      setError('Budget must be balanced. All income must be allocated.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await api.put(`/api/budgets/${budgetId}`, {
        income_cents: incomeCents,
        categories: categories.map((cat, idx) => ({
          name: cat.name,
          allocated_cents: cat.allocated_cents,
          order: idx,
        })),
      })

      await fetchBudget()
      setEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update budget')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    try {
      await api.delete(`/api/budgets/${budgetId}`)
      router.push('/budgets')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete budget')
    }
  }

  const cancelEdit = () => {
    if (budgetData) {
      setIncome((budgetData.budget.income_cents / 100).toFixed(2))
      setCategories(budgetData.budget.categories)
    }
    setEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading budget...</div>
      </div>
    )
  }

  if (!budgetData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Budget not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/budgets')}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back to Budgets
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getMonthName(budgetData.budget.month)} {budgetData.budget.year}
              </h1>
              <p className="text-gray-600 mt-2">
                {editing ? 'Edit your budget allocations' : 'View your budget details'}
              </p>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button
                    onClick={() => router.push('/transactions')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Transaction
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || remaining !== 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Income Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income</h2>
          {editing ? (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(budgetData.budget.income_cents)}
            </div>
          )}
        </div>

        {/* Budget Summary */}
        <div className={`rounded-lg shadow p-6 mb-6 ${
          remaining === 0 ? 'bg-green-50 border-2 border-green-500' : 
          remaining > 0 ? 'bg-yellow-50 border-2 border-yellow-500' : 
          'bg-red-50 border-2 border-red-500'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-900">Income:</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(incomeCents)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-900">Allocated:</span>
            <span className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllocated)}</span>
          </div>
          <div className="border-t-2 border-gray-300 my-3"></div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Remaining:</span>
            <span className={`text-3xl font-bold ${
              remaining === 0 ? 'text-green-600' : 
              remaining > 0 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {formatCurrency(remaining)}
            </span>
          </div>
          {remaining !== 0 && editing && (
            <p className="text-sm mt-3 text-center font-medium">
              {remaining > 0 
                ? '⚠️ You have unallocated funds. Assign all income to balance your budget.' 
                : '❌ You are over budget. Reduce allocations to match your income.'}
            </p>
          )}
          {remaining === 0 && (
            <p className="text-sm mt-3 text-center font-medium text-green-700">
              ✓ Budget is balanced! Every dollar is allocated.
            </p>
          )}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Budget Categories ({categories.length})
            </h2>
            
            {!editing && (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <input
                  type="text"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="Search categories..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:w-64"
                />
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'list' | 'grid' | 'grouped')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="list">List View</option>
                  <option value="grid">Grid View</option>
                  <option value="grouped">Grouped View</option>
                </select>
              </div>
            )}
          </div>
          
          {editing && (
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="Add new category"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          )}

          {editing ? (
            // Traditional editing view for smaller lists
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categories
                .filter(cat => !categoryFilter || cat.name.toLowerCase().includes(categoryFilter.toLowerCase()))
                .map((category, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex gap-3 items-center">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="relative w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          value={category.allocated_cents / 100}
                          onChange={(e) => updateCategoryAmount(index, e.target.value)}
                          step="0.01"
                          min="0"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCategory(index)}
                        className="text-red-600 hover:text-red-700 px-3 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : categories.length > 20 ? (
            // Use virtualized list for large category lists
            <VirtualizedCategoryList
              categories={categories.map(cat => ({
                ...cat,
                spent_cents: categorySpending.find(s => s.category_id === cat.id)?.spent_cents || 0,
                is_active: 1
              }))}
              onCategoryUpdate={(categoryId, updates) => {
                // Handle category updates
                console.log('Update category', categoryId, updates)
              }}
              onCategoryDelete={(categoryId) => {
                // Handle category deletion
                console.log('Delete category', categoryId)
              }}
              editable={false}
              showProgress={true}
              height={500}
              itemHeight={120}
              groupBy={viewMode === 'grouped' ? 'category_group' : 'none'}
              searchTerm={categoryFilter}
              sortBy="order"
            />
          ) : (
            // Traditional view for smaller lists
            <div className={`${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-3'
            } max-h-96 overflow-y-auto`}>
              {categories
                .filter(cat => !categoryFilter || cat.name.toLowerCase().includes(categoryFilter.toLowerCase()))
                .map((category, index) => {
                  const spending = categorySpending.find(s => s.category_id === category.id)
                  const spentCents = spending?.spent_cents || 0
                  const remainingCents = category.allocated_cents - spentCents
                  const percentSpent = category.allocated_cents > 0 
                    ? (spentCents / category.allocated_cents) * 100 
                    : 0

                  return (
                    <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex gap-3 items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Spent: {formatCurrency(spentCents)}</span>
                              <span>Remaining: {formatCurrency(remainingCents)}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${
                                  percentSpent > 100 ? 'bg-red-500' : 
                                  percentSpent > 90 ? 'bg-yellow-500' : 
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(percentSpent, 100)}%` }}
                              />
                            </div>
                            {remainingCents < 0 && (
                              <div className="text-xs text-red-600 font-medium mt-1">
                                ⚠️ Over budget by {formatCurrency(Math.abs(remainingCents))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(category.allocated_cents)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Math.round(percentSpent)}% used
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
