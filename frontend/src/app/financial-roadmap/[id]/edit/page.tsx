'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { financialGoalsApi, FinancialGoal, GoalType, GoalStatus } from '@/lib/financial-goals-api';

const goalTypes: { value: GoalType; label: string }[] = [
  { value: 'savings', label: 'Savings' },
  { value: 'emergency_fund', label: 'Emergency Fund' },
  { value: 'debt_repayment', label: 'Debt Repayment' },
  { value: 'investment', label: 'Investment' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'home_purchase', label: 'Home Purchase' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'education', label: 'Education' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'other', label: 'Other' },
];

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_type: 'savings' as GoalType,
    target_amount: '',
    current_amount: '',
    monthly_contribution: '',
    target_date: '',
    status: 'active' as GoalStatus,
    priority: 1,
    notes: '',
  });

  useEffect(() => {
    loadGoal();
  }, [goalId]);

  const loadGoal = async () => {
    try {
      const data = await financialGoalsApi.getGoal(goalId);
      setGoal(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        goal_type: data.goal_type,
        target_amount: data.target_amount.toString(),
        current_amount: data.current_amount.toString(),
        monthly_contribution: data.monthly_contribution.toString(),
        target_date: data.target_date,
        status: data.status,
        priority: data.priority,
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Failed to load goal:', error);
      alert('Failed to load goal');
      router.push('/financial-roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await financialGoalsApi.updateGoal(goalId, {
        name: formData.name,
        description: formData.description || undefined,
        goal_type: formData.goal_type,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        monthly_contribution: parseFloat(formData.monthly_contribution),
        target_date: formData.target_date,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes || undefined,
      });

      router.push(`/financial-roadmap/${goalId}`);
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      await financialGoalsApi.deleteGoal(goalId);
      router.push('/financial-roadmap');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('Failed to delete goal');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/financial-roadmap/${goalId}`)}
            className="text-blue-600 hover:text-blue-700 mb-2"
          >
            ← Back to Goal
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Goal</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
            <select
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount *</label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount *</label>
              <input
                type="number"
                name="current_amount"
                value={formData.current_amount}
                onChange={handleChange}
                required
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Contribution</label>
            <input
              type="number"
              name="monthly_contribution"
              value={formData.monthly_contribution}
              onChange={handleChange}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Date *</label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Highest</option>
                <option value={2}>2 - High</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4 - Low</option>
                <option value={5}>5 - Lowest</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/financial-roadmap/${goalId}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
