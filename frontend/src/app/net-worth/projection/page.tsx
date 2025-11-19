'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  getNetWorthProjection,
  getNetWorthSummary,
  NetWorthProjection,
  NetWorthSummary,
  formatCurrency,
} from '@/lib/net-worth-api';

export default function ProjectionPage() {
  const router = useRouter();
  const [projection, setProjection] = useState<NetWorthProjection | null>(null);
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(12);

  useEffect(() => {
    loadData();
  }, [months]);

  const loadData = async () => {
    try {
      const [projData, summData] = await Promise.all([
        getNetWorthProjection(months),
        getNetWorthSummary(),
      ]);
      setProjection(projData);
      setSummary(summData);
    } catch (error) {
      console.error('Failed to load projection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading projection...</div>
      </DashboardLayout>
    );
  }

  if (!projection || !summary) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-gray-500">Failed to load projection data</div>
      </DashboardLayout>
    );
  }

  const change = projection.projected_net_worth - summary.current_net_worth;
  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';

  // Generate chart data
  const chartData = [
    {
      period: 'Current',
      'Net Worth': summary.current_net_worth,
      'Assets': summary.total_assets,
      'Liabilities': summary.total_liabilities,
    },
    {
      period: `${months} Months`,
      'Net Worth': projection.projected_net_worth,
      'Assets': projection.projected_assets,
      'Liabilities': projection.projected_liabilities,
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Net Worth Projection</h1>
          <button
            onClick={() => router.push('/net-worth')}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Net Worth
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projection Period
          </label>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={6}>6 Months</option>
            <option value={12}>12 Months</option>
            <option value={24}>24 Months</option>
            <option value={36}>36 Months</option>
            <option value={60}>60 Months</option>
          </select>
        </div>

        {/* Projection Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Projection Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Current</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Worth:</span>
                  <span className="font-semibold">{formatCurrency(summary.current_net_worth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assets:</span>
                  <span className="font-semibold">{formatCurrency(summary.total_assets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liabilities:</span>
                  <span className="font-semibold">{formatCurrency(summary.total_liabilities)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Projected ({new Date(projection.projection_date).toLocaleDateString()})
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Net Worth:</span>
                  <span className="font-semibold">{formatCurrency(projection.projected_net_worth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assets:</span>
                  <span className="font-semibold">{formatCurrency(projection.projected_assets)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Liabilities:</span>
                  <span className="font-semibold">{formatCurrency(projection.projected_liabilities)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Projected Change:</span>
              <span className={`text-2xl font-bold ${changeColor}`}>
                {change >= 0 ? '+' : ''}{formatCurrency(change)}
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Projection Chart</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="Net Worth" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="Assets" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Liabilities" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assumptions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Projection Assumptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Monthly Goal Contributions</div>
              <div className="text-xl font-semibold text-blue-600">
                {formatCurrency(projection.assumptions.monthly_goal_contributions)}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Monthly Debt Payments</div>
              <div className="text-xl font-semibold text-red-600">
                {formatCurrency(projection.assumptions.monthly_debt_payments)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Net Monthly Change</div>
              <div className="text-xl font-semibold text-green-600">
                {formatCurrency(projection.assumptions.net_monthly_change)}
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <div className="text-sm text-gray-600 mb-1">Projection Period</div>
              <div className="text-xl font-semibold text-gray-600">
                {projection.assumptions.months_projected} months
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This projection is based on your current financial goals and debt payment schedules.
              Actual results may vary based on market conditions, changes in income, unexpected expenses, and other factors.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
