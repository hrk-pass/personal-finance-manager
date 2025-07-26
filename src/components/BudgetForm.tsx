'use client';

import { useState } from 'react';
import { Budget, TransactionCategory } from '@/types';
import { createBudget, updateBudget } from '@/lib/budgets';
import { useAuth } from '@/contexts/AuthContext';

interface BudgetFormProps {
  budget?: Budget;
  categories: TransactionCategory[];
  onClose: () => void;
  onSuccess: (budget: Budget) => void;
}

export default function BudgetForm({ budget, categories, onClose, onSuccess }: BudgetFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: budget?.name || '',
    amount: budget?.amount?.toString() || '',
    currency: budget?.currency || 'JPY',
    period: budget?.period || 'monthly',
    categoryIds: budget?.categoryIds || [],
    startDate: budget?.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    endDate: budget?.endDate?.toISOString().split('T')[0] || '',
    rollover: budget?.rollover || false,
    notifications: {
      enabled: budget?.notifications?.enabled || false,
      threshold: budget?.notifications?.threshold?.toString() || '80',
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const budgetData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        period: formData.period as Budget['period'],
        categoryIds: formData.categoryIds,
        startDate: new Date(formData.startDate),
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        rollover: formData.rollover,
        notifications: {
          enabled: formData.notifications.enabled,
          threshold: parseInt(formData.notifications.threshold, 10),
        },
      };

      let result;
      if (budget) {
        await updateBudget(budget.id, budgetData);
        result = { ...budget, ...budgetData };
      } else {
        const budgetId = await createBudget(user.id, budgetData);
        result = { id: budgetId, userId: user.id, ...budgetData } as Budget;
      }

      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予算の保存中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{budget ? '予算を編集' : '新規予算作成'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            予算名
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            金額
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              min="0"
              step="1"
              required
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="JPY">JPY</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            期間
          </label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'yearly' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="monthly">毎月</option>
            <option value="yearly">毎年</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリー
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(category.id)}
                  onChange={(e) => {
                    const newCategoryIds = e.target.checked
                      ? [...formData.categoryIds, category.id]
                      : formData.categoryIds.filter(id => id !== category.id);
                    setFormData({ ...formData, categoryIds: newCategoryIds });
                  }}
                  className="rounded text-blue-500"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日（任意）
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.rollover}
            onChange={(e) => setFormData({ ...formData, rollover: e.target.checked })}
            className="rounded text-blue-500"
          />
          <label className="text-sm text-gray-700">
            未使用の予算を翌期に繰り越す
          </label>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.notifications.enabled}
              onChange={(e) => setFormData({
                ...formData,
                notifications: {
                  ...formData.notifications,
                  enabled: e.target.checked,
                },
              })}
              className="rounded text-blue-500"
            />
            <label className="text-sm text-gray-700">
              予算超過の通知を有効にする
            </label>
          </div>
          
          {formData.notifications.enabled && (
            <div className="flex items-center space-x-2 ml-6">
              <input
                type="number"
                value={formData.notifications.threshold}
                onChange={(e) => setFormData({
                  ...formData,
                  notifications: {
                    ...formData.notifications,
                    threshold: e.target.value,
                  },
                })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md"
                min="1"
                max="100"
              />
              <span className="text-sm text-gray-700">%を超過したら通知</span>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '保存中...' : (budget ? '更新' : '作成')}
          </button>
        </div>
      </form>
    </div>
  );
} 