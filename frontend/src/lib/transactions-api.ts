import { api } from './api';

export interface TransactionSplit {
  category_id: number;
  amount_cents: number;
  notes?: string;
}

export interface TransactionCreate {
  budget_id: number;
  category_id?: number;
  amount_cents: number;
  date: string;
  notes: string;
  is_split: boolean;
  splits?: TransactionSplit[];
}

export interface Transaction {
  id: number;
  user_id: number;
  budget_id: number;
  category_id: number | null;
  amount_cents: number;
  date: string;
  notes: string | null;
  is_split: boolean;
  created_at: string;
  updated_at: string;
  splits?: any[];
}

export const transactionsApi = {
  create: async (data: TransactionCreate): Promise<Transaction> => {
    const response = await api.post('/api/transactions', data);
    return response.data;
  },

  list: async (params?: {
    budget_id?: number;
    category_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }): Promise<Transaction[]> => {
    const queryParams = new URLSearchParams();
    if (params?.budget_id) queryParams.append('budget_id', params.budget_id.toString());
    if (params?.category_id) queryParams.append('category_id', params.category_id.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/api/transactions?${queryParams}`);
    return response.data;
  },

  get: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/api/transactions/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<TransactionCreate>): Promise<Transaction> => {
    const response = await api.put(`/api/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/transactions/${id}`);
  },

  getSummary: async (budgetId: number): Promise<any> => {
    const response = await api.get(`/api/transactions/budget/${budgetId}/summary`);
    return response.data;
  },
};
