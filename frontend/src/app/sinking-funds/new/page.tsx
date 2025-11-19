'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { SinkingFundsAPI, CreateSinkingFundData, SinkingFundUtils } from '@/lib/sinking-funds-api'
import { Button } from '@/components/Button'

export default function NewSinkingFundPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    target_cents: 0,
    monthly_contribution_cents: 0,
    description: '',
    color: '#3B82F6',
    target_date: undefined as string | undefined,
  })
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = SinkingFundUtils.validateFund(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setLoading(true)
      setErrors([])
      await SinkingFundsAPI.createFund(formData)
      router.push('/sinking-funds')
    } catch (err: any) {
      setErrors([err.response?.data?.detail || 'Failed to create fund'])
    } finally {
      setLoading(false)
    }
  }

  const handleCurrencyChange = (field: 'target_cents' | 'monthly_contribution_cents', value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData({ ...formData, [field]: Math.round(numValue * 100) })
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Sinking Fund</h1>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <ul className="list-disc list-inside">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fund Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Emergency Fund, Vacation, New Car"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(formData.target_cents / 100).toFixed(2)}
                onChange={(e) => handleCurrencyChange('target_cents', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={(formData.monthly_contribution_cents / 100).toFixed(2)}
                onChange={(e) => handleCurrencyChange('monthly_contribution_cents', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              How much you plan to contribute each month
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={formData.target_date?.split('T')[0] || ''}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add notes about this fund..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10 w-20 border rounded cursor-pointer"
              />
              <span className="text-sm text-gray-600">Choose a color for visual identification</span>
            </div>
          </div>

          {formData.target_cents > 0 && formData.monthly_contribution_cents > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Projection</h3>
              <p className="text-sm text-blue-800">
                At {SinkingFundUtils.formatCurrency(formData.monthly_contribution_cents)} per month,
                you'll reach your goal of {SinkingFundUtils.formatCurrency(formData.target_cents)} in approximately{' '}
                <strong>{Math.ceil(formData.target_cents / formData.monthly_contribution_cents)} months</strong>.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating...' : 'Create Fund'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
