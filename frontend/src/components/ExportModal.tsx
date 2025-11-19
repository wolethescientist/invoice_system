'use client';

import { useState, useEffect } from 'react';
import { api, getAccessToken } from '@/lib/api';
import {
  exportTransactionsCSV,
  exportTransactionSplitsCSV,
  exportBudgetSummaryCSV,
  ExportFilters
} from '@/lib/exports-api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'transactions' | 'splits' | 'budgets';
  defaultFilters?: ExportFilters;
}

interface Budget {
  id: number;
  month: number;
  year: number;
}

export default function ExportModal({
  isOpen,
  onClose,
  defaultType = 'transactions',
  defaultFilters = {}
}: ExportModalProps) {
  const [exportType, setExportType] = useState(defaultType);
  const [filters, setFilters] = useState<ExportFilters>(defaultFilters);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadBudgets();
    }
  }, [isOpen]);

  const loadBudgets = async () => {
    try {
      const response = await api.get('/api/budgets');
      setBudgets(response.data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    }
  };

  const handleExport = async () => {
    const token = getAccessToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      switch (exportType) {
        case 'transactions':
          await exportTransactionsCSV(token, filters);
          break;
        case 'splits':
          await exportTransactionSplitsCSV(token, filters);
          break;
        case 'budgets':
          await exportBudgetSummaryCSV(token, filters);
          break;
      }
      
      // Close modal on success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const updateFilter = (key: keyof ExportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Export Data</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Export Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="transactions">Transactions</option>
              <option value="splits">Split Transaction Details</option>
              <option value="budgets">Budget Summary</option>
            </select>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700">Filters (Optional)</h3>

            {/* Budget Filter */}
            {(exportType === 'transactions' || exportType === 'splits' || exportType === 'budgets') && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Budget
                </label>
                <select
                  value={filters.budgetId || ''}
                  onChange={(e) => updateFilter('budgetId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Budgets</option>
                  {budgets.map(budget => (
                    <option key={budget.id} value={budget.id}>
                      {budget.month}/{budget.year}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filters */}
            {(exportType === 'transactions' || exportType === 'splits') && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Year/Month Filters for Budgets */}
            {exportType === 'budgets' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Year
                  </label>
                  <input
                    type="number"
                    value={filters.year || ''}
                    onChange={(e) => updateFilter('year', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="YYYY"
                    min="2000"
                    max="2100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Month
                  </label>
                  <input
                    type="number"
                    value={filters.month || ''}
                    onChange={(e) => updateFilter('month', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="MM"
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
