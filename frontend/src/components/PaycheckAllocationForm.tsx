'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { api } from '@/lib/api';

interface BudgetCategory {
  id: number;
  name: string;
  allocated_cents: number;
}

interface PaycheckAllocation {
  category_id: number;
  amount_cents: number;
  order: number;
}

interface PaycheckAllocationFormProps {
  budgetId: number;
  allocations: PaycheckAllocation[];
  totalAmount: number;
  onChange: (allocations: PaycheckAllocation[]) => void;
}

export default function PaycheckAllocationForm({
  budgetId,
  allocations,
  totalAmount,
  onChange,
}: PaycheckAllocationFormProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [budgetId]);

  const loadCategories = async () => {
    try {
      const response = await api.get(`/api/budgets/${budgetId}`);
      setCategories(response.data.budget.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllocation = () => {
    const newAllocation: PaycheckAllocation = {
      category_id: categories[0]?.id || 0,
      amount_cents: 0,
      order: allocations.length,
    };
    onChange([...allocations, newAllocation]);
  };

  const handleRemoveAllocation = (index: number) => {
    const updated = allocations.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateAllocation = (index: number, field: keyof PaycheckAllocation, value: any) => {
    const updated = [...allocations];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const totalAllocated = allocations.reduce((sum, a) => sum + a.amount_cents, 0);
  const remaining = totalAmount - totalAllocated;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  if (loading) {
    return <div className="text-center py-4">Loading categories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Allocations</h3>
        <Button type="button" variant="secondary" onClick={handleAddAllocation}>
          Add Allocation
        </Button>
      </div>

      {allocations.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No allocations yet</p>
          <Button type="button" onClick={handleAddAllocation} className="mt-2">
            Add First Allocation
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((allocation, index) => (
            <div key={index} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={allocation.category_id}
                  onChange={(e) =>
                    handleUpdateAllocation(index, 'category_id', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={(allocation.amount_cents / 100).toFixed(2)}
                    onChange={(e) =>
                      handleUpdateAllocation(
                        index,
                        'amount_cents',
                        Math.round(parseFloat(e.target.value || '0') * 100)
                      )
                    }
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="pt-7">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleRemoveAllocation(index)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700">Total Allocated:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalAllocated)}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-700">Remaining:</span>
          <span
            className={`font-semibold ${
              remaining >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>
    </div>
  );
}
