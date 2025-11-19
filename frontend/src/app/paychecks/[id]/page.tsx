'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/Button';
import { paycheckApi, Paycheck, PaycheckSchedule } from '@/lib/paycheck-api';

export default function PaycheckDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id as string);
  
  const [paycheck, setPaycheck] = useState<Paycheck | null>(null);
  const [schedule, setSchedule] = useState<PaycheckSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaycheck();
    loadSchedule();
  }, [id]);

  const loadPaycheck = async () => {
    try {
      const data = await paycheckApi.getPaycheck(id);
      setPaycheck(data);
    } catch (error) {
      console.error('Failed to load paycheck:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      const data = await paycheckApi.getPaycheckSchedule(id, 6);
      setSchedule(data);
    } catch (error) {
      console.error('Failed to load schedule:', error);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!paycheck) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Paycheck not found</p>
          <Button onClick={() => router.push('/paychecks')} className="mt-4">
            Back to Paychecks
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{paycheck.name}</h1>
            <p className="text-gray-600 mt-1">Paycheck details and schedule</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/paychecks/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/paychecks')}
            >
              Back
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Paycheck Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Paycheck Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
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
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paycheck.is_active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Schedule */}
          {schedule && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Paychecks</h2>
              <div className="space-y-2">
                {schedule.upcoming_dates.map((date, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-700">
                      {new Date(date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(schedule.next_amount_cents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Allocations */}
          {paycheck.allocations && paycheck.allocations.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Default Allocations
              </h2>
              <div className="space-y-2">
                {paycheck.allocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded"
                  >
                    <span className="text-gray-700">Category ID: {allocation.category_id}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(allocation.amount_cents)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
