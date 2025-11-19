'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { SinkingFundsAPI, UpdateSinkingFundData, SinkingFund, SinkingFundUtils } from '@/lib/sinking-funds-api'
import { Button } from '@/components/Button'

export default function EditSinkingFundPage() {
  const router = useRouter()
  const params = useParams()
  const fundId = parseInt(params.id as string)

  const [fund, setFund] = useState<SinkingFund | null>(null)
  const [formData, setFormData] = useState<UpdateSinkingFundData>({})
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadFund()
  }, [fundId])

  const loadFund = async () => {
    try {
      setLoading(true)
      const data = await SinkingFundsAPI.getFund(fundId, false)
      setFund(data)
      setFormData({
        name: data.name,
        target_cents: data.target_cents,
        monthly_contribution_cents: data.monthly_contribution_cents,
        target_date: data.target_date,
        description: data.description,
        color: data.color,
        is_active: data.is_active,
      })
    } catch (err: any) {
      setErrors([err.response?.data?.detail || 'Failed to load fund'])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = SinkingFundUtils.validateFund(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setSaving(true)
      setErrors([])
      await SinkingFundsAPI.updateFund(fundId, formData)
      router.push(`/sinking-funds/${fundId}`)
    } catch (err: any) {
      setErrors([err.response?.data?.detail || 'Failed to update fund'])
    } finally {
      setSaving(false)
    }
  }

  const handleCurrencyChange = (field: 'target_cents' | 'monthly_contribution_cents', value: string) => {
    const numValue = parseFloat(value) || 0
    setFormData({ ...formData, [field]: Math.round(numValue * 100) })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  if (!fund) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Fund not found
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
        >
          ← Back
        </button>
        
        <h1 className="text-3xl font-bold mb-6">Edit Sinking Fund</h1>

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
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                value={((formData.target_cents || 0) / 100).toFixed(2)}
                onChange={(e) => handleCurrencyChange('target_cents', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                value={((formData.monthly_contribution_cents || 0) / 100).toFixed(2)}
                onChange={(e) => handleCurrencyChange('monthly_contribution_cents', e.target.value)}
                className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <input
              type="color"
              value={formData.color || '#3B82F6'}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-20 border rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active !== false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
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
