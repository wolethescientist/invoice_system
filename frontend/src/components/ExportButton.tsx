'use client';

import { useState } from 'react';
import { getAccessToken } from '@/lib/api';
import {
  exportTransactionsCSV,
  exportTransactionSplitsCSV,
  exportBudgetSummaryCSV,
  ExportFilters
} from '@/lib/exports-api';

interface ExportButtonProps {
  type: 'transactions' | 'splits' | 'budgets';
  filters?: ExportFilters;
  label?: string;
  className?: string;
}

export default function ExportButton({
  type,
  filters = {},
  label,
  className = ''
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultLabels = {
    transactions: 'Export Transactions',
    splits: 'Export Split Details',
    budgets: 'Export Budget Summary'
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
      switch (type) {
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
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          px-4 py-2 rounded-lg font-medium
          bg-green-600 text-white
          hover:bg-green-700
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors
          flex items-center gap-2
          ${className}
        `}
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
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {label || defaultLabels[type]}
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
