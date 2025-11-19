import { api } from './api';

async function apiRequest(url: string, options?: RequestInit) {
  const response = await api.request({
    url,
    method: options?.method || 'GET',
    data: options?.body ? JSON.parse(options.body as string) : undefined,
  });
  return response.data;
}

export interface FinancialGoal {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  goal_type: GoalType;
  target_amount: number;
  current_amount: number;
  monthly_contribution: number;
  target_date: string;
  start_date: string;
  status: GoalStatus;
  priority: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  contributions: GoalContribution[];
  milestones: GoalMilestone[];
}

export type GoalType = 
  | 'savings'
  | 'debt_repayment'
  | 'investment'
  | 'emergency_fund'
  | 'retirement'
  | 'education'
  | 'home_purchase'
  | 'vehicle'
  | 'vacation'
  | 'other';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled';

export interface GoalContribution {
  id: number;
  goal_id: number;
  amount: number;
  contribution_date: string;
  notes?: string;
  created_at: string;
}

export interface GoalMilestone {
  id: number;
  goal_id: number;
  name: string;
  target_amount: number;
  target_date: string;
  achieved: boolean;
  achieved_date?: string;
  created_at: string;
}

export interface GoalProjection {
  goal_id: number;
  projected_completion_date: string;
  months_remaining: number;
  on_track: boolean;
  required_monthly_contribution: number;
  projected_final_amount: number;
  shortfall: number;
}

export interface GoalSummary {
  total_goals: number;
  active_goals: number;
  completed_goals: number;
  total_target_amount: number;
  total_current_amount: number;
  total_monthly_contributions: number;
  overall_progress_percentage: number;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  goal_type: GoalType;
  target_amount: number;
  monthly_contribution: number;
  target_date: string;
  start_date: string;
  priority?: number;
  notes?: string;
}

export interface UpdateGoalData {
  name?: string;
  description?: string;
  goal_type?: GoalType;
  target_amount?: number;
  current_amount?: number;
  monthly_contribution?: number;
  target_date?: string;
  status?: GoalStatus;
  priority?: number;
  notes?: string;
}

export interface CreateContributionData {
  amount: number;
  contribution_date: string;
  notes?: string;
}

export interface CreateMilestoneData {
  name: string;
  target_amount: number;
  target_date: string;
}

export interface UpdateMilestoneData {
  name?: string;
  target_amount?: number;
  target_date?: string;
  achieved?: boolean;
}

export const financialGoalsApi = {
  // Goals
  getGoals: async (status?: GoalStatus): Promise<FinancialGoal[]> => {
    const params = status ? `?status=${status}` : '';
    return apiRequest(`/api/financial-goals${params}`);
  },

  getGoal: async (id: number): Promise<FinancialGoal> => {
    return apiRequest(`/api/financial-goals/${id}`);
  },

  createGoal: async (data: CreateGoalData): Promise<FinancialGoal> => {
    return apiRequest('/api/financial-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGoal: async (id: number, data: UpdateGoalData): Promise<FinancialGoal> => {
    return apiRequest(`/api/financial-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteGoal: async (id: number): Promise<void> => {
    return apiRequest(`/api/financial-goals/${id}`, {
      method: 'DELETE',
    });
  },

  getSummary: async (): Promise<GoalSummary> => {
    return apiRequest('/api/financial-goals/summary');
  },

  getProjection: async (id: number, monthlyContribution?: number): Promise<GoalProjection> => {
    const params = monthlyContribution ? `?monthly_contribution=${monthlyContribution}` : '';
    return apiRequest(`/api/financial-goals/${id}/projection${params}`);
  },

  // Contributions
  addContribution: async (goalId: number, data: CreateContributionData): Promise<GoalContribution> => {
    return apiRequest(`/api/financial-goals/${goalId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getContributions: async (goalId: number): Promise<GoalContribution[]> => {
    return apiRequest(`/api/financial-goals/${goalId}/contributions`);
  },

  // Milestones
  createMilestone: async (goalId: number, data: CreateMilestoneData): Promise<GoalMilestone> => {
    return apiRequest(`/api/financial-goals/${goalId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMilestones: async (goalId: number): Promise<GoalMilestone[]> => {
    return apiRequest(`/api/financial-goals/${goalId}/milestones`);
  },

  updateMilestone: async (
    goalId: number,
    milestoneId: number,
    data: UpdateMilestoneData
  ): Promise<GoalMilestone> => {
    return apiRequest(`/api/financial-goals/${goalId}/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteMilestone: async (goalId: number, milestoneId: number): Promise<void> => {
    return apiRequest(`/api/financial-goals/${goalId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  },
};
