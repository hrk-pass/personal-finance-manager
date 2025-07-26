'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Report, TransactionCategory } from '@/types';
import { getReports } from '@/lib/reports';
import { getCategories } from '@/lib/categories';
import ReportForm from '@/components/ReportForm';
import ReportViewer from '@/components/ReportViewer';

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [reportsData, categoriesData] = await Promise.all([
          getReports(user.id),
          getCategories(user.id),
        ]);
        setReports(reportsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) {
    return <div>ログインが必要です</div>;
  }

  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">レポート</h1>
        <button
          onClick={() => {
            setSelectedReport(null);
            setShowForm(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          新規レポート作成
        </button>
      </div>

      {showForm ? (
        <div className="mb-8">
          <ReportForm
            report={selectedReport}
            categories={categories}
            onClose={() => {
              setShowForm(false);
              setSelectedReport(null);
            }}
            onSuccess={(newReport) => {
              if (selectedReport) {
                setReports(reports.map(r => r.id === newReport.id ? newReport : r));
              } else {
                setReports([...reports, newReport]);
              }
              setShowForm(false);
              setSelectedReport(newReport);
            }}
          />
        </div>
      ) : selectedReport ? (
        <ReportViewer
          report={selectedReport}
          categories={categories}
          onBack={() => setSelectedReport(null)}
          onEdit={() => setShowForm(true)}
          onDelete={(reportId) => {
            setReports(reports.filter(r => r.id !== reportId));
            setSelectedReport(null);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedReport(report)}
            >
              <h3 className="text-xl font-semibold mb-2">{report.name}</h3>
              <div className="text-sm text-gray-600">
                <div>
                  タイプ: {
                    report.type === 'expense' ? '支出' :
                    report.type === 'income' ? '収入' :
                    report.type === 'balance' ? '収支' : '予算'
                  }
                </div>
                <div>
                  期間: {new Date(report.dateRange.start).toLocaleDateString()} ～{' '}
                  {new Date(report.dateRange.end).toLocaleDateString()}
                </div>
                <div>
                  グループ化: {
                    report.groupBy === 'day' ? '日別' :
                    report.groupBy === 'week' ? '週別' :
                    report.groupBy === 'month' ? '月別' :
                    report.groupBy === 'year' ? '年別' : 'カテゴリー別'
                  }
                </div>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="col-span-full text-center text-gray-500 py-8">
              レポートが作成されていません
            </div>
          )}
        </div>
      )}
    </div>
  );
} 