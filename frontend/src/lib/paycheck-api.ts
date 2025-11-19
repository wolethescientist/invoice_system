import { api } from './api';

export interface PaycheckAllocation {
  id?: number;
  category_id: number;
  amount_cents: number;
  order: number;
}

export interface Paycheck {
  id: number;
  user_id: number;
  name: string;
  amount_cents: number;
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'custom';
  next_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  allocations: PaycheckAllocation[];
}

export interface PaycheckInstance {
  id: number;
  paycheck_id: number;
  budget_id: number;
  amount_cents: number;
  date: string;
  is_received: boolean;
  created_at: string;
  allocations: PaycheckAllocation[];
}

export interface PaycheckSchedule {
  paycheck: Paycheck;
  upcoming_dates: string[];
  next_amount_cents: number;
}

export interface BudgetFundingPlan {
  budget_id: number;
  month: number;
  year: number;
  total_income_cents: number;
  total_allocated_cents: number;
  paychecks: PaycheckInstance[];
  available_to_allocate_cents: number;
  is_fully_funded: boolean;
}

export interface CategoryFundingStatus {
  category_id: number;
  category_name: string;
  allocated_cents: number;
  funded_cents: number;
  remaining_cents: number;
  is_fully_funded: boolean;
  funding_sources: Array<{
    instance_id: number;
    amount_cents: number;
  }>;
}

export const paycheckApi = {
  // Paycheck CRUD
  async createPaycheck(data: {
    name: string;
    amount_cents: number;
    frequency: string;
    next_date: string;
    is_active?: boolean;
    allocations?: PaycheckAllocation[];
  }): Promise<Paycheck> {
    const response = await api.post('/api/paychecks', data);
    return response.data;
  },

  async listPaychecks(activeOnly: boolean = true): Promise<Paycheck[]> {
    const response = await api.get(`/api/paychecks?active_only=${activeOnly}`);
    return response.data;
  },

  async getPaycheck(id: number): Promise<Paycheck> {
    const response = await api.get(`/api/paychecks/${id}`);
    return response.data;
  },

  async updatePaycheck(id: number, data: Partial<Paycheck>): Promise<Paycheck> {
    const response = await api.put(`/api/paychecks/${id}`, data);
    return response.data;
  },

  async deletePaycheck(id: number): Promise<void> {
    await api.delete(`/api/paychecks/${id}`);
  },

  // Schedule
  async getPaycheckSchedule(id: number, monthsAhead: number = 3): Promise<PaycheckSchedule> {
    const response = await api.get(`/api/paychecks/${id}/schedule?months_ahead=${monthsAhead}`);
    return response.data;
  },

  // Instances
  async createPaycheckInstance(data: {
    paycheck_id: number;
    budget_id: number;
    amount_cents: number;
    date: string;
    is_received?: boolean;
    allocations: PaycheckAllocation[];
  }): Promise<PaycheckInstance> {
    const response = await api.post('/api/paychecks/instances', data);
    return response.data;
  },

  async listBudgetPaycheckInstances(budgetId: number): Promise<PaycheckInstance[]> {
    const response = await api.get(`/api/paychecks/instances/budget/${budgetId}`);
    return response.data;
  },

  async markPaycheckReceived(instanceId: number): Promise<PaycheckInstance> {
    const response = await api.put(`/api/paychecks/instances/${instanceId}/receive`);
    return response.data;
  },

  // Budget funding
  async getBudgetFundingPlan(budgetId: number): Promise<BudgetFundingPlan> {
    const response = await api.get(`/api/paychecks/budget/${budgetId}/funding-plan`);
    return response.data;
  },

  async getCategoryFundingStatus(budgetId: number): Promise<CategoryFundingStatus[]> {
    const response = await api.get(`/api/paychecks/budget/${budgetId}/category-funding`);
    return response.data;
  },

  async autoAllocatePaychecks(budgetId: number): Promise<PaycheckInstance[]> {
    const response = await api.post(`/api/paychecks/budget/${budgetId}/auto-allocate`);
    return response.data;
  },
};
