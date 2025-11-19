'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  financialGoalsApi, 
  FinancialGoal, 
  GoalProjection,
  GoalContribution,
  GoalMilestone 
} from '@/lib/financial-goals-api';
import { formatCurrency, formatDate } from '@/lib/utils';
import GoalTimelineChart from '../../../components/GoalTimelineChart';
import ContributionProjectionChart from '../../../components/ContributionProjectionChart';

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = parseInt(params.id as string);

  const [goal, setGoal] = useState<FinancialGoal | null>(null);
  const [projection, setProjection] = useState<GoalProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [simulatedContribution, setSimulatedContribution] = useState<number>(0);

  useEffect(() => {
    loadGoalData();
  }, [goalId]);

  useEffect(() => {
    if (goal) {
      setSimulatedContribution(goal.monthly_contribution);
    }
  }, [goal]);

  useEffect(() => {
    if (simulatedContribution > 0) {
      loadProjection(simulatedContribution);
    }
  }, [simulatedContribution]);

  const loadGoalData = async () => {
    try {
      setLoading(true);
      const [goalData, projectionData] = await Promise.all([
        financialGoalsApi.getGoal(goalId),
        financialGoalsApi.getProjection(goalId),
      ]);
      setGoal(goalData);
      setProjection(projectionData);
    } catch (error) {
      console.error('Failed to load goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjection = async (monthlyAmount: number) => {
    try {
      const projectionData = await financialGoalsApi.getProjection(goalId, monthlyAmount);
      setProjection(projectionData);
    } catch (error) {
      console.error('Failed to load projection:', error);
    }
  };

  const handleAddContribution = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await financialGoalsApi.addContribution(goalId, {
        amount: parseFloat(formData.get('amount') as string),
        contribution_date: formData.get('date') as string,
        notes: formData.get('notes') as string || undefined,
      });
      setShowContributionForm(false);
      loadGoalData();
    } catch (error) {
      console.error('Failed to add contribution:', error);
      alert('Failed to add contribution');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await financialGoalsApi.createMilestone(goalId, {
        name: formData.get('name') as string,
        target_amount: parseFloat(formData.get('amount') as string),
        target_date: formData.get('date') as string,
      });
      setShowMilestoneForm(false);
      loadGoalData();
    } catch (error) {
      console.error('Failed to add milestone:', error);
      alert('Failed to add milestone');
    }
  };

  const toggleMilestone = async (milestone: GoalMilestone) => {
    try {
      await financialGoalsApi.updateMilestone(goalId, milestone.id, {
        achieved: !milestone.achieved,
      });
      loadGoalData();
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  if (loading || !goal) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading goal details...</div>
        </div>
      </DashboardLayout>
    );
  }

  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  const remaining = goal.target_amount - goal.current_amount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.push('/financial-roadmap')}
              className="text-blue-600 hover:text-blue-700 mb-2"
            >
              ← Back to Roadmap
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{goal.name}</h1>
            {goal.description && (
              <p className="text-gray-600 mt-1">{goal.description}</p>
            )}
          </div>
          <button
            onClick={() => router.push(`/financial-roadmap/${goalId}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Edit Goal
          </button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600">Current Amount</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(goal.current_amount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Target Amount</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(goal.target_amount)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Remaining</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(remaining)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Target Date</div>
              <div className="text-2xl font-bold text-gray-900">{formatDate(goal.target_date)}</div>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Projection & Interactive Simulation */}
        {projection && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Projection & Simulation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${projection.on_track ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <div className="text-sm text-gray-600">Status</div>
                <div className="text-lg font-semibold">
                  {projection.on_track ? '✓ On Track' : '⚠ Behind Schedule'}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">Projected Completion</div>
                <div className="text-lg font-semibold">{formatDate(projection.projected_completion_date)}</div>
                <div className="text-xs text-gray-500">{projection.months_remaining} months</div>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-600">Required Monthly</div>
                <div className="text-lg font-semibold">{formatCurrency(projection.required_monthly_contribution)}</div>
              </div>
            </div>

            {/* Interactive Contribution Slider */}
            <div className="border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Simulate Monthly Contribution: {formatCurrency(simulatedContribution)}
              </label>
              <input
                type="range"
                min="0"
                max={goal.target_amount / 12}
                step="50"
                value={simulatedContribution}
                onChange={(e) => setSimulatedContribution(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$0</span>
                <span>{formatCurrency(goal.target_amount / 12)}</span>
              </div>
            </div>

            {/* Projection Chart */}
            <div className="mt-6">
              <ContributionProjectionChart
                goal={goal}
                projection={projection}
                simulatedContribution={simulatedContribution}
              />
            </div>
          </div>
        )}

        {/* Timeline Visualization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Timeline</h2>
          <GoalTimelineChart goal={goal} />
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Milestones</h2>
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="text-blue-600 hover:text-blue-700"
            >
              + Add Milestone
            </button>
          </div>

          {showMilestoneForm && (
            <form onSubmit={handleAddMilestone} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Milestone name"
                  required
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Target amount"
                  step="0.01"
                  required
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  name="date"
                  required
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowMilestoneForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {goal.milestones.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No milestones yet</p>
            ) : (
              goal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    milestone.achieved ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={milestone.achieved}
                      onChange={() => toggleMilestone(milestone)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-medium">{milestone.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(milestone.target_amount)} by {formatDate(milestone.target_date)}
                      </div>
                    </div>
                  </div>
                  {milestone.achieved && milestone.achieved_date && (
                    <div className="text-sm text-green-600">
                      ✓ Achieved {formatDate(milestone.achieved_date)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contributions History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Contributions</h2>
            <button
              onClick={() => setShowContributionForm(!showContributionForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              + Add Contribution
            </button>
          </div>

          {showContributionForm && (
            <form onSubmit={handleAddContribution} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  step="0.01"
                  required
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="notes"
                  placeholder="Notes (optional)"
                  className="px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowContributionForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {goal.contributions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No contributions yet</p>
            ) : (
              goal.contributions
                .sort((a, b) => new Date(b.contribution_date).getTime() - new Date(a.contribution_date).getTime())
                .map((contribution) => (
                  <div key={contribution.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{formatCurrency(contribution.amount)}</div>
                      {contribution.notes && (
                        <div className="text-sm text-gray-600">{contribution.notes}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{formatDate(contribution.contribution_date)}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
