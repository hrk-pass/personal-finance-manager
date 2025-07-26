'use client';

import { useState } from 'react';
import { Report, TransactionCategory } from '@/types';
import { generateReport } from '@/lib/reports';
import { useAuth } from '@/contexts/AuthContext';

interface ReportFormProps {
  report?: Report;
  categories: TransactionCategory[];
  onClose: () => void;
  onSuccess: (report: Report) => void;
}

export default function ReportForm({ report, categories, onClose, onSuccess }: ReportFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: report?.name || '',
    type: report?.type || 'expense',
    dateRange: {
      start: report?.dateRange.start?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      end: report?.dateRange.end?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    },
    filters: {
      accounts: report?.filters.accounts || [],
      categories: report?.filters.categories || [],
      tags: report?.filters.tags || [],
    },
    groupBy: report?.groupBy || 'month',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const reportData = {
        name: formData.name,
        type: formData.type as Report['type'],
        dateRange: {
          start: new Date(formData.dateRange.start),
          end: new Date(formData.dateRange.end),
        },
        filters: formData.filters,
        groupBy: formData.groupBy as Report['groupBy'],
      };

      const result = await generateReport(user.id, reportData);
      onSuccess(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'レポートの生成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{report ? 'レポートを編集' : '新規レポート作成'}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            レポート名
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
            レポートタイプ
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' | 'balance' | 'budget' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="expense">支出レポート</option>
            <option value="income">収入レポート</option>
            <option value="balance">収支レポート</option>
            <option value="budget">予算レポート</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              開始日
            </label>
            <input
              type="date"
              value={formData.dateRange.start}
              onChange={(e) => setFormData({
                ...formData,
                dateRange: { ...formData.dateRange, start: e.target.value },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              終了日
            </label>
            <input
              type="date"
              value={formData.dateRange.end}
              onChange={(e) => setFormData({
                ...formData,
                dateRange: { ...formData.dateRange, end: e.target.value },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            グループ化
          </label>
          <select
            value={formData.groupBy}
            onChange={(e) => setFormData({ ...formData, groupBy: e.target.value as 'day' | 'week' | 'month' | 'year' | 'category' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="day">日別</option>
            <option value="week">週別</option>
            <option value="month">月別</option>
            <option value="year">年別</option>
            <option value="category">カテゴリー別</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリーフィルター
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.filters.categories.includes(category.id)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...formData.filters.categories, category.id]
                      : formData.filters.categories.filter(id => id !== category.id);
                    setFormData({
                      ...formData,
                      filters: { ...formData.filters, categories: newCategories },
                    });
                  }}
                  className="rounded text-blue-500"
                />
                <span>{category.name}</span>
              </label>
            ))}
          </div>
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
            {loading ? '生成中...' : (report ? '更新' : '生成')}
          </button>
        </div>
      </form>
    </div>
  );
} 