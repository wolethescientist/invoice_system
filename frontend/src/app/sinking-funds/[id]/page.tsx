'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import {
  SinkingFundsAPI,
  SinkingFundProgress,
  SinkingFundContribution,
  SinkingFundUtils,
  CreateContributionData
} from '@/lib/sinking-funds-api'
import { Button } from '@/components/Button'

export default function SinkingFundDetailPage() {
  const router = useRouter()
  const params = useParams()
  const fundId = parseInt(params.id as string)

  const [progress, setProgress] = useState<SinkingFundProgress | null>(null)
  const [contributions, setContributions] = useState<SinkingFundContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showContributionForm, setShowContributionForm] = useState(false)
  const [contributionData, setContributionData] = useState<CreateContributionData>({
    amount_cents: 0,
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [fundId])

  const loadData = async () => {
    try {
      setLoading(true)
      const [progressData, contributionsData] = await Promise.all([
        SinkingFundsAPI.getFundProgress(fundId),
        SinkingFundsAPI.listContributions(fundId)
      ])
      setProgress(progressData)
      setContributions(contributionsData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load fund details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await SinkingFundsAPI.addContribution(fundId, contributionData)
      setShowContributionForm(false)
      setContributionData({ amount_cents: 0, notes: '' })
      await loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add contribution')
    }
  }

  const handleDeleteContribution = async (contributionId: number) => {
    if (!confirm('Are you sure you want to delete this contribution?')) return
    
    try {
      await SinkingFundsAPI.deleteContribution(fundId, contributionId)
      await loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete contribution')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">Loading...</div>
      </DashboardLayout>
    )
  }

  if (error || !progress) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || 'Fund not found'}
        </div>
      </DashboardLayout>
    )
  }

  const { fund } = progress

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold">{fund.name}</h1>
            {fund.description && (
              <p className="text-gray-600 mt-2">{fund.description}</p>
            )}
          </div>
          <Button onClick={() => router.push(`/sinking-funds/${fundId}/edit`)}>
            Edit Fund
          </Button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-green-600">
                {SinkingFundUtils.formatCurrency(fund.current_balance_cents)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Target Amount</div>
              <div className="text-2xl font-bold">
                {SinkingFundUtils.formatCurrency(fund.target_cents)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Remaining</div>
              <div className="text-2xl font-bold text-orange-600">
                {SinkingFundUtils.formatCurrency(progress.remaining_cents)}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className={`font-semibold ${SinkingFundUtils.getProgressColor(progress.progress_percentage)}`}>
                {progress.progress_percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${SinkingFundUtils.getProgressBarColor(progress.progress_percentage)}`}
                style={{ width: `${Math.min(progress.progress_percentage, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Monthly Contribution</div>
              <div className="font-semibold">
                {SinkingFundUtils.formatCurrency(fund.monthly_contribution_cents)}
              </div>
            </div>
            {progress.months_to_target && (
              <div>
                <div className="text-gray-600">Months to Target</div>
                <div className="font-semibold">{progress.months_to_target}</div>
              </div>
            )}
            <div>
              <div className="text-gray-600">Total Contributed</div>
              <div className="font-semibold">
                {SinkingFundUtils.formatCurrency(progress.total_contributed_cents)}
              </div>
            </div>
            <div>
              <div className="text-gray-600">Status</div>
              <div className={`font-semibold ${progress.on_track ? 'text-green-600' : 'text-orange-600'}`}>
                {progress.on_track ? 'On Track' : 'Behind Schedule'}
              </div>
            </div>
          </div>

          {fund.target_date && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">Target Date</div>
              <div className="font-semibold">{SinkingFundUtils.formatDate(fund.target_date)}</div>
            </div>
          )}
        </div>

        {/* Contribution Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Contributions</h2>
            <Button onClick={() => setShowContributionForm(!showContributionForm)}>
              {showContributionForm ? 'Cancel' : 'Add Contribution'}
            </Button>
          </div>

          {showContributionForm && (
            <form onSubmit={handleAddContribution} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={(contributionData.amount_cents / 100).toFixed(2)}
                      onChange={(e) => setContributionData({
                        ...contributionData,
                        amount_cents: Math.round((parseFloat(e.target.value) || 0) * 100)
                      })}
                      className="w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use negative amount for withdrawals
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={contributionData.notes}
                    onChange={(e) => setContributionData({ ...contributionData, notes: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a note..."
                  />
                </div>
              </div>
              <Button type="submit">Add Contribution</Button>
            </form>
          )}

          {/* Contributions List */}
          {contributions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No contributions yet</p>
          ) : (
            <div className="space-y-2">
              {contributions.map((contribution) => (
                <div
                  key={contribution.id}
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-semibold ${
                        contribution.amount_cents >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {contribution.amount_cents >= 0 ? '+' : ''}
                        {SinkingFundUtils.formatCurrency(contribution.amount_cents)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {SinkingFundUtils.formatDate(contribution.contribution_date)}
                      </span>
                    </div>
                    {contribution.notes && (
                      <p className="text-sm text-gray-600 mt-1">{contribution.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteContribution(contribution.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
