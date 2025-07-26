'use client';

import { useState, useEffect } from 'react';
import { getBudgets, getBudgetProgress } from '@/lib/budgets';
import { getCategories } from '@/lib/categories';
import { Budget, TransactionCategory } from '@/types';
import BudgetForm from '@/components/BudgetForm';
import BudgetList from '@/components/BudgetList';
import { useAuth } from '@/contexts/AuthContext';

export default function BudgetsPage() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const [budgetsData, categoriesData] = await Promise.all([
          getBudgets(user.id),
          getCategories(user.id),
        ]);
        setBudgets(budgetsData);
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
        <h1 className="text-3xl font-bold">予算管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          新規予算作成
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <BudgetForm
            categories={categories}
            onClose={() => setShowForm(false)}
            onSuccess={(newBudget) => {
              setBudgets([...budgets, newBudget]);
              setShowForm(false);
            }}
          />
        </div>
      )}

      <BudgetList
        budgets={budgets}
        categories={categories}
        onUpdate={(updatedBudget) => {
          setBudgets(budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b));
        }}
        onDelete={(budgetId) => {
          setBudgets(budgets.filter(b => b.id !== budgetId));
        }}
      />
    </div>
  );
} 