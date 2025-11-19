'use client'

import { CategorySpending, MonthlyTrend, BudgetComparison } from '@/lib/reports-api'
import { ReportUtils } from '@/lib/reports-api'

interface PieChartProps {
  data: CategorySpending[]
  title: string
}

export function CategoryPieChart({ data, title }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.total_spent_cents, 0)
  
  // Generate colors
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flex items-center gap-8">
        <div className="relative w-64 h-64">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.total_spent_cents / total) * 100
              const offset = data.slice(0, index).reduce((sum, d) => 
                sum + (d.total_spent_cents / total) * 100, 0
              )
              const circumference = 2 * Math.PI * 40
              const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
              const strokeDashoffset = -((offset / 100) * circumference)
              
              return (
                <circle
                  key={item.category_id}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                />
              )
            })}
          </svg>
        </div>
        <div className="flex-1">
          {data.map((item, index) => (
            <div key={item.category_id} className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm">{item.category_name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">{ReportUtils.formatCurrency(item.total_spent_cents)}</div>
                <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface BarChartProps {
  data: CategorySpending[]
  title: string
}

export function CategoryBarChart({ data, title }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.total_spent_cents))
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item) => {
          const percentage = (item.total_spent_cents / maxValue) * 100
          
          return (
            <div key={item.category_id}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.category_name}</span>
                <span className="text-gray-600">{ReportUtils.formatCurrency(item.total_spent_cents)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${percentage}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {item.transaction_count} txns
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface TrendLineChartProps {
  data: MonthlyTrend[]
  title: string
}

export function TrendLineChart({ data, title }: TrendLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.total_cents))
  const minValue = Math.min(...data.map(d => d.total_cents))
  const range = maxValue - minValue
  
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 100 - ((item.total_cents - minValue) / range) * 80
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="relative">
        <svg viewBox="0 0 100 100" className="w-full h-64">
          <polyline
            points={points}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="0.5"
            className="drop-shadow"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((item.total_cents - minValue) / range) * 80
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill="#3b82f6"
                className="hover:r-2 cursor-pointer"
              >
                <title>{`${ReportUtils.formatPeriod(item.period)}: ${ReportUtils.formatCurrency(item.total_cents)}`}</title>
              </circle>
            )
          })}
        </svg>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {data.map((item, index) => {
            if (index % Math.ceil(data.length / 6) === 0 || index === data.length - 1) {
              return (
                <span key={index}>{ReportUtils.formatPeriod(item.period)}</span>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}

interface ComparisonChartProps {
  data: BudgetComparison[]
  title: string
}

export function BudgetComparisonChart({ data, title }: ComparisonChartProps) {
  const maxValue = Math.max(...data.map(d => d.income_cents))
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((budget) => (
          <div key={budget.budget_id} className="border-b pb-4 last:border-b-0">
            <div className="flex justify-between mb-2">
              <span className="font-medium">
                {new Date(budget.year, budget.month - 1).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </span>
              <span className="text-sm text-gray-600">
                {budget.utilization_percentage.toFixed(1)}% utilized
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-20">Income:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
                <span className="text-xs font-medium w-24 text-right">
                  {ReportUtils.formatCurrency(budget.income_cents)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-20">Allocated:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${(budget.allocated_cents / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-24 text-right">
                  {ReportUtils.formatCurrency(budget.allocated_cents)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-20">Spent:</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div
                    className="bg-orange-500 h-4 rounded-full"
                    style={{ width: `${(budget.spent_cents / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-24 text-right">
                  {ReportUtils.formatCurrency(budget.spent_cents)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
