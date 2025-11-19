'use client';

import React, { useEffect, useState } from 'react';
import { categorySuggestionsApi, CategorySuggestion } from '@/lib/category-suggestions-api';

interface CategorySuggestionsProps {
  budgetId: number;
  notes: string;
  amountCents?: number;
  onSelectCategory: (categoryId: number, categoryName: string, suggestion: CategorySuggestion) => void;
  className?: string;
}

export default function CategorySuggestions({
  budgetId,
  notes,
  amountCents,
  onSelectCategory,
  className = '',
}: CategorySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<CategorySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!notes.trim() || notes.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await categorySuggestionsApi.getSuggestions({
          budget_id: budgetId,
          notes,
          amount_cents: amountCents,
        });
        setSuggestions(response.suggestions);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
        setError('Failed to load suggestions');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [budgetId, notes, amountCents]);

  const getReasonLabel = (reason: string): string => {
    const labels: Record<string, string> = {
      exact_match: 'Exact match',
      keyword_match: 'Similar transaction',
      similar_amount: 'Similar amount',
      frequently_used: 'Frequently used',
    };
    return labels[reason] || reason;
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getConfidenceBadge = (confidence: number): string => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!notes.trim() || notes.length < 3) {
    return null;
  }

  if (loading) {
    return (
      <div className={`mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
        <div className="flex items-center text-sm text-blue-700">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Finding suggestions...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`mt-2 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-center mb-2">
        <svg className="h-4 w-4 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-sm font-medium text-blue-900">Smart Suggestions</span>
      </div>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={`${suggestion.category_id}-${index}`}
            onClick={() => onSelectCategory(suggestion.category_id, suggestion.category_name, suggestion)}
            className="w-full text-left p-2 bg-white hover:bg-blue-50 border border-blue-200 hover:border-blue-400 rounded-md transition-all duration-150 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 group-hover:text-blue-700">
                    {suggestion.category_name}
                  </span>
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getConfidenceBadge(suggestion.confidence)}`}>
                    {Math.round(suggestion.confidence * 100)}% match
                  </span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>{getReasonLabel(suggestion.reason)}</span>
                  {suggestion.usage_count > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Used {suggestion.usage_count} time{suggestion.usage_count !== 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
              <svg className="h-5 w-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
      
      <p className="mt-2 text-xs text-gray-500 italic">
        Click a suggestion to apply it instantly
      </p>
    </div>
  );
}
