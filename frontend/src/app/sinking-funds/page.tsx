'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/DashboardLayout'
import { SinkingFundsAPI, SinkingFund, SinkingFundSummary, SinkingFundUtils } from '@/lib/sinking-funds-api'
import { Button } from '@/components/Button'

export default function SinkingFundsPage() {
  const router = useRouter()
  const [funds, setFunds] = useState<SinkingFund[]>([])
  const [summary, setSummary] = useState<SinkingFundSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'target' | 'created'>('created')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [fundsData, summaryData] = await Promise.all([
        SinkingFundsAPI.listFunds(),
        SinkingFundsAPI.getSummary()
      ])
      setFunds(fundsData)
      setSummary(summaryData)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load sinking funds')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFund = async (fundId: number) => {
    if (!confirm('Are you sure you want to delete this fund?')) return
    
    try {
      await SinkingFundsAPI.deleteFund(fundId)
      await loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete fund')
    }
  }

  const sortedFunds = SinkingFundUtils.sortFunds(funds, sortBy, sortBy === 'progress')

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sinking Funds</h1>
          <Button onClick={() => router.push('/sinking-funds/new')}>
            Create New Fund
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Total Funds</div>
              <div className="text-2xl font-bold">{summary.active_funds}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Total Target</div>
              <div className="text-2xl font-bold">
                {SinkingFundUtils.formatCurrency(summary.total_target_cents)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Total Saved</div>
              <div className="text-2xl font-bold text-green-600">
                {SinkingFundUtils.formatCurrency(summary.total_saved_cents)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">Overall Progress</div>
              <div className="text-2xl font-bold">
                {summary.overall_progress_percentage.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="mb-4 flex gap-2">
          <span className="text-sm text-gray-600 self-center">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border rounded text-sm"
          >
            <option value="created">Date Created</option>
            <option value="name">Name</option>
            <option value="progress">Progress</option>
            <option value="target">Target Amount</option>
          </select>
        </div>

        {/* Funds List */}
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : sortedFunds.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No sinking funds yet</p>
            <Button onClick={() => router.push('/sinking-funds/new')}>
              Create Your First Fund
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedFunds.map((fund) => {
              const progress = SinkingFundUtils.calculateProgress(
                fund.current_balance_cents,
                fund.target_cents
              )
              const remaining = fund.target_cents - fund.current_balance_cents
              const monthsToTarget = SinkingFundUtils.calculateMonthsToTarget(
                remaining,
                fund.monthly_contribution_cents
              )

              return (
                <div
                  key={fund.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/sinking-funds/${fund.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{fund.name}</h3>
                      {fund.description && (
                        <p className="text-sm text-gray-600 mt-1">{fund.description}</p>
                      )}
                    </div>
                    {fund.color && (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: fund.color }}
                      />
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-semibold ${SinkingFundUtils.getProgressColor(progress)}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${SinkingFundUtils.getProgressBarColor(progress)}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-semibold">
                        {SinkingFundUtils.formatCurrency(fund.current_balance_cents)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target:</span>
                      <span className="font-semibold">
                        {SinkingFundUtils.formatCurrency(fund.target_cents)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-orange-600">
                        {SinkingFundUtils.formatCurrency(remaining)}
                      </span>
                    </div>
                    {fund.monthly_contribution_cents > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly:</span>
                        <span className="font-semibold">
                          {SinkingFundUtils.formatCurrency(fund.monthly_contribution_cents)}
                        </span>
                      </div>
                    )}
                    {monthsToTarget && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Months to target:</span>
                        <span className="font-semibold">{monthsToTarget}</span>
                      </div>
                    )}
                    {fund.target_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target date:</span>
                        <span className="font-semibold">
                          {SinkingFundUtils.formatDate(fund.target_date)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/sinking-funds/${fund.id}/edit`)
                      }}
                      className="flex-1 text-sm"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteFund(fund.id)
                      }}
                      className="flex-1 text-sm bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
