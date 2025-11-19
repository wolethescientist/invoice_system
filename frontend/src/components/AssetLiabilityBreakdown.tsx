'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import {
  getAssetBreakdown,
  getLiabilityBreakdown,
  AssetBreakdown,
  LiabilityBreakdown,
  formatCurrency,
  getAssetTypeLabel,
  getLiabilityTypeLabel,
} from '@/lib/net-worth-api';

export default function AssetLiabilityBreakdown() {
  const [assetBreakdown, setAssetBreakdown] = useState<AssetBreakdown[]>([]);
  const [liabilityBreakdown, setLiabilityBreakdown] = useState<LiabilityBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBreakdowns();
  }, []);

  const loadBreakdowns = async () => {
    try {
      const [assets, liabilities] = await Promise.all([
        getAssetBreakdown(),
        getLiabilityBreakdown(),
      ]);
      setAssetBreakdown(assets);
      setLiabilityBreakdown(liabilities);
    } catch (error) {
      console.error('Failed to load breakdowns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded"></div>;
  }

  const assetColors = ['#3b82f6', '#22c55e', '#a855f7', '#fb923c', '#ec4899', '#0ea5e9', '#84cc16', '#facc15'];
  const liabilityColors = ['#ef4444', '#f97316', '#ea580c', '#dc2626', '#b91c1c'];

  const assetChartData = assetBreakdown.map((a, index) => ({
    name: getAssetTypeLabel(a.asset_type),
    value: a.total_value,
    color: assetColors[index % assetColors.length],
  }));

  const liabilityChartData = liabilityBreakdown.map((l, index) => ({
    name: getLiabilityTypeLabel(l.liability_type),
    value: l.total_balance,
    color: liabilityColors[index % liabilityColors.length],
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Assets Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Asset Breakdown</h3>
        {assetBreakdown.length > 0 ? (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assetChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {assetBreakdown.map((asset, index) => (
                <div key={asset.asset_type} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: assetColors[index] }}
                    ></div>
                    <span>{getAssetTypeLabel(asset.asset_type)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(asset.total_value)}</div>
                    <div className="text-gray-500 text-xs">{asset.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No assets to display</div>
        )}
      </div>

      {/* Liabilities Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Liability Breakdown</h3>
        {liabilityBreakdown.length > 0 ? (
          <>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={liabilityChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {liabilityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {liabilityBreakdown.map((liability, index) => (
                <div key={liability.liability_type} className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: liabilityColors[index] }}
                    ></div>
                    <span>{getLiabilityTypeLabel(liability.liability_type)}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(liability.total_balance)}</div>
                    <div className="text-gray-500 text-xs">{liability.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No liabilities to display</div>
        )}
      </div>
    </div>
  );
}
