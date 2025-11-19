'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getNetWorthTrends, NetWorthTrend, formatCurrency } from '@/lib/net-worth-api';

interface NetWorthChartProps {
  months?: number;
}

export default function NetWorthChart({ months = 12 }: NetWorthChartProps) {
  const [trends, setTrends] = useState<NetWorthTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, [months]);

  const loadTrends = async () => {
    try {
      const data = await getNetWorthTrends(months);
      setTrends(data);
    } catch (error) {
      console.error('Failed to load trends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded"></div>;
  }

  if (trends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No trend data available. Create snapshots to track your net worth over time.
      </div>
    );
  }

  const chartData = trends.map((t) => ({
    date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    'Net Worth': t.net_worth,
    'Assets': t.assets,
    'Liabilities': t.liabilities,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={(value) => formatCurrency(value)} />
          <Tooltip formatter={(value: any) => formatCurrency(value)} />
          <Legend />
          <Line type="monotone" dataKey="Net Worth" stroke="#22c55e" strokeWidth={2} />
          <Line type="monotone" dataKey="Assets" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="Liabilities" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
