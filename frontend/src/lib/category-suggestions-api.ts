import { api } from './api';

export interface CategorySuggestion {
  category_id: number;
  category_name: string;
  confidence: number;
  reason: 'exact_match' | 'keyword_match' | 'similar_amount' | 'frequently_used';
  usage_count: number;
}

export interface SuggestionRequest {
  budget_id: number;
  notes: string;
  amount_cents?: number;
}

export interface SuggestionResponse {
  suggestions: CategorySuggestion[];
}

export interface SuggestionFeedback {
  transaction_id?: number;
  suggested_category_id: number;
  actual_category_id: number;
  pattern_text: string;
}

export interface SuggestionStats {
  total_suggestions: number;
  accepted: number;
  rejected: number;
  accuracy: number;
}

export const categorySuggestionsApi = {
  getSuggestions: async (request: SuggestionRequest, limit: number = 3): Promise<SuggestionResponse> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    const response = await api.post(`/api/category-suggestions/suggest?${params}`, request);
    return response.data;
  },

  submitFeedback: async (feedback: SuggestionFeedback): Promise<void> => {
    await api.post('/api/category-suggestions/feedback', feedback);
  },

  getStats: async (days: number = 30): Promise<SuggestionStats> => {
    const params = new URLSearchParams({ days: days.toString() });
    const response = await api.get(`/api/category-suggestions/stats?${params}`);
    return response.data;
  },
};
