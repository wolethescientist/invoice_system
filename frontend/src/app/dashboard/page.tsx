'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { SkeletonCard } from '@/components/Skeleton'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function DashboardPage() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/metrics/dashboard')
        return response.data
      } catch (err) {
        console.error('Dashboard metrics error:', err)
        // Return empty structure if endpoint doesn't exist
        return {
          budget: null,
          transactions: { count_this_month: 0 },
          sinking_funds: { total_saved_cents: 0, total_goal_cents: 0, fund_count: 0, funds: [] },
          net_worth: { net_worth_cents: 0, total_assets_cents: 0, total_liabilities_cents: 0, asset_count: 0, liability_count: 0 },
          goals: { total_goals: 0, active_goals: 0, completed_goals: 0, total_target_cents: 0, total_saved_cents: 0 },
          paychecks: { upcoming_count: 0, next_paycheck: null }
        }
      }
    },
  })

  // Calculate budget health percentage with safety checks
  const budgetHealth = metrics?.budget && metrics.budget.allocated_cents > 0
    ? ((metrics.budget.allocated_cents - metrics.budget.spent_cents) / metrics.budget.allocated_cents) * 100
    : 0

  // Prepare chart data with safety checks
  const budgetChartData = metrics?.budget
    ? [
        { name: 'Income', value: (metrics.budget.income_cents || 0) / 100, color: '#10B981' },
        { name: 'Allocated', value: (metrics.budget.allocated_cents || 0) / 100, color: '#0B6CF1' },
        { name: 'Spent', value: (metrics.budget.spent_cents || 0) / 100, color: '#F59E0B' },
      ]
    : []

  const netWorthChartData = metrics?.net_worth && (metrics.net_worth.total_assets_cents > 0 || metrics.net_worth.total_liabilities_cents > 0)
    ? [
        { name: 'Assets', value: (metrics.net_worth.total_assets_cents || 0) / 100, color: '#10B981' },
        { name: 'Liabilities', value: (metrics.net_worth.total_liabilities_cents || 0) / 100, color: '#EF4444' },
      ]
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {!isLoading && (
          <>
            {/* Key Metrics Row */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Net Worth */}
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Net Worth</p>
                    <p
                      className={`text-3xl font-bold mt-2 ${
                        (metrics?.net_worth?.net_worth_cents || 0) >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(metrics?.net_worth?.net_worth_cents || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {metrics?.net_worth?.asset_count || 0} assets • {metrics?.net_worth?.liability_count || 0} liabilities
                    </p>
                  </div>
                  <div className="text-3xl">📈</div>
                </div>
              </Card>

              {/* Budget Status */}
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Budget Available</p>
                    <p
                      className={`text-3xl font-bold mt-2 ${
                        (metrics?.budget?.available_cents || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(metrics?.budget?.available_cents || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {budgetHealth >= 0 ? `${Math.round(budgetHealth)}% remaining` : 'Over budget'}
                    </p>
                  </div>
                  <div className="text-3xl">💰</div>
                </div>
              </Card>

              {/* Sinking Funds */}
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Sinking Funds</p>
                    <p className="text-3xl font-bold text-brand-500 mt-2">
                      {formatCurrency(metrics?.sinking_funds?.total_saved_cents || 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {metrics?.sinking_funds?.fund_count || 0} active funds
                    </p>
                  </div>
                  <div className="text-3xl">🏦</div>
                </div>
              </Card>

              {/* Goals Progress */}
              <Card hover>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">Goals Progress</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {metrics?.goals?.active_goals || 0}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {metrics?.goals?.completed_goals || 0} completed
                    </p>
                  </div>
                  <div className="text-3xl">🎯</div>
                </div>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Budget Overview Chart */}
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Budget Overview</h2>
                {metrics?.budget ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={budgetChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="name" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          formatter={(value: number) => `$${value.toFixed(2)}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {budgetChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-neutral-600">Income</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(metrics.budget.income_cents || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Allocated</p>
                        <p className="text-lg font-bold text-brand-500">
                          {formatCurrency(metrics.budget.allocated_cents || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Spent</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(metrics.budget.spent_cents || 0)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/budgets/${metrics.budget.budget_id}`}
                      className="text-sm text-brand-500 hover:underline inline-block"
                    >
                      View Budget Details →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-600 mb-4">No budget for this month</p>
                    <Link
                      href="/budgets/new"
                      className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                    >
                      Create Budget
                    </Link>
                  </div>
                )}
              </Card>

              {/* Net Worth Chart */}
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Net Worth Breakdown</h2>
                {metrics?.net_worth && (metrics.net_worth.total_assets_cents > 0 || metrics.net_worth.total_liabilities_cents > 0) ? (
                  <div className="space-y-4">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={netWorthChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: $${value.toFixed(0)}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {netWorthChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-neutral-600">Total Assets</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(metrics.net_worth.total_assets_cents || 0)}
                        </p>
                        <p className="text-xs text-neutral-500">{metrics.net_worth.asset_count || 0} items</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-600">Total Liabilities</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(metrics.net_worth.total_liabilities_cents || 0)}
                        </p>
                        <p className="text-xs text-neutral-500">{metrics.net_worth.liability_count || 0} items</p>
                      </div>
                    </div>
                    <Link
                      href="/net-worth"
                      className="text-sm text-brand-500 hover:underline inline-block"
                    >
                      View Net Worth Details →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-600 mb-4">Track your assets and liabilities</p>
                    <Link
                      href="/net-worth"
                      className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Sinking Funds & Goals Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sinking Funds */}
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Sinking Funds</h2>
                {metrics?.sinking_funds && metrics.sinking_funds.fund_count > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-700 font-medium">Total Saved</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(metrics.sinking_funds.total_saved_cents)}
                        </p>
                      </div>
                      <div className="bg-brand-50 rounded-lg p-4">
                        <p className="text-sm text-brand-700 font-medium">Total Goal</p>
                        <p className="text-2xl font-bold text-brand-600 mt-1">
                          {formatCurrency(metrics.sinking_funds.total_goal_cents)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {metrics.sinking_funds.funds.slice(0, 5).map((fund: any) => {
                        const progress = (fund.contributed_cents / fund.target_amount_cents) * 100
                        return (
                          <div key={fund.id} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-neutral-700">{fund.name}</span>
                              <span className="text-sm text-neutral-600">
                                {formatCurrency(fund.contributed_cents)} / {formatCurrency(fund.target_amount_cents)}
                              </span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div
                                className="bg-brand-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <Link
                      href="/sinking-funds"
                      className="text-sm text-brand-500 hover:underline inline-block mt-4"
                    >
                      View All Funds →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-600 mb-4">Save for specific goals</p>
                    <Link
                      href="/sinking-funds/new"
                      className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                    >
                      Create Fund
                    </Link>
                  </div>
                )}
              </Card>

              {/* Financial Goals */}
              <Card>
                <h2 className="text-xl font-bold text-neutral-900 mb-6">Financial Goals</h2>
                {metrics?.goals && metrics.goals.total_goals > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-neutral-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-neutral-900">{metrics.goals.total_goals}</p>
                        <p className="text-xs text-neutral-600 mt-1">Total</p>
                      </div>
                      <div className="bg-brand-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-brand-600">{metrics.goals.active_goals}</p>
                        <p className="text-xs text-brand-700 mt-1">Active</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{metrics.goals.completed_goals}</p>
                        <p className="text-xs text-green-700 mt-1">Done</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-lg p-6">
                      <p className="text-sm text-neutral-600 mb-2">Overall Progress</p>
                      <p className="text-3xl font-bold text-neutral-900 mb-1">
                        {formatCurrency(metrics.goals.total_saved_cents)}
                      </p>
                      <p className="text-sm text-neutral-600 mb-3">
                        of {formatCurrency(metrics.goals.total_target_cents)} target
                      </p>
                      <div className="w-full bg-white rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-brand-500 to-purple-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (metrics.goals.total_saved_cents / metrics.goals.total_target_cents) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-neutral-600 mt-2">
                        {metrics.goals.total_target_cents > 0 
                          ? `${((metrics.goals.total_saved_cents / metrics.goals.total_target_cents) * 100).toFixed(1)}% complete`
                          : '0% complete'}
                      </p>
                    </div>
                    <Link
                      href="/financial-roadmap"
                      className="text-sm text-brand-500 hover:underline inline-block"
                    >
                      View All Goals →
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-neutral-600 mb-4">Set and track your financial goals</p>
                    <Link
                      href="/financial-roadmap/new"
                      className="inline-block px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                    >
                      Create Goal
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Quick Actions & Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Transactions</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">
                      {metrics?.transactions?.count_this_month || 0}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">This month</p>
                  </div>
                  <Link
                    href="/transactions"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
                  >
                    View
                  </Link>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Next Paycheck</p>
                    {metrics?.paychecks?.next_paycheck ? (
                      <>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(metrics.paychecks.next_paycheck.amount_cents)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(metrics.paychecks.next_paycheck.pay_date).toLocaleDateString()}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-neutral-500 mt-1">No upcoming paychecks</p>
                    )}
                  </div>
                  <Link
                    href="/paychecks"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
                  >
                    View
                  </Link>
                </div>
              </Card>

              <Card hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600">Reports</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">📊</p>
                    <p className="text-xs text-neutral-500 mt-1">View insights</p>
                  </div>
                  <Link
                    href="/reports"
                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
                  >
                    View
                  </Link>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
