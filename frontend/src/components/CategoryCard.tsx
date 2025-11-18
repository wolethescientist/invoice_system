'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

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

interface CategoryCardProps {
  name: string
  allocatedCents: number
  spentCents?: number
  onAmountChange?: (amount: number) => void
  editable?: boolean
  showProgress?: boolean
  className?: string
}

export default function CategoryCard({
  name,
  allocatedCents,
  spentCents = 0,
  onAmountChange,
  editable = false,
  showProgress = false,
  className = ''
}: CategoryCardProps) {
  const [template, setTemplate] = useState<CategoryTemplate | null>(null)
  const [amount, setAmount] = useState(allocatedCents / 100)

  useEffect(() => {
    fetchTemplate()
  }, [name])

  useEffect(() => {
    setAmount(allocatedCents / 100)
  }, [allocatedCents])

  const fetchTemplate = async () => {
    try {
      const response = await api.get('/api/category-templates')
      const templates = response.data.templates
      const matchingTemplate = templates.find((t: CategoryTemplate) => t.name === name)
      setTemplate(matchingTemplate || null)
    } catch (error) {
      console.error('Failed to fetch template for category:', error)
    }
  }

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value || '0')
    setAmount(numValue)
    if (onAmountChange) {
      onAmountChange(Math.round(numValue * 100))
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const getProgressColor = () => {
    if (!showProgress || allocatedCents === 0) return 'bg-gray-200'
    
    const percentage = (spentCents / allocatedCents) * 100
    if (percentage <= 50) return 'bg-green-500'
    if (percentage <= 80) return 'bg-yellow-500'
    if (percentage <= 100) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'income': return 'border-l-green-500'
      case 'expense': return 'border-l-red-500'
      case 'savings': return 'border-l-blue-500'
      default: return 'border-l-gray-400'
    }
  }

  const remainingCents = allocatedCents - spentCents
  const progressPercentage = allocatedCents > 0 ? Math.min((spentCents / allocatedCents) * 100, 100) : 0

  return (
    <div className={`bg-white rounded-lg shadow border-l-4 ${getTypeColor(template?.category_type)} p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {template?.icon && (
            <span className="text-lg">{template.icon}</span>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            {template && (
              <span className="text-xs text-gray-500 capitalize">{template.category_type}</span>
            )}
          </div>
        </div>
        {template?.color && (
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: template.color }}
          />
        )}
      </div>

      <div className="space-y-2">
        {editable ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              step="0.01"
              min="0"
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        ) : (
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(allocatedCents)}
          </div>
        )}

        {showProgress && (
          <>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Spent: {formatCurrency(spentCents)}</span>
              <span>Remaining: {formatCurrency(remainingCents)}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            {remainingCents < 0 && (
              <div className="text-xs text-red-600 font-medium">
                ⚠️ Over budget by {formatCurrency(Math.abs(remainingCents))}
              </div>
            )}
            
            {remainingCents === 0 && spentCents > 0 && (
              <div className="text-xs text-green-600 font-medium">
                ✓ Budget fully utilized
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}