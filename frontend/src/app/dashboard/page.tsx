'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { DashboardLayout } from '@/components/DashboardLayout'
import { Card } from '@/components/Card'
import { SkeletonCard } from '@/components/Skeleton'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await api.get('/api/metrics/dashboard')
      return response.data
    },
  })

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">Dashboard</h1>

      {/* Budget Overview */}
      {metrics?.budget && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Current Budget</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Monthly Income</div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(metrics.budget.income_cents)}
              </div>
              <Link href={`/budgets/${metrics.budget.budget_id}`} className="text-xs text-brand-500 hover:underline mt-1 inline-block">
                View Budget →
              </Link>
            </Card>

            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Allocated</div>
              <div className="text-3xl font-bold text-neutral-900">
                {formatCurrency(metrics.budget.allocated_cents)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {((metrics.budget.allocated_cents / metrics.budget.income_cents) * 100).toFixed(0)}% of income
              </div>
            </Card>

            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Spent</div>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(metrics.budget.spent_cents)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {((metrics.budget.spent_cents / metrics.budget.allocated_cents) * 100).toFixed(0)}% of allocated
              </div>
            </Card>

            <Card hover>
              <div className="text-sm text-neutral-600 mb-1">Available</div>
              <div className={`text-3xl font-bold ${metrics.budget.available_cents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(metrics.budget.available_cents)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {metrics.budget.available_cents >= 0 ? 'Under budget' : 'Over budget'}
              </div>
            </Card>
          </div>
        </div>
      )}

      {!metrics?.budget && !isLoading && (
        <div className="mb-8">
          <Card>
            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">No budget for this month yet</p>
              <Link href="/budgets/new" className="text-brand-500 hover:underline">
                Create Budget →
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Net Worth & Goals */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Net Worth</h2>
          {metrics?.net_worth ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-neutral-600">Total Net Worth</div>
                <div className={`text-4xl font-bold ${metrics.net_worth.net_worth_cents >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.net_worth.net_worth_cents)}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-neutral-600">Assets</div>
                  <div className="text-xl font-semibold text-green-600">
                    {formatCurrency(metrics.net_worth.total_assets_cents)}
                  </div>
                  <div className="text-xs text-neutral-500">{metrics.net_worth.asset_count} items</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Liabilities</div>
                  <div className="text-xl font-semibold text-red-600">
                    {formatCurrency(metrics.net_worth.total_liabilities_cents)}
                  </div>
                  <div className="text-xs text-neutral-500">{metrics.net_worth.liability_count} items</div>
                </div>
              </div>
              <Link href="/net-worth" className="text-sm text-brand-500 hover:underline inline-block">
                View Details →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">Track your assets and liabilities</p>
              <Link href="/net-worth" className="text-brand-500 hover:underline">
                Get Started →
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Financial Goals</h2>
          {metrics?.goals && metrics.goals.total_goals > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Total Goals</div>
                  <div className="text-3xl font-bold text-neutral-900">{metrics.goals.total_goals}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Active</div>
                  <div className="text-3xl font-bold text-brand-500">{metrics.goals.active_goals}</div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Completed</div>
                  <div className="text-3xl font-bold text-green-600">{metrics.goals.completed_goals}</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-neutral-600 mb-2">Progress</div>
                <div className="text-2xl font-bold text-neutral-900">
                  {formatCurrency(metrics.goals.total_saved_cents)}
                </div>
                <div className="text-sm text-neutral-500">
                  of {formatCurrency(metrics.goals.total_target_cents)} target
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-brand-500 h-2 rounded-full" 
                    style={{ width: `${Math.min((metrics.goals.total_saved_cents / metrics.goals.total_target_cents) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <Link href="/financial-roadmap" className="text-sm text-brand-500 hover:underline inline-block">
                View Goals →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">Set and track your financial goals</p>
              <Link href="/financial-roadmap/new" className="text-brand-500 hover:underline">
                Create Goal →
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Sinking Funds & Paychecks */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Sinking Funds</h2>
          {metrics?.sinking_funds && metrics.sinking_funds.fund_count > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Total Saved</div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.sinking_funds.total_saved_cents)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Total Goal</div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {formatCurrency(metrics.sinking_funds.total_goal_cents)}
                  </div>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                {metrics.sinking_funds.funds.map((fund: any) => (
                  <div key={fund.id} className="flex justify-between items-center">
                    <span className="text-sm text-neutral-700">{fund.name}</span>
                    <span className="text-sm font-semibold text-brand-500">
                      {formatCurrency(fund.contributed_cents)} / {formatCurrency(fund.target_amount_cents)}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/sinking-funds" className="text-sm text-brand-500 hover:underline inline-block">
                View All Funds →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">Save for specific goals</p>
              <Link href="/sinking-funds/new" className="text-brand-500 hover:underline">
                Create Fund →
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Upcoming Paychecks</h2>
          {metrics?.paychecks?.next_paycheck ? (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-neutral-600">Next Paycheck</div>
                <div className="text-4xl font-bold text-green-600">
                  {formatCurrency(metrics.paychecks.next_paycheck.amount_cents)}
                </div>
                <div className="text-sm text-neutral-500 mt-1">
                  {new Date(metrics.paychecks.next_paycheck.pay_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-neutral-600">
                  {metrics.paychecks.upcoming_count} upcoming paycheck{metrics.paychecks.upcoming_count !== 1 ? 's' : ''}
                </div>
              </div>
              <Link href="/paychecks" className="text-sm text-brand-500 hover:underline inline-block">
                View All Paychecks →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-600 mb-4">Plan your paycheck allocations</p>
              <Link href="/paychecks/new" className="text-brand-500 hover:underline">
                Add Paycheck →
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card hover>
          <div className="text-sm text-neutral-600 mb-1">Transactions This Month</div>
          <div className="text-3xl font-bold text-neutral-900">
            {metrics?.transactions?.count_this_month || 0}
          </div>
          <Link href="/transactions" className="text-xs text-brand-500 hover:underline mt-1 inline-block">
            View Transactions →
          </Link>
        </Card>

        <Card hover>
          <div className="text-sm text-neutral-600 mb-1">Active Sinking Funds</div>
          <div className="text-3xl font-bold text-neutral-900">
            {metrics?.sinking_funds?.fund_count || 0}
          </div>
          <Link href="/sinking-funds" className="text-xs text-brand-500 hover:underline mt-1 inline-block">
            Manage Funds →
          </Link>
        </Card>

        <Card hover>
          <div className="text-sm text-neutral-600 mb-1">Budget Progress</div>
          <div className="text-3xl font-bold text-neutral-900">
            {metrics?.budget ? `${((metrics.budget.spent_cents / metrics.budget.allocated_cents) * 100).toFixed(0)}%` : '0%'}
          </div>
          <Link href="/reports" className="text-xs text-brand-500 hover:underline mt-1 inline-block">
            View Reports →
          </Link>
        </Card>
      </div>

      {isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}
    </DashboardLayout>
  )
}
