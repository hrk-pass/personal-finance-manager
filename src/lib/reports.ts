import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { Transaction, Report } from '@/types';

const REPORTS_COLLECTION = 'reports';
const TRANSACTIONS_COLLECTION = 'transactions';

export const generateReport = async (userId: string, reportData: Omit<Report, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
  try {
    // レポート設定を保存
    const reportRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...reportData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // トランザクションデータを取得
    const transactionsQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('userId', '==', userId),
      where('date', '>=', reportData.dateRange.start),
      where('date', '<=', reportData.dateRange.end),
      ...(reportData.filters.accounts ? [where('accountId', 'in', reportData.filters.accounts)] : []),
      ...(reportData.filters.categories ? [where('categoryId', 'in', reportData.filters.categories)] : []),
      orderBy('date', 'asc')
    );

    const transactions = await getDocs(transactionsQuery);
    const transactionData = transactions.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Transaction[];

    // レポートタイプに応じた集計
    const summary = await generateReportSummary(reportData.type, transactionData, reportData.groupBy);

    return {
      id: reportRef.id,
      userId,
      name: reportData.name,
      type: reportData.type,
      dateRange: reportData.dateRange,
      filters: reportData.filters,
      groupBy: reportData.groupBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};

const generateReportSummary = async (
  type: Report['type'],
  transactions: Transaction[],
  groupBy: Report['groupBy']
) => {
  const summary = {
    totalAmount: 0,
    groupedData: new Map<string, number>(),
    trends: [] as { date: Date; amount: number }[],
  };

  // 期間ごとのグループ化関数
  const getGroupKey = (date: Date) => {
    switch (groupBy) {
      case 'day':
        return date.toISOString().split('T')[0];
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0];
      case 'month':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return '';
    }
  };

  // トランザクションの集計
  transactions.forEach(transaction => {
    if (
      (type === 'expense' && transaction.type === 'expense') ||
      (type === 'income' && transaction.type === 'income') ||
      type === 'balance'
    ) {
      const amount = transaction.type === 'expense' ? -transaction.amount : transaction.amount;
      summary.totalAmount += amount;

      // グループ化による集計
      const groupKey = groupBy === 'category' ? transaction.categoryId : getGroupKey(transaction.date);
      const currentAmount = summary.groupedData.get(groupKey) || 0;
      summary.groupedData.set(groupKey, currentAmount + amount);

      // トレンドデータの作成
      if (groupBy !== 'category') {
        summary.trends.push({
          date: transaction.date,
          amount: summary.totalAmount,
        });
      }
    }
  });

  return {
    ...summary,
    groupedData: Object.fromEntries(summary.groupedData),
    trends: summary.trends.sort((a, b) => a.date.getTime() - b.date.getTime()),
  };
};

export const getReports = async (userId: string): Promise<Report[]> => {
  try {
    const q = query(collection(db, REPORTS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dateRange: {
        start: doc.data().dateRange.start?.toDate(),
        end: doc.data().dateRange.end?.toDate(),
      },
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Report[];
  } catch (error) {
    console.error('Error getting reports:', error);
    throw error;
  }
}; 