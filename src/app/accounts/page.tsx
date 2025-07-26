'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Account } from '@/types';
import { createAccount, updateAccount, deleteAccount, getAccounts } from '@/lib/accounts';
import AccountForm from '@/components/AccountForm';
import AccountList from '@/components/AccountList';

export default function AccountsPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  const loadAccounts = async () => {
    if (!user) return;
    try {
      const accountsData = await getAccounts(user.id);
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      // TODO: エラー処理の実装
    }
  };

  const handleCreateAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return;
    try {
      await createAccount(user.id, data);
      await loadAccounts();
      setIsAddingAccount(false);
    } catch (error) {
      console.error('Error creating account:', error);
      // TODO: エラー処理の実装
    }
  };

  const handleUpdateAccount = async (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!editingAccount) return;
    try {
      await updateAccount(editingAccount.id, data);
      await loadAccounts();
      setEditingAccount(null);
    } catch (error) {
      console.error('Error updating account:', error);
      // TODO: エラー処理の実装
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('このアカウントを削除してもよろしいですか？')) return;
    try {
      await deleteAccount(accountId);
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      // TODO: エラー処理の実装
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">アカウント管理</h1>
        {!isAddingAccount && !editingAccount && (
          <button
            onClick={() => setIsAddingAccount(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            新規アカウント作成
          </button>
        )}
      </div>

      {isAddingAccount && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">新規アカウント作成</h2>
          <AccountForm
            onSubmit={handleCreateAccount}
            buttonText="作成"
          />
          <button
            onClick={() => setIsAddingAccount(false)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            キャンセル
          </button>
        </div>
      )}

      {editingAccount && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">アカウント編集</h2>
          <AccountForm
            initialData={editingAccount}
            onSubmit={handleUpdateAccount}
            buttonText="更新"
          />
          <button
            onClick={() => setEditingAccount(null)}
            className="mt-4 text-sm text-gray-600 hover:text-gray-900"
          >
            キャンセル
          </button>
        </div>
      )}

      {!isAddingAccount && !editingAccount && (
        <AccountList
          accounts={accounts}
          onEdit={setEditingAccount}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
} 