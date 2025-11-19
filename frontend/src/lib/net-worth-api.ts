import { api } from './api';

export interface Asset {
  id: number;
  user_id: number;
  name: string;
  asset_type: string;
  current_value: number;
  institution?: string;
  account_number_last4?: string;
  notes?: string;
  is_liquid: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Liability {
  id: number;
  user_id: number;
  name: string;
  liability_type: string;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  institution?: string;
  account_number_last4?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NetWorthSummary {
  current_net_worth: number;
  total_assets: number;
  total_liabilities: number;
  liquid_assets: number;
  asset_count: number;
  liability_count: number;
  change_30_days?: number;
  change_90_days?: number;
  change_1_year?: number;
  change_30_days_pct?: number;
  change_90_days_pct?: number;
  change_1_year_pct?: number;
}

export interface NetWorthTrend {
  date: string;
  net_worth: number;
  assets: number;
  liabilities: number;
}

export interface AssetBreakdown {
  asset_type: string;
  total_value: number;
  percentage: number;
  count: number;
}

export interface LiabilityBreakdown {
  liability_type: string;
  total_balance: number;
  percentage: number;
  count: number;
  total_interest_rate: number;
  total_minimum_payment: number;
}

export interface NetWorthProjection {
  projection_date: string;
  projected_net_worth: number;
  projected_assets: number;
  projected_liabilities: number;
  assumptions: Record<string, any>;
}

export interface NetWorthAlert {
  alert_type: string;
  severity: string;
  message: string;
  change_amount?: number;
  change_percentage?: number;
}

// Asset API
export async function getAssets(includeInactive = false): Promise<Asset[]> {
  const response = await api.get(`/api/net-worth/assets?include_inactive=${includeInactive}`);
  return response.data;
}

export async function getAsset(id: number): Promise<Asset> {
  const response = await api.get(`/api/net-worth/assets/${id}`);
  return response.data;
}

export async function createAsset(data: Partial<Asset>): Promise<Asset> {
  const response = await api.post('/api/net-worth/assets', data);
  return response.data;
}

export async function updateAsset(id: number, data: Partial<Asset>): Promise<Asset> {
  const response = await api.put(`/api/net-worth/assets/${id}`, data);
  return response.data;
}

export async function deleteAsset(id: number): Promise<void> {
  await api.delete(`/api/net-worth/assets/${id}`);
}

// Liability API
export async function getLiabilities(includeInactive = false): Promise<Liability[]> {
  const response = await api.get(`/api/net-worth/liabilities?include_inactive=${includeInactive}`);
  return response.data;
}

export async function getLiability(id: number): Promise<Liability> {
  const response = await api.get(`/api/net-worth/liabilities/${id}`);
  return response.data;
}

export async function createLiability(data: Partial<Liability>): Promise<Liability> {
  const response = await api.post('/api/net-worth/liabilities', data);
  return response.data;
}

export async function updateLiability(id: number, data: Partial<Liability>): Promise<Liability> {
  const response = await api.put(`/api/net-worth/liabilities/${id}`, data);
  return response.data;
}

export async function deleteLiability(id: number): Promise<void> {
  await api.delete(`/api/net-worth/liabilities/${id}`);
}

// Summary and Analytics API
export async function getNetWorthSummary(): Promise<NetWorthSummary> {
  const response = await api.get('/api/net-worth/summary');
  return response.data;
}

export async function getNetWorthTrends(months = 12): Promise<NetWorthTrend[]> {
  const response = await api.get(`/api/net-worth/trends?months=${months}`);
  return response.data;
}

export async function getAssetBreakdown(): Promise<AssetBreakdown[]> {
  const response = await api.get('/api/net-worth/breakdown/assets');
  return response.data;
}

export async function getLiabilityBreakdown(): Promise<LiabilityBreakdown[]> {
  const response = await api.get('/api/net-worth/breakdown/liabilities');
  return response.data;
}

export async function getNetWorthProjection(months = 12): Promise<NetWorthProjection> {
  const response = await api.get(`/api/net-worth/projection?months=${months}`);
  return response.data;
}

export async function getNetWorthAlerts(): Promise<NetWorthAlert[]> {
  const response = await api.get('/api/net-worth/alerts');
  return response.data;
}

export async function createSnapshot(): Promise<{ message: string }> {
  const response = await api.post('/api/net-worth/snapshots');
  return response.data;
}

// Helper functions
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.0%';
  }
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    checking: 'Checking Account',
    savings: 'Savings Account',
    investment: 'Investment',
    retirement: 'Retirement Account',
    real_estate: 'Real Estate',
    vehicle: 'Vehicle',
    crypto: 'Cryptocurrency',
    other: 'Other',
  };
  return labels[type] || type;
}

export function getLiabilityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    credit_card: 'Credit Card',
    student_loan: 'Student Loan',
    mortgage: 'Mortgage',
    auto_loan: 'Auto Loan',
    personal_loan: 'Personal Loan',
    medical_debt: 'Medical Debt',
    other: 'Other',
  };
  return labels[type] || type;
}
