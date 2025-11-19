'use client'

import { useState, useEffect } from 'react'

interface Category {
  id: number
  name: string
  allocated_cents: number
}

interface Split {
  category_id: number
  amount_cents: number
  notes: string
}

interface SplitTransactionFormProps {
  totalAmountCents: number
  categories: Category[]
  onSplitsChange: (splits: Split[]) => void
  onValidChange: (isValid: boolean) => void
}

export default function SplitTransactionForm({
  totalAmountCents,
  categories,
  onSplitsChange,
  onValidChange
}: SplitTransactionFormProps) {
  const [splits, setSplits] = useState<Split[]>([
    { category_id: 0, amount_cents: 0, notes: '' }
  ])

  const addSplit = () => {
    setSplits([...splits, { category_id: 0, amount_cents: 0, notes: '' }])
  }

  const removeSplit = (index: number) => {
    if (splits.length > 1) {
      const newSplits = splits.filter((_, i) => i !== index)
      setSplits(newSplits)
    }
  }

  const updateSplit = (index: number, field: keyof Split, value: any) => {
    const newSplits = [...splits]
    newSplits[index] = { ...newSplits[index], [field]: value }
    setSplits(newSplits)
  }

  const totalSplitCents = splits.reduce((sum, split) => sum + (split.amount_cents || 0), 0)
  const remainingCents = totalAmountCents - totalSplitCents
  const isValid = totalSplitCents === totalAmountCents && 
                  splits.every(s => s.category_id > 0 && s.amount_cents > 0)

  useEffect(() => {
    onSplitsChange(splits)
    onValidChange(isValid)
  }, [splits, isValid])

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const centsToAmount = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  const amountToCents = (amount: string) => {
    return Math.round(parseFloat(amount || '0') * 100)
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">Total Transaction Amount:</span>
          <span className="font-bold text-gray-900">{formatCurrency(totalAmountCents)}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-gray-700">Total Splits:</span>
          <span className={`font-bold ${totalSplitCents === totalAmountCents ? 'text-green-600' : 'text-orange-600'}`}>
            {formatCurrency(totalSplitCents)}
          </span>
        </div>
        <div className="flex justify-between items-center text-sm mt-2">
          <span className="text-gray-700">Remaining:</span>
          <span className={`font-bold ${remainingCents === 0 ? 'text-green-600' : remainingCents < 0 ? 'text-red-600' : 'text-orange-600'}`}>
            {formatCurrency(remainingCents)}
          </span>
        </div>
      </div>

      {remainingCents !== 0 && (
        <div className={`border rounded-lg p-3 text-sm ${
          remainingCents < 0 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-orange-50 border-orange-200 text-orange-700'
        }`}>
          {remainingCents < 0 
            ? '⚠️ Split amounts exceed transaction total' 
            : '⚠️ Split amounts do not equal transaction total'}
        </div>
      )}

      <div className="space-y-3">
        {splits.map((split, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-700">Split {index + 1}</span>
              {splits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSplit(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={split.category_id}
                  onChange={(e) => updateSplit(index, 'category_id', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={split.amount_cents > 0 ? centsToAmount(split.amount_cents) : ''}
                    onChange={(e) => updateSplit(index, 'amount_cents', amountToCents(e.target.value))}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                value={split.notes}
                onChange={(e) => updateSplit(index, 'notes', e.target.value)}
                placeholder="Add notes for this split..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSplit}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        + Add Another Split
      </button>
    </div>
  )
}
