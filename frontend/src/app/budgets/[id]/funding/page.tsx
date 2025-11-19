'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/Button';
import { paycheckApi, BudgetFundingPlan, CategoryFundingStatus } from '@/lib/paycheck-api';
import { api } from '@/lib/api';

export default function BudgetFundingPage() {
  const router = useRouter();
  const params = useParams();
  const budgetId = parseInt(params.id as string);
  
  const [budget, setBudget] = useState<any | null>(null);
  const [fundingPlan, setFundingPlan] = useState<BudgetFundingPlan | null>(null);
  const [categoryFunding, setCategoryFunding] = useState<CategoryFundingStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [budgetId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetResponse, planData, categoryData] = await Promise.all([
        api.get(`/api/budgets/${budgetId}`),
        paycheckApi.getBudgetFundingPlan(budgetId),
        paycheckApi.getCategoryFundingStatus(budgetId),
      ]);
      setBudget(budgetResponse.data.budget);
      setFundingPlan(planData);
      setCategoryFunding(categoryData);
    } catch (error) {
      console.error('Failed to load funding data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    try {
      await paycheckApi.autoAllocatePaychecks(budgetId);
      loadData();
      alert('Paychecks auto-allocated successfully!');
    } catch (error) {
      console.error('Failed to auto-allocate:', error);
      alert('Failed to auto-allocate paychecks');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getFundingPercentage = (funded: number, allocated: number) => {
    if (allocated === 0) return 0;
    return Math.min(100, (funded / allocated) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!budget || !fundingPlan) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Budget not found</p>
          <Button onClick={() => router.push('/budgets')} className="mt-4">
            Back to Budgets
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Budget Funding Plan
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(budget.year, budget.month - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAutoAllocate}>
              Auto-Allocate Paychecks
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/budgets/${budgetId}`)}
            >
              Back to Budget
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Funding Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Funding Summary</h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(fundingPlan.total_income_cents)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Allocated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(fundingPlan.total_allocated_cents)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className={`text-2xl font-bold ${
                  fundingPlan.available_to_allocate_cents >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(fundingPlan.available_to_allocate_cents)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`text-lg font-semibold ${
                  fundingPlan.is_fully_funded ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {fundingPlan.is_fully_funded ? 'Fully Funded' : 'Needs Funding'}
                </p>
              </div>
            </div>
          </div>

          {/* Paychecks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Paychecks ({fundingPlan.paychecks.length})
            </h2>
            {fundingPlan.paychecks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No paychecks allocated yet</p>
                <Button onClick={handleAutoAllocate}>
                  Auto-Allocate Paychecks
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {fundingPlan.paychecks.map((paycheck) => (
                  <div
                    key={paycheck.id}
                    className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(paycheck.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-500">
                        {paycheck.allocations.length} allocation(s)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(paycheck.amount_cents)}
                      </p>
                      <p className={`text-sm ${
                        paycheck.is_received ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {paycheck.is_received ? 'Received' : 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Funding Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Category Funding Status
            </h2>
            <div className="space-y-4">
              {categoryFunding.map((category) => {
                const percentage = getFundingPercentage(
                  category.funded_cents,
                  category.allocated_cents
                );
                
                return (
                  <div key={category.category_id} className="border-b border-gray-200 pb-4 last:border-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{category.category_name}</h3>
                        <p className="text-sm text-gray-500">
                          {category.funding_sources.length} funding source(s)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(category.funded_cents)} / {formatCurrency(category.allocated_cents)}
                        </p>
                        <p className={`text-sm ${
                          category.is_fully_funded ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {category.is_fully_funded ? 'Fully Funded' : `${formatCurrency(category.remaining_cents)} remaining`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          category.is_fully_funded ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
