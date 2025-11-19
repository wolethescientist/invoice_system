'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CategorySuggestions from './CategorySuggestions';
import { categorySuggestionsApi, CategorySuggestion } from '@/lib/category-suggestions-api';
import { transactionsApi } from '@/lib/transactions-api';

interface Category {
  id: number;
  name: string;
  allocated_cents: number;
  spent_cents?: number;
}

interface SmartTransactionFormProps {
  budgetId: number;
  categories: Category[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SmartTransactionForm({
  budgetId,
  categories,
  onSuccess,
  onCancel,
}: SmartTransactionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    category_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<CategorySuggestion | null>(null);
  const [categoryUpdated, setCategoryUpdated] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountCents = Math.round(parseFloat(formData.amount) * 100);
      
      const transaction = await transactionsApi.create({
        budget_id: budgetId,
        category_id: parseInt(formData.category_id),
        amount_cents: amountCents,
        date: formData.date,
        notes: formData.notes,
        is_split: false,
        splits: [],
      });

      // Submit feedback if a suggestion was used
      if (suggestedCategory) {
        try {
          await categorySuggestionsApi.submitFeedback({
            transaction_id: transaction.id,
            suggested_category_id: suggestedCategory.category_id,
            actual_category_id: parseInt(formData.category_id),
            pattern_text: formData.notes,
          });
        } catch (err) {
          console.error('Failed to submit feedback:', err);
          // Don't fail the transaction if feedback fails
        }
      }

      // Reset form
      setFormData({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
        category_id: '',
      });
      setSuggestedCategory(null);
      setCategoryUpdated(false);

      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (categoryId: number, categoryName: string, suggestion: CategorySuggestion) => {
    setFormData(prev => ({ ...prev, category_id: categoryId.toString() }));
    setSuggestedCategory(suggestion);
    setCategoryUpdated(true);
    
    // Show visual feedback
    setTimeout(() => setCategoryUpdated(false), 2000);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, category_id: e.target.value }));
    // Clear suggestion if manually changed
    if (suggestedCategory && parseInt(e.target.value) !== suggestedCategory.category_id) {
      setSuggestedCategory(null);
    }
  };

  const selectedCategory = categories.find(c => c.id === parseInt(formData.category_id));
  const remainingCents = selectedCategory 
    ? (selectedCategory.allocated_cents - (selectedCategory.spent_cents || 0))
    : 0;
  const amountCents = formData.amount ? Math.round(parseFloat(formData.amount) * 100) : 0;
  const willExceedBudget = amountCents > remainingCents;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description / Notes
        </label>
        <input
          type="text"
          required
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Grocery shopping at Walmart"
        />
        <p className="mt-1 text-xs text-gray-500">
          Type a description to get smart category suggestions
        </p>
      </div>

      {/* Smart Suggestions */}
      <CategorySuggestions
        budgetId={budgetId}
        notes={formData.notes}
        amountCents={amountCents || undefined}
        onSelectCategory={handleSuggestionSelect}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          required
          value={formData.category_id}
          onChange={handleCategoryChange}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            categoryUpdated ? 'border-green-500 bg-green-50' : 'border-gray-300'
          }`}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} (${((category.allocated_cents - (category.spent_cents || 0)) / 100).toFixed(2)} remaining)
            </option>
          ))}
        </select>
        
        {categoryUpdated && (
          <div className="mt-1 flex items-center text-sm text-green-600">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Category applied from suggestion
          </div>
        )}
      </div>

      {/* Budget Warning */}
      {selectedCategory && willExceedBudget && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">Budget Warning</p>
              <p className="text-sm text-yellow-700 mt-1">
                This transaction will exceed your budget for {selectedCategory.name} by ${((amountCents - remainingCents) / 100).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Budget Preview */}
      {selectedCategory && (
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{selectedCategory.name}</span>
            <span className="text-sm text-gray-600">
              ${(remainingCents / 100).toFixed(2)} remaining
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                willExceedBudget ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min(((selectedCategory.spent_cents || 0) + amountCents) / selectedCategory.allocated_cents * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
            <span>After transaction: ${((remainingCents - amountCents) / 100).toFixed(2)}</span>
            <span>${(selectedCategory.allocated_cents / 100).toFixed(2)} allocated</span>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Adding...' : 'Add Transaction'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
