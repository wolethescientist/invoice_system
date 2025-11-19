'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { DashboardLayout } from '@/components/DashboardLayout'
import { ReportsAPI, ReportRequest, ReportUtils, SavedReport } from '@/lib/reports-api'
import { CategoryPieChart, CategoryBarChart, TrendLineChart, BudgetComparisonChart } from '@/components/ReportCharts'
import { Button } from '@/components/Button'

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'spending' | 'income' | 'category' | 'trend' | 'comparison'>('spending')
  const [dateRangeStart, setDateRangeStart] = useState('')
  const [dateRangeEnd, setDateRangeEnd] = useState('')
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savedReports, setSavedReports] = useState<SavedReport[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [reportName, setReportName] = useState('')

  useEffect(() => {
    // Set default date range (last 3 months)
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 3)
    setDateRangeStart(start.toISOString().split('T')[0])
    setDateRangeEnd(end.toISOString().split('T')[0])

    loadSavedReports()
  }, [])

  const loadSavedReports = async () => {
    try {
      const reports = await ReportsAPI.listSavedReports()
      setSavedReports(reports)
    } catch (err) {
      console.error('Failed to load saved reports:', err)
    }
  }

  const generateReport = async () => {
    if (!dateRangeStart || !dateRangeEnd) {
      setError('Please select a date range')
      return
    }

    setLoading(true)
    setError('')

    try {
      const request: ReportRequest = {
        report_type: reportType,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd,
        group_by: groupBy
      }

      let data
      switch (reportType) {
        case 'spending':
          data = await ReportsAPI.generateSpendingReport(request)
          break
        case 'income':
          data = await ReportsAPI.generateIncomeReport(request)
          break
        case 'category':
          data = await ReportsAPI.generateCategoryReport(request)
          break
        case 'trend':
          data = await ReportsAPI.generateTrendReport(request)
          break
        case 'comparison':
          data = await ReportsAPI.generateComparisonReport(request)
          break
      }

      setReportData(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const saveReport = async () => {
    if (!reportName.trim()) {
      setError('Please enter a report name')
      return
    }

    try {
      await ReportsAPI.createSavedReport({
        name: reportName,
        report_type: reportType,
        date_range_start: dateRangeStart,
        date_range_end: dateRangeEnd
      })
      setShowSaveDialog(false)
      setReportName('')
      loadSavedReports()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save report')
    }
  }

  const loadSavedReport = async (reportId: number) => {
    setLoading(true)
    try {
      const data = await ReportsAPI.runSavedReport(reportId)
      setReportData(data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (preset: any) => {
    const { start, end } = preset.getValue()
    setDateRangeStart(start)
    setDateRangeEnd(end)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Budget Reports</h1>
          <p className="text-gray-600 mt-2">Generate custom reports and insights</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Report Configuration */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="spending">Spending Analysis</option>
                  <option value="income">Income Summary</option>
                  <option value="category">Category Report</option>
                  <option value="trend">Trend Analysis</option>
                  <option value="comparison">Budget Comparison</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                />
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Presets
                </label>
                <div className="space-y-1">
                  {ReportUtils.getDateRangePresets().map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {(reportType === 'spending' || reportType === 'trend') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group By
                  </label>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
              )}

              <Button
                onClick={generateReport}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>

              {reportData && (
                <Button
                  onClick={() => setShowSaveDialog(true)}
                  variant="secondary"
                  className="w-full"
                >
                  Save Report
                </Button>
              )}
            </div>

            {/* Saved Reports */}
            {savedReports.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow mt-6">
                <h3 className="font-semibold mb-3">Saved Reports</h3>
                <div className="space-y-2">
                  {savedReports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => loadSavedReport(report.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      <div className="font-medium">{report.name}</div>
                      <div className="text-xs text-gray-500">{report.report_type}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content - Report Display */}
          <div className="lg:col-span-3">
            {!reportData && !loading && (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500">Configure and generate a report to see results</p>
              </div>
            )}

            {loading && (
              <div className="bg-white p-12 rounded-lg shadow text-center">
                <p className="text-gray-500">Generating report...</p>
              </div>
            )}

            {reportData && reportType === 'spending' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Total Spent</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {ReportUtils.formatCurrency(reportData.total_spent_cents)}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Transactions</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {reportData.transaction_count}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Avg Transaction</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {ReportUtils.formatCurrency(reportData.avg_transaction_cents)}
                    </div>
                  </div>
                </div>

                {reportData.by_category.length > 0 && (
                  <>
                    <CategoryPieChart 
                      data={reportData.by_category} 
                      title="Spending by Category"
                    />
                    <CategoryBarChart 
                      data={reportData.by_category} 
                      title="Category Breakdown"
                    />
                  </>
                )}

                {reportData.trends.length > 0 && (
                  <TrendLineChart 
                    data={reportData.trends} 
                    title="Spending Trend"
                  />
                )}
              </div>
            )}

            {reportData && reportType === 'income' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">
                      {ReportUtils.formatCurrency(reportData.total_income_cents)}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Budgets</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {reportData.budget_count}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Avg Monthly</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {ReportUtils.formatCurrency(reportData.avg_monthly_income_cents)}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-4">Income by Month</h3>
                  <div className="space-y-2">
                    {reportData.by_month.map((item: any) => (
                      <div key={`${item.year}-${item.month}`} className="flex justify-between items-center">
                        <span>
                          {new Date(item.year, item.month - 1).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                        <span className="font-semibold">
                          {ReportUtils.formatCurrency(item.income_cents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {reportData && reportType === 'category' && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Category Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Category</th>
                        <th className="text-right py-2">Allocated</th>
                        <th className="text-right py-2">Spent</th>
                        <th className="text-right py-2">Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((cat: any) => (
                        <tr key={cat.category_id} className="border-b">
                          <td className="py-2">{cat.category_name}</td>
                          <td className="text-right">{ReportUtils.formatCurrency(cat.total_allocated_cents)}</td>
                          <td className="text-right">{ReportUtils.formatCurrency(cat.total_spent_cents)}</td>
                          <td className="text-right">
                            <span className={cat.utilization_percentage > 100 ? 'text-red-600' : 'text-green-600'}>
                              {cat.utilization_percentage.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {reportData && reportType === 'trend' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Growth Rate</div>
                    <div className={`text-2xl font-bold ${reportData.growth_rate >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {reportData.growth_rate >= 0 ? '+' : ''}{reportData.growth_rate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Period Type</div>
                    <div className="text-2xl font-bold text-gray-900 capitalize">
                      {reportData.period_type}
                    </div>
                  </div>
                </div>

                <TrendLineChart 
                  data={reportData.trends} 
                  title="Spending Trend Over Time"
                />

                {reportData.forecast && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Forecast</h3>
                    <div className="space-y-2">
                      {reportData.forecast.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-600">{item.period}</span>
                          <span className="font-semibold">
                            {ReportUtils.formatCurrency(item.predicted_cents)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {reportData && reportType === 'comparison' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">
                      {ReportUtils.formatCurrency(reportData.total_income_cents)}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Total Spent</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {ReportUtils.formatCurrency(reportData.total_spent_cents)}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-600">Avg Utilization</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {reportData.avg_utilization.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <BudgetComparisonChart 
                  data={reportData.budgets} 
                  title="Budget Comparison"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Report Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Save Report</h3>
              <input
                type="text"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Report name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              />
              <div className="flex gap-2">
                <Button onClick={saveReport} className="flex-1">
                  Save
                </Button>
                <Button 
                  onClick={() => setShowSaveDialog(false)} 
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
