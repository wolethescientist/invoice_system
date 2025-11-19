'use client';

import { useEffect, useState } from 'react';
import { getNetWorthSummary, NetWorthSummary, formatCurrency, formatPercentage } from '@/lib/net-worth-api';

export default function NetWorthSummaryCard() {
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      const data = await getNetWorthSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-48 rounded"></div>;
  }

  if (!summary) {
    return <div className="text-center py-8 text-gray-500">Failed to load net worth summary</div>;
  }

  const netWorthColor = summary.current_net_worth >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Net Worth Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Current Net Worth</p>
          <p className={`text-3xl font-bold ${netWorthColor}`}>
            {formatCurrency(summary.current_net_worth)}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Assets</p>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(summary.total_assets)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{summary.asset_count} assets</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Total Liabilities</p>
          <p className="text-3xl font-bold text-red-600">
            {formatCurrency(summary.total_liabilities)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{summary.liability_count} liabilities</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Liquid Assets</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.liquid_assets)}</p>
          </div>

          {summary.change_30_days !== undefined && (
            <div>
              <p className="text-sm text-gray-600">30-Day Change</p>
              <p className={`text-lg font-semibold ${summary.change_30_days >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.change_30_days)}
                {summary.change_30_days_pct !== undefined && (
                  <span className="text-sm ml-1">
                    ({formatPercentage(summary.change_30_days_pct)})
                  </span>
                )}
              </p>
            </div>
          )}

          {summary.change_1_year !== undefined && (
            <div>
              <p className="text-sm text-gray-600">1-Year Change</p>
              <p className={`text-lg font-semibold ${summary.change_1_year >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.change_1_year)}
                {summary.change_1_year_pct !== undefined && (
                  <span className="text-sm ml-1">
                    ({formatPercentage(summary.change_1_year_pct)})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
