/**
 * CSV Export API Client
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ExportFilters {
  budgetId?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

/**
 * Download a file from a blob
 */
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: ExportFilters): string {
  const params = new URLSearchParams();
  
  if (filters.budgetId) params.append('budget_id', filters.budgetId.toString());
  if (filters.categoryId) params.append('category_id', filters.categoryId.toString());
  if (filters.startDate) params.append('start_date', filters.startDate);
  if (filters.endDate) params.append('end_date', filters.endDate);
  if (filters.year) params.append('year', filters.year.toString());
  if (filters.month) params.append('month', filters.month.toString());
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Export transactions to CSV
 */
export async function exportTransactionsCSV(
  token: string,
  filters: ExportFilters = {}
): Promise<void> {
  const queryString = buildQueryString(filters);
  
  const response = await fetch(
    `${API_BASE_URL}/api/exports/transactions/csv${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to export transactions: ${error}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
    : 'transactions.csv';
  
  downloadFile(blob, filename);
}

/**
 * Export split transactions to CSV (detailed view)
 */
export async function exportTransactionSplitsCSV(
  token: string,
  filters: ExportFilters = {}
): Promise<void> {
  const queryString = buildQueryString(filters);
  
  const response = await fetch(
    `${API_BASE_URL}/api/exports/transactions/splits/csv${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to export split transactions: ${error}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
    : 'transaction_splits.csv';
  
  downloadFile(blob, filename);
}

/**
 * Export budget summary to CSV
 */
export async function exportBudgetSummaryCSV(
  token: string,
  filters: ExportFilters = {}
): Promise<void> {
  const queryString = buildQueryString(filters);
  
  const response = await fetch(
    `${API_BASE_URL}/api/exports/budgets/csv${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to export budget summary: ${error}`);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
    : 'budget_summary.csv';
  
  downloadFile(blob, filename);
}
