'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface Category {
  name: string
  allocated_cents: number
  order: number
}

export default function NewBudgetPage() {
  const router = useRouter()
  const currentDate = new Date()
  
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [income, setIncome] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const incomeCents = Math.round(parseFloat(income || '0') * 100)
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_cents, 0)
  const remaining = incomeCents - totalAllocated

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (incomeCents <= 0) {
      setError('Please enter a valid income amount')
      return
    }

    if (categories.length === 0) {
      setError('Please add at least one category')
      return
    }

    if (remaining !== 0) {
      setError('Budget must be balanced. All income must be allocated.')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/budgets', {
        month,
        year,
        income_cents: incomeCents,
        categories: categories.map((cat, idx) => ({
          name: cat.name,
          allocated_cents: cat.allocated_cents,
          order: idx,
        })),
      })

      router.push('/budgets')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create budget')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Zero-Based Budget</h1>
          <p className="text-gray-600 mt-2">Allocate every dollar of your income to specific categories</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Period Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Period</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Income */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Income
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Budget Summary */}
          <div className={`rounded-lg shadow p-6 ${
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
            {remaining !== 0 && (
              <p className="text-sm mt-3 text-center font-medium">
                {remaining > 0 
                  ? '⚠️ You have unallocated funds. Assign all income to balance your budget.' 
                  : '❌ You are over budget. Reduce allocations to match your income.'}
              </p>
            )}
            {remaining === 0 && incomeCents > 0 && (
              <p className="text-sm mt-3 text-center font-medium text-green-700">
                ✓ Budget is balanced! Every dollar is allocated.
              </p>
            )}
          </div>

          {/* Categories */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Categories</h2>
            
            {/* Add Category */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                placeholder="Category name (e.g., Rent, Groceries)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCategory}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
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
                      placeholder="0.00"
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
              ))}
              
              {categories.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No categories yet. Add your first category above.
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || remaining !== 0}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
