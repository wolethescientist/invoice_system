'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { financialGoalsApi, GoalType } from '@/lib/financial-goals-api';

const goalTypes: { value: GoalType; label: string; description: string }[] = [
  { value: 'savings', label: 'Savings', description: 'General savings goal' },
  { value: 'emergency_fund', label: 'Emergency Fund', description: '3-6 months of expenses' },
  { value: 'debt_repayment', label: 'Debt Repayment', description: 'Pay off loans or credit cards' },
  { value: 'investment', label: 'Investment', description: 'Build investment portfolio' },
  { value: 'retirement', label: 'Retirement', description: 'Long-term retirement savings' },
  { value: 'home_purchase', label: 'Home Purchase', description: 'Down payment for a house' },
  { value: 'vehicle', label: 'Vehicle', description: 'Car or vehicle purchase' },
  { value: 'education', label: 'Education', description: 'College or training fund' },
  { value: 'vacation', label: 'Vacation', description: 'Travel and vacation fund' },
  { value: 'other', label: 'Other', description: 'Custom financial goal' },
];

export default function NewGoalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_type: 'savings' as GoalType,
    target_amount: '',
    monthly_contribution: '',
    target_date: '',
    start_date: new Date().toISOString().split('T')[0],
    priority: 1,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const goal = await financialGoalsApi.createGoal({
        name: formData.name,
        description: formData.description || undefined,
        goal_type: formData.goal_type,
        target_amount: parseFloat(formData.target_amount),
        monthly_contribution: parseFloat(formData.monthly_contribution) || 0,
        target_date: formData.target_date,
        start_date: formData.start_date,
        priority: formData.priority,
        notes: formData.notes || undefined,
      });

      router.push(`/financial-roadmap/${goal.id}`);
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push('/financial-roadmap')}
            className="text-blue-600 hover:text-blue-700 mb-2"
          >
            ← Back to Roadmap
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Goal</h1>
          <p className="text-gray-600 mt-1">Set up a new financial goal to track</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Type *
            </label>
            <select
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Emergency Fund, House Down Payment"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Optional description of your goal"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Monthly Contribution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Contribution
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                name="monthly_contribution"
                value={formData.monthly_contribution}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              How much you plan to contribute each month
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date *
              </label>
              <input
                type="date"
                name="target_date"
                value={formData.target_date}
                onChange={handleChange}
                required
                min={formData.start_date}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority (1 = Highest, 5 = Lowest)
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>1 - Highest Priority</option>
              <option value={2}>2 - High Priority</option>
              <option value={3}>3 - Medium Priority</option>
              <option value={4}>4 - Low Priority</option>
              <option value={5}>5 - Lowest Priority</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Additional notes or details"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/financial-roadmap')}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
