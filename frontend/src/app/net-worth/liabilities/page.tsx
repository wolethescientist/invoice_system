'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import {
  getLiabilities,
  deleteLiability,
  Liability,
  formatCurrency,
  getLiabilityTypeLabel,
} from '@/lib/net-worth-api';

export default function LiabilitiesPage() {
  const router = useRouter();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);
  const [includeInactive, setIncludeInactive] = useState(false);

  useEffect(() => {
    loadLiabilities();
  }, [includeInactive]);

  const loadLiabilities = async () => {
    try {
      const data = await getLiabilities(includeInactive);
      setLiabilities(data);
    } catch (error) {
      console.error('Failed to load liabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteLiability(id);
      setLiabilities(liabilities.filter((l) => l.id !== id));
    } catch (error) {
      console.error('Failed to delete liability:', error);
      alert('Failed to delete liability');
    }
  };

  const totalBalance = liabilities.filter(l => l.is_active).reduce((sum, l) => sum + l.current_balance, 0);
  const totalMinPayment = liabilities.filter(l => l.is_active).reduce((sum, l) => sum + l.minimum_payment, 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Liabilities</h1>
            <p className="text-gray-600 mt-1">
              Total: {formatCurrency(totalBalance)} | Min Payment: {formatCurrency(totalMinPayment)}/mo
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/net-worth')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Back to Net Worth
            </button>
            <button
              onClick={() => router.push('/net-worth/liabilities/new')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Add Liability
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show inactive liabilities</span>
          </label>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading liabilities...</div>
        ) : liabilities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No liabilities found</p>
            <button
              onClick={() => router.push('/net-worth/liabilities/new')}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Add Your First Liability
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institution</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Interest</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Min Payment</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {liabilities.map((liability) => (
                  <tr key={liability.id} className={!liability.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{liability.name}</div>
                      {liability.account_number_last4 && (
                        <div className="text-sm text-gray-500">****{liability.account_number_last4}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLiabilityTypeLabel(liability.liability_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {liability.institution || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(liability.current_balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {(liability.interest_rate || 0).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(liability.minimum_payment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {liability.is_active ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/net-worth/liabilities/${liability.id}/edit`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(liability.id, liability.name)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
