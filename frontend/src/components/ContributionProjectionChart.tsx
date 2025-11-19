'use client';

import { FinancialGoal, GoalProjection } from '@/lib/financial-goals-api';
import { formatCurrency } from '@/lib/utils';

interface ContributionProjectionChartProps {
  goal: FinancialGoal;
  projection: GoalProjection;
  simulatedContribution: number;
}

export default function ContributionProjectionChart({
  goal,
  projection,
  simulatedContribution,
}: ContributionProjectionChartProps) {
  // Calculate projection data points
  const months = Math.min(projection.months_remaining, 60); // Cap at 5 years
  const dataPoints: { month: number; amount: number }[] = [];
  
  for (let i = 0; i <= months; i++) {
    const amount = goal.current_amount + (simulatedContribution * i);
    dataPoints.push({ month: i, amount: Math.min(amount, goal.target_amount) });
  }

  const maxAmount = Math.max(goal.target_amount, projection.projected_final_amount);
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = 40;

  // Calculate SVG path
  const points = dataPoints.map((point, index) => {
    const x = padding + (index / months) * (chartWidth - 2 * padding);
    const y = chartHeight - padding - ((point.amount / maxAmount) * (chartHeight - 2 * padding));
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;

  // Target line
  const targetY = chartHeight - padding - ((goal.target_amount / maxAmount) * (chartHeight - 2 * padding));

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
            const y = chartHeight - padding - (fraction * (chartHeight - 2 * padding));
            return (
              <g key={fraction}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#6b7280"
                >
                  {formatCurrency(maxAmount * fraction)}
                </text>
              </g>
            );
          })}

          {/* Target line */}
          <line
            x1={padding}
            y1={targetY}
            x2={chartWidth - padding}
            y2={targetY}
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <text
            x={chartWidth - padding + 5}
            y={targetY + 4}
            fontSize="10"
            fill="#10b981"
            fontWeight="bold"
          >
            Target
          </text>

          {/* Projection line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Current position marker */}
          <circle
            cx={padding}
            cy={chartHeight - padding - ((goal.current_amount / maxAmount) * (chartHeight - 2 * padding))}
            r="5"
            fill="#3b82f6"
          />

          {/* X-axis labels */}
          {[0, Math.floor(months / 4), Math.floor(months / 2), Math.floor(3 * months / 4), months].map((month) => {
            const x = padding + (month / months) * (chartWidth - 2 * padding);
            return (
              <text
                key={month}
                x={x}
                y={chartHeight - padding + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {month}m
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-blue-600 rounded"></div>
          <span className="text-gray-600">Projected Growth</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-green-500 rounded border-dashed border-2 border-green-500"></div>
          <span className="text-gray-600">Target Amount</span>
        </div>
      </div>

      {/* Projection Summary */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-gray-600">With {formatCurrency(simulatedContribution)}/mo</div>
          <div className="font-semibold text-lg mt-1">
            {projection.months_remaining} months
          </div>
          <div className="text-xs text-gray-500">to reach goal</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-gray-600">Final Amount</div>
          <div className="font-semibold text-lg mt-1">
            {formatCurrency(projection.projected_final_amount)}
          </div>
          {projection.shortfall > 0 && (
            <div className="text-xs text-red-600">Shortfall: {formatCurrency(projection.shortfall)}</div>
          )}
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-gray-600">To Meet Target Date</div>
          <div className="font-semibold text-lg mt-1">
            {formatCurrency(projection.required_monthly_contribution)}/mo
          </div>
          <div className="text-xs text-gray-500">required</div>
        </div>
      </div>
    </div>
  );
}
