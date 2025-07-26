'use client';

import { useEffect, useState } from 'react';
import { Report, TransactionCategory } from '@/types';
import { generateReport } from '@/lib/reports';
import { useAuth } from '@/contexts/AuthContext';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportViewerProps {
  report: Report;
  categories: TransactionCategory[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: (reportId: string) => void;
}

interface ChartData {
  groupedData: { [key: string]: number };
  trends: { date: Date; amount: number }[];
  totalAmount: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  name: string;
  value: number;
}

const COLORS = [
  '#2196F3', '#4CAF50', '#F44336', '#FFC107', '#9C27B0',
  '#00BCD4', '#FF9800', '#795548', '#607D8B', '#E91E63',
];

export default function ReportViewer({
  report,
  categories,
  onBack,
  onEdit,
  onDelete,
}: ReportViewerProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ChartData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const result = await generateReport(user.id, {
          name: report.name,
          type: report.type,
          dateRange: report.dateRange,
          filters: report.filters,
          groupBy: report.groupBy,
        });
        setData(result.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'レポートの生成中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [report, user]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const renderChart = () => {
    if (!data) return null;

    switch (report.groupBy) {
      case 'category':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie<PieChartData>
                data={Object.entries(data.groupedData).map(([key, value]) => ({
                  name: categories.find(c => c.id === key)?.name || key,
                  value: Math.abs(value),
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.entries(data.groupedData).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'day':
      case 'week':
      case 'month':
      case 'year':
        return (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date: Date) => formatDate(date)}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  labelFormatter={(date: Date) => formatDate(date)}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#2196F3"
                  name="累計金額"
                />
              </LineChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart<TimeSeriesData>
                data={Object.entries(data.groupedData).map(([key, value]) => ({
                  name: key,
                  value: value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tickFormatter={(date: string) => formatDate(new Date(date))}
                />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip
                  labelFormatter={(date: string) => formatDate(new Date(date))}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="value" fill="#4CAF50" name="期間金額" />
              </BarChart>
            </ResponsiveContainer>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">{report.name}</h2>
          <p className="text-sm text-gray-600">
            {formatDate(new Date(report.dateRange.start))} ～{' '}
            {formatDate(new Date(report.dateRange.end))}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            戻る
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            編集
          </button>
          <button
            onClick={() => {
              if (window.confirm('このレポートを削除してもよろしいですか？')) {
                onDelete(report.id);
              }
            }}
            className="px-4 py-2 text-red-600 hover:text-red-800"
          >
            削除
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">読み込み中...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600">合計金額</div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.totalAmount)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600">データ件数</div>
              <div className="text-2xl font-bold">
                {Object.keys(data.groupedData).length}件
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-600">平均金額</div>
              <div className="text-2xl font-bold">
                {formatCurrency(data.totalAmount / Object.keys(data.groupedData).length)}
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            {renderChart()}
          </div>
        </div>
      ) : null}
    </div>
  );
} 