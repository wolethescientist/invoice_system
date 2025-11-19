'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { financialGoalsApi, FinancialGoal, GoalSummary } from '@/lib/financial-goals-api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function FinancialRoadmapPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsData, summaryData] = await Promise.all([
        financialGoalsApi.getGoals(filter === 'all' ? undefined : filter),
        financialGoalsApi.getSummary(),
      ]);
      setGoals(goalsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (goal: FinancialGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getGoalTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: number) => {
    const labels = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
    return labels[priority - 1] || 'Medium';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading financial roadmap...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Roadmap</h1>
            <p className="text-gray-600 mt-1">Track your long-term financial goals</p>
          </div>
          <button
            onClick={() => router.push('/financial-roadmap/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Goal
          </button>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Goals</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{summary.total_goals}</div>
              <div className="text-xs text-gray-500 mt-1">
                {summary.active_goals} active, {summary.completed_goals} completed
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Total Target</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.total_target_amount)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Current Progress</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.total_current_amount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {summary.overall_progress_percentage.toFixed(1)}% complete
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600">Monthly Contributions</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.total_monthly_contributions)}
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {(['all', 'active', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Goals List */}
          <div className="p-6">
            {goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No goals found</p>
                <button
                  onClick={() => router.push('/financial-roadmap/new')}
                  className="mt-4 text-blue-600 hover:text-blue-700"
                >
                  Create your first goal
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const progress = getProgressPercentage(goal);
                  return (
                    <div
                      key={goal.id}
                      onClick={() => router.push(`/financial-roadmap/${goal.id}`)}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(goal.status)}`}>
                              {goal.status}
                            </span>
                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {getGoalTypeLabel(goal.goal_type)}
                            </span>
                          </div>
                          {goal.description && (
                            <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Priority</div>
                          <div className="text-sm font-medium">{getPriorityLabel(goal.priority)}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-600 h-3 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Current</div>
                          <div className="font-semibold">{formatCurrency(goal.current_amount)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Target</div>
                          <div className="font-semibold">{formatCurrency(goal.target_amount)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Monthly</div>
                          <div className="font-semibold">{formatCurrency(goal.monthly_contribution)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Target Date</div>
                          <div className="font-semibold">{formatDate(goal.target_date)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
