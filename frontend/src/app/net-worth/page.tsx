'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import NetWorthSummaryCard from '@/components/NetWorthSummaryCard';
import NetWorthChart from '@/components/NetWorthChart';
import NetWorthAlerts from '@/components/NetWorthAlerts';
import AssetLiabilityBreakdown from '@/components/AssetLiabilityBreakdown';
import { createSnapshot } from '@/lib/net-worth-api';

export default function NetWorthPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [timeRange, setTimeRange] = useState(12);

  const handleCreateSnapshot = async () => {
    if (creating) return;
    
    setCreating(true);
    try {
      await createSnapshot();
      alert('Snapshot created successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to create snapshot:', error);
      alert('Failed to create snapshot');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Net Worth Tracker</h1>
          <div className="flex gap-3">
            <button
              onClick={handleCreateSnapshot}
              disabled={creating}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create Snapshot'}
            </button>
            <button
              onClick={() => router.push('/net-worth/assets')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Manage Assets
            </button>
            <button
              onClick={() => router.push('/net-worth/liabilities')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Manage Liabilities
            </button>
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-6">
          <NetWorthAlerts />
        </div>

        {/* Summary Card */}
        <div className="mb-6">
          <NetWorthSummaryCard />
        </div>

        {/* Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Net Worth Trends</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="border rounded px-3 py-2"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={24}>24 Months</option>
              <option value={36}>36 Months</option>
            </select>
          </div>
          <NetWorthChart months={timeRange} />
        </div>

        {/* Asset & Liability Breakdown */}
        <AssetLiabilityBreakdown />

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/net-worth/assets/new')}
              className="border-2 border-dashed border-blue-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition"
            >
              <div className="text-4xl mb-2">💰</div>
              <div className="font-semibold">Add Asset</div>
              <div className="text-sm text-gray-600">Track a new asset</div>
            </button>
            <button
              onClick={() => router.push('/net-worth/liabilities/new')}
              className="border-2 border-dashed border-red-300 rounded-lg p-6 hover:border-red-500 hover:bg-red-50 transition"
            >
              <div className="text-4xl mb-2">💳</div>
              <div className="font-semibold">Add Liability</div>
              <div className="text-sm text-gray-600">Track a new debt</div>
            </button>
            <button
              onClick={() => router.push('/net-worth/projection')}
              className="border-2 border-dashed border-green-300 rounded-lg p-6 hover:border-green-500 hover:bg-green-50 transition"
            >
              <div className="text-4xl mb-2">📈</div>
              <div className="font-semibold">View Projection</div>
              <div className="text-sm text-gray-600">See future estimates</div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
