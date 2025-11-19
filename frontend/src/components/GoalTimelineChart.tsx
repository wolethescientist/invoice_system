'use client';

import { FinancialGoal } from '@/lib/financial-goals-api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface GoalTimelineChartProps {
  goal: FinancialGoal;
}

export default function GoalTimelineChart({ goal }: GoalTimelineChartProps) {
  const startDate = new Date(goal.start_date);
  const targetDate = new Date(goal.target_date);
  const today = new Date();

  const totalDays = Math.floor((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeProgress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  const amountProgress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);

  // Calculate milestones positions
  const milestones = goal.milestones.map(milestone => {
    const milestoneDate = new Date(milestone.target_date);
    const milestoneDays = Math.floor((milestoneDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const position = Math.min(Math.max((milestoneDays / totalDays) * 100, 0), 100);
    return { ...milestone, position };
  });

  return (
    <div className="space-y-6">
      {/* Time Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Time Progress</span>
          <span className="font-medium">{timeProgress.toFixed(1)}% elapsed</span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-blue-400 h-6 rounded-full transition-all flex items-center justify-end pr-2"
              style={{ width: `${timeProgress}%` }}
            >
              <span className="text-xs text-white font-medium">Today</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatDate(goal.start_date)}</span>
            <span>{formatDate(goal.target_date)}</span>
          </div>
        </div>
      </div>

      {/* Amount Progress Bar */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Amount Progress</span>
          <span className="font-medium">{amountProgress.toFixed(1)}% complete</span>
        </div>
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div
              className="bg-green-500 h-6 rounded-full transition-all flex items-center justify-end pr-2"
              style={{ width: `${amountProgress}%` }}
            >
              <span className="text-xs text-white font-medium">{formatCurrency(goal.current_amount)}</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>{formatCurrency(goal.target_amount)}</span>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className={`p-4 rounded-lg ${amountProgress >= timeProgress ? 'bg-green-50' : 'bg-yellow-50'}`}>
        <div className="text-sm font-medium">
          {amountProgress >= timeProgress ? (
            <span className="text-green-700">✓ You're ahead of schedule!</span>
          ) : (
            <span className="text-yellow-700">⚠ You're behind schedule</span>
          )}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {amountProgress >= timeProgress
            ? `Your savings are ${(amountProgress - timeProgress).toFixed(1)}% ahead of the timeline.`
            : `You need to increase contributions to catch up by ${(timeProgress - amountProgress).toFixed(1)}%.`}
        </div>
      </div>

      {/* Milestones Timeline */}
      {milestones.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Milestones</h3>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="absolute"
                  style={{ left: `${milestone.position}%`, transform: 'translateX(-50%)' }}
                >
                  <div
                    className={`w-4 h-4 rounded-full -mt-1 ${
                      milestone.achieved ? 'bg-green-500' : 'bg-gray-400'
                    } border-2 border-white`}
                  />
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 text-center">
                    <div className={`text-xs font-medium ${milestone.achieved ? 'text-green-700' : 'text-gray-600'}`}>
                      {milestone.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(milestone.target_amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
