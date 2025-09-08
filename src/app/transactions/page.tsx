'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction, Account } from '@/types';
import { createTransaction, updateTransaction, deleteTransaction, getTransactions } from '@/lib/transactions';
import { getAccounts } from '@/lib/accounts';
import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [transactionsData, accountsData] = await Promise.all([
        getTransactions(),
        getAccounts(),
      ]);
      setTransactions(transactionsData.sort((a, b) => b.date.getTime() - a.date.getTime()));
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading data:', error);
      // TODO: エラー処理の実装
    }
  };

  const handleCreateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      await createTransaction(data);
      await loadData();
      setIsAddingTransaction(false);
    } catch (error) {
      console.error('Error creating transaction:', error);
      // TODO: エラー処理の実装
    }
  };

  const handleUpdateTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingTransaction) return;
    try {
      await updateTransaction(editingTransaction.id, editingTransaction, data);
      await loadData();
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error updating transaction:', error);
      // TODO: エラー処理の実装
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    if (!confirm('この取引を削除してもよろしいですか？')) return;
    try {
      await deleteTransaction(transactionId, transaction);
      await loadData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      // TODO: エラー処理の実装
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">取引履歴</h1>
        {!isAddingTransaction && !editingTransaction && (
          <button
            onClick={() => setIsAddingTransaction(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            新規取引登録
          </button>
        )}
      </div>

      {isAddingTransaction && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">新規取引登録</h2>
          <TransactionForm
            accounts={accounts}
            onSubmit={handleCreateTransaction}
            buttonText="登録"
          />
          <button
            onClick={() => setIsAddingTransaction(false)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            キャンセル
          </button>
        </div>
      )}

      {editingTransaction && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">取引編集</h2>
          <TransactionForm
            accounts={accounts}
            initialData={editingTransaction}
            onSubmit={handleUpdateTransaction}
            buttonText="更新"
          />
          <button
            onClick={() => setEditingTransaction(null)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            キャンセル
          </button>
        </div>
      )}

      {!isAddingTransaction && !editingTransaction && (
        <TransactionList
          transactions={transactions}
          accounts={accounts}
          onEdit={setEditingTransaction}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
} 