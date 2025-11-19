'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { DashboardLayout } from '@/components/DashboardLayout'
import SplitTransactionForm from '@/components/SplitTransactionForm'
import ExportModal from '@/components/ExportModal'

interface TransactionSplit {
  id: number
  transaction_id: number
  category_id: number
  category_name: string
  amount_cents: number
  notes: string | null
}

interface Transaction {
  id: number
  budget_id: number
  category_id: number | null
  category_name?: string
  amount_cents: number
  date: string
  notes: string | null
  is_split: boolean
  splits: TransactionSplit[]
  created_at: string
}

interface Budget {
  id: number
  month: number
  year: number
}

interface Category {
  id: number
  name: string
  allocated_cents: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedBudget, setSelectedBudget] = useState<number | null>(null)
  const [filterBudget, setFilterBudget] = useState<number | null>(null)
  const [filterCategory, setFilterCategory] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    budget_id: 0,
    category_id: 0,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    is_split: false
  })
  const [splits, setSplits] = useState<any[]>([])
  const [splitsValid, setSplitsValid] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  useEffect(() => {
    fetchBudgets()
    fetchTransactions()
  }, [filterBudget, filterCategory])

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/api/budgets')
      setBudgets(response.data)
      if (response.data.length > 0 && !selectedBudget) {
        setSelectedBudget(response.data[0].id)
        setFormData(prev => ({ ...prev, budget_id: response.data[0].id }))
      }
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
    }
  }

  const fetchCategories = async (budgetId: number) => {
    try {
      const response = await api.get(`/api/budgets/${budgetId}`)
      setCategories(response.data.budget.categories)
      if (response.data.budget.categories.length > 0) {
        setFormData(prev => ({ ...prev, category_id: response.data.budget.categories[0].id }))
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams()
      if (filterBudget) params.append('budget_id', filterBudget.toString())
      if (filterCategory) params.append('category_id', filterCategory.toString())
      params.append('limit', '50')
      
      const response = await api.get(`/api/transactions?${params}`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.budget_id) errors.budget_id = 'Budget is required'
    
    if (!formData.is_split && !formData.category_id) {
      errors.category_id = 'Category is required'
    }
    
    const amount = parseFloat(formData.amount)
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be greater than 0'
    }
    
    if (formData.is_split && !splitsValid) {
      errors.splits = 'Splits must equal transaction amount'
    }
    
    if (!formData.date) errors.date = 'Date is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setSaving(true)
    try {
      const payload: any = {
        budget_id: formData.budget_id,
        amount_cents: Math.round(parseFloat(formData.amount) * 100),
        date: formData.date,
        notes: formData.notes || null,
        is_split: formData.is_split
      }

      if (formData.is_split) {
        payload.category_id = null
        payload.splits = splits
      } else {
        payload.category_id = formData.category_id
      }
      
      await api.post('/api/transactions', payload)
      
      setShowForm(false)
      setFormData({
        budget_id: selectedBudget || 0,
        category_id: categories[0]?.id || 0,
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        is_split: false
      })
      setSplits([])
      setFormErrors({})
      await fetchTransactions()
    } catch (error: any) {
      console.error('Failed to create transaction:', error)
      setFormErrors({ submit: error.response?.data?.detail || 'Failed to create transaction' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this transaction?')) return
    
    try {
      await api.delete(`/api/transactions/${id}`)
      await fetchTransactions()
    } catch (error) {
      console.error('Failed to delete transaction:', error)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('en-US', { month: 'long' })
  }

  useEffect(() => {
    if (selectedBudget) {
      fetchCategories(selectedBudget)
    }
  }, [selectedBudget])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading transactions...</div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-2">Track your spending and manage transactions</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showForm ? 'Cancel' : '+ Add Transaction'}
              </button>
            </div>
          </div>
        </div>

        {/* Transaction Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <select
                    value={formData.budget_id}
                    onChange={(e) => {
                      const budgetId = parseInt(e.target.value)
                      setFormData({ ...formData, budget_id: budgetId, category_id: 0 })
                      setSelectedBudget(budgetId)
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.budget_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select budget</option>
                    {budgets.map(budget => (
                      <option key={budget.id} value={budget.id}>
                        {getMonthName(budget.month)} {budget.year}
                      </option>
                    ))}
                  </select>
                  {formErrors.budget_id && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.budget_id}</p>
                  )}
                </div>

                {!formData.is_split && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                      disabled={!formData.budget_id || categories.length === 0}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 ${
                        formErrors.category_id ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.category_id && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.category_id}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      onBlur={validateForm}
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.amount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {formErrors.amount && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.date && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.date}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_split}
                    onChange={(e) => setFormData({ ...formData, is_split: e.target.checked, category_id: 0 })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Split across multiple categories
                  </span>
                </label>
              </div>

              {formData.is_split && formData.amount && parseFloat(formData.amount) > 0 && (
                <div className="md:col-span-2">
                  <SplitTransactionForm
                    totalAmountCents={Math.round(parseFloat(formData.amount) * 100)}
                    categories={categories}
                    onSplitsChange={setSplits}
                    onValidChange={setSplitsValid}
                  />
                  {formErrors.splits && (
                    <p className="text-red-500 text-sm mt-2">{formErrors.splits}</p>
                  )}
                </div>
              )}

              {!formData.is_split && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    placeholder="Add any notes about this transaction..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {formErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {formErrors.submit}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormErrors({})
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {saving ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Budget
              </label>
              <select
                value={filterBudget || ''}
                onChange={(e) => setFilterBudget(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Budgets</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {getMonthName(budget.month)} {budget.year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No transactions found. Add your first transaction to get started!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map(transaction => (
                <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        {transaction.is_split ? (
                          <span className="font-semibold text-gray-900 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">SPLIT</span>
                            Multiple Categories
                          </span>
                        ) : (
                          <span className="font-semibold text-gray-900">
                            {transaction.category_name}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                      {transaction.is_split && transaction.splits && transaction.splits.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {transaction.splits.map(split => (
                            <div key={split.id} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span className="font-medium">{split.category_name}:</span>
                              <span>{formatCurrency(split.amount_cents)}</span>
                              {split.notes && <span className="text-gray-500">- {split.notes}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {!transaction.is_split && transaction.notes && (
                        <p className="text-sm text-gray-600 mt-1">{transaction.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(transaction.amount_cents)}
                      </span>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        defaultType="transactions"
        defaultFilters={{
          budgetId: filterBudget || undefined,
          categoryId: filterCategory || undefined
        }}
      />
    </DashboardLayout>
  )
}
