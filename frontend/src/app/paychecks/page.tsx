'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/Button';
import { paycheckApi, Paycheck } from '@/lib/paycheck-api';

export default function PaychecksPage() {
  const router = useRouter();
  const [paychecks, setPaychecks] = useState<Paycheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    loadPaychecks();
  }, [showInactive]);

  const loadPaychecks = async () => {
    try {
      setLoading(true);
      const data = await paycheckApi.listPaychecks(!showInactive);
      setPaychecks(data);
    } catch (error) {
      console.error('Failed to load paychecks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this paycheck?')) return;
    
    try {
      await paycheckApi.deletePaycheck(id);
      loadPaychecks();
    } catch (error) {
      console.error('Failed to delete paycheck:', error);
      alert('Failed to delete paycheck');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatFrequency = (freq: string) => {
    const map: Record<string, string> = {
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      semimonthly: 'Semi-monthly',
      monthly: 'Monthly',
      custom: 'Custom',
    };
    return map[freq] || freq;
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paycheck Planning</h1>
            <p className="text-gray-600 mt-1">Manage your income schedules and allocations</p>
          </div>
          <Button onClick={() => router.push('/paychecks/new')}>
            Add Paycheck
          </Button>
        </div>

        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="mr-2"
            />
            Show inactive paychecks
          </label>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : paychecks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No paychecks found</p>
            <Button onClick={() => router.push('/paychecks/new')}>
              Create Your First Paycheck
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {paychecks.map((paycheck) => (
              <div
                key={paycheck.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {paycheck.name}
                      </h3>
                      {!paycheck.is_active && (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(paycheck.amount_cents)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Frequency</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatFrequency(paycheck.frequency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Next Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(paycheck.next_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {paycheck.allocations && paycheck.allocations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500">
                          {paycheck.allocations.length} category allocation(s)
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/paychecks/${paycheck.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/paychecks/${paycheck.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(paycheck.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
