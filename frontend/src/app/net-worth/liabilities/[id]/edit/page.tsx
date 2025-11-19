'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { getLiability, updateLiability } from '@/lib/net-worth-api';

const liabilityTypes = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'auto_loan', label: 'Auto Loan' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'medical_debt', label: 'Medical Debt' },
  { value: 'other', label: 'Other' },
];

export default function EditLiabilityPage() {
  const router = useRouter();
  const params = useParams();
  const liabilityId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    liability_type: 'credit_card',
    current_balance: '',
    interest_rate: '',
    minimum_payment: '',
    institution: '',
    account_number_last4: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    loadLiability();
  }, [liabilityId]);

  const loadLiability = async () => {
    try {
      const liability = await getLiability(liabilityId);
      setFormData({
        name: liability.name,
        liability_type: liability.liability_type,
        current_balance: liability.current_balance.toString(),
        interest_rate: liability.interest_rate.toString(),
        minimum_payment: liability.minimum_payment.toString(),
        institution: liability.institution || '',
        account_number_last4: liability.account_number_last4 || '',
        notes: liability.notes || '',
        is_active: liability.is_active,
      });
    } catch (error) {
      console.error('Failed to load liability:', error);
      alert('Failed to load liability');
      router.push('/net-worth/liabilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateLiability(liabilityId, {
        ...formData,
        current_balance: parseFloat(formData.current_balance),
        interest_rate: parseFloat(formData.interest_rate) || 0,
        minimum_payment: parseFloat(formData.minimum_payment) || 0,
      });
      router.push('/net-worth/liabilities');
    } catch (error) {
      console.error('Failed to update liability:', error);
      alert('Failed to update liability');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading liability...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Liability</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liability Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Chase Credit Card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Liability Type *
              </label>
              <select
                required
                value={formData.liability_type}
                onChange={(e) => setFormData({ ...formData, liability_type: e.target.value })}
                className="w-full border rounded px-3 py-2"
              >
                {liabilityTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.current_balance}
                onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Monthly Payment
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minimum_payment}
                onChange={(e) => setFormData({ ...formData, minimum_payment: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="e.g., Chase Bank"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number (Last 4 digits)
              </label>
              <input
                type="text"
                maxLength={4}
                value={formData.account_number_last4}
                onChange={(e) => setFormData({ ...formData, account_number_last4: e.target.value })}
                className="w-full border rounded px-3 py-2"
                placeholder="1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active (include in net worth calculations)
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
