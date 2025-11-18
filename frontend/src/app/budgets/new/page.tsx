'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface Category {
  name: string
  allocated_cents: number
  order: number
}

interface CategoryTemplate {
  id: number
  name: string
  category_type: 'income' | 'expense' | 'savings'
  icon?: string
  color?: string
  default_allocation_cents: number
  is_active: boolean
  order: number
}

export default function NewBudgetPage() {
  const router = useRouter()
  const currentDate = new Date()
  
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [income, setIncome] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [templates, setTemplates] = useState<CategoryTemplate[]>([])
  const [selectedTemplates, setSelectedTemplates] = useState<Set<number>>(new Set())
  const [showTemplates, setShowTemplates] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(true)

  const incomeCents = Math.round(parseFloat(income || '0') * 100)
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated_cents, 0)
  const remaining = incomeCents - totalAllocated

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/api/category-templates')
      setTemplates(response.data.templates)
    } catch (error) {
      console.error('Failed to fetch category templates:', error)
    } finally {
      setTemplatesLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-green-100 text-green-800 border-green-200'
      case 'expense': return 'bg-red-100 text-red-800 border-red-200'
      case 'savings': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleTemplate = (templateId: number) => {
    const newSelected = new Set(selectedTemplates)
    if (newSelected.has(templateId)) {
      newSelected.delete(templateId)
    } else {
      newSelected.add(templateId)
    }
    setSelectedTemplates(newSelected)
  }

  const loadSelectedTemplates = () => {
    const selectedTemplateObjects = templates.filter(t => selectedTemplates.has(t.id))
    const newCategories = selectedTemplateObjects.map(template => ({
      name: template.name,
      allocated_cents: template.default_allocation_cents,
      order: template.order
    }))
    
    setCategories(newCategories.sort((a, b) => a.order - b.order))
    setShowTemplates(false)
  }

  const createBudgetFromTemplates = async () => {
    if (incomeCents <= 0) {
      setError('Please enter a valid income amount')
      return
    }

    if (selectedTemplates.size === 0) {
      setError('Please select at least one template')
      return
    }

    setLoading(true)

    try {
      await api.post('/api/budgets/from-templates', null, {
        params: {
          month,
          year,
          income_cents: incomeCents,
          template_ids: Array.from(selectedTemplates)
        }
      })

      router.push('/budgets')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create budget from templates')
    } finally {
      setLoading(false)
    }
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Zero-Based Budget</h1>
              <p className="text-gray-600 mt-2">Allocate every dollar of your income to specific categories</p>
            </div>
            <button
              onClick={() => router.push('/budgets/categories')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Manage Templates
            </button>
          </div>
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

          {/* Category Templates */}
          {showTemplates && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Choose Category Templates</h2>
                <button
                  type="button"
                  onClick={() => setShowTemplates(false)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Skip Templates
                </button>
              </div>
              
              {templatesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No category templates found.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/budgets/categories')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Templates
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid gap-3 mb-6 max-h-96 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => toggleTemplate(template.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTemplates.has(template.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {template.icon && (
                              <span className="text-xl">{template.icon}</span>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{template.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor(template.category_type)}`}>
                                  {template.category_type}
                                </span>
                                {template.color && (
                                  <div
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: template.color }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(template.default_allocation_cents)}
                            </div>
                            <div className="text-xs text-gray-500">default</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={loadSelectedTemplates}
                      disabled={selectedTemplates.size === 0}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Use Selected Templates ({selectedTemplates.size})
                    </button>
                    <button
                      type="button"
                      onClick={createBudgetFromTemplates}
                      disabled={loading || selectedTemplates.size === 0 || incomeCents <= 0}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Budget Now'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Manual Categories */}
          {!showTemplates && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Budget Categories</h2>
                <button
                  type="button"
                  onClick={() => setShowTemplates(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Use Templates
                </button>
              </div>
            
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
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!showTemplates && (
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
          )}
        </form>
      </div>
    </div>
  )
}
