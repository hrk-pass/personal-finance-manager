'use client';

import { useState, useEffect } from 'react';
import { Budget, TransactionCategory } from '@/types';
import { getBudgetProgress, deleteBudget } from '@/lib/budgets';

interface BudgetListProps {
  budgets: Budget[];
  categories: TransactionCategory[];
  onUpdate: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

interface BudgetProgress {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
}

export default function BudgetList({ budgets, categories, onUpdate, onDelete }: BudgetListProps) {
  const [progress, setProgress] = useState<Record<string, BudgetProgress>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [expandedBudget, setExpandedBudget] = useState<string | null>(null);

  useEffect(() => {
    budgets.forEach(async (budget) => {
      if (!loading[budget.id]) {
        setLoading(prev => ({ ...prev, [budget.id]: true }));
        try {
          const budgetProgress = await getBudgetProgress(budget.id);
          setProgress(prev => ({ ...prev, [budget.id]: budgetProgress }));
        } catch (error) {
          console.error('Error fetching budget progress:', error);
        } finally {
          setLoading(prev => ({ ...prev, [budget.id]: false }));
        }
      }
    });
  }, [budgets]);

  const handleDelete = async (budgetId: string) => {
    if (window.confirm('この予算を削除してもよろしいですか？')) {
      try {
        await deleteBudget(budgetId);
        onDelete(budgetId);
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map(id => categories.find(c => c.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-4">
      {budgets.map((budget) => {
        const budgetProgress = progress[budget.id];
        const isExpanded = expandedBudget === budget.id;

        return (
          <div
            key={budget.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold">{budget.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setExpandedBudget(isExpanded ? null : budget.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>予算額: {formatCurrency(budget.amount, budget.currency)}</span>
                  {budgetProgress && (
                    <span>
                      残額: {formatCurrency(budgetProgress.remainingAmount, budget.currency)}
                    </span>
                  )}
                </div>
                {budgetProgress && (
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${Math.min(budgetProgress.percentageUsed, 100)}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${getProgressColor(budgetProgress.percentageUsed)}`}
                      />
                    </div>
                    <div className="text-right text-xs mt-1">
                      {budgetProgress.percentageUsed.toFixed(1)}% 使用
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">期間:</span>{' '}
                    {budget.period === 'monthly' ? '毎月' : '毎年'}
                  </div>
                  <div>
                    <span className="font-medium">カテゴリー:</span>{' '}
                    {getCategoryNames(budget.categoryIds)}
                  </div>
                  <div>
                    <span className="font-medium">開始日:</span>{' '}
                    {new Date(budget.startDate).toLocaleDateString()}
                  </div>
                  {budget.endDate && (
                    <div>
                      <span className="font-medium">終了日:</span>{' '}
                      {new Date(budget.endDate).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">繰り越し:</span>{' '}
                    {budget.rollover ? '有効' : '無効'}
                  </div>
                  <div>
                    <span className="font-medium">通知:</span>{' '}
                    {budget.notifications.enabled
                      ? `${budget.notifications.threshold}%で通知`
                      : '無効'}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {budgets.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          予算が設定されていません
        </div>
      )}
    </div>
  );
} 