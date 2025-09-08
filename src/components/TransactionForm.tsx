import { useState, useEffect } from 'react';
import { Account, Transaction, TransactionType } from '@/types';

type TransactionFormProps = {
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  accounts: Account[];
  initialData?: Partial<Transaction>;
  buttonText: string;
};

export default function TransactionForm({ onSubmit, accounts, initialData, buttonText }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: initialData?.type || 'expense' as TransactionType,
    amount: initialData?.amount || 0,
    description: initialData?.description || '',
    category: initialData?.category || '',
    accountId: initialData?.accountId || '',
    toAccountId: initialData?.toAccountId || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          取引種類
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="expense">支出</option>
          <option value="income">収入</option>
          <option value="transfer">振替</option>
        </select>
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          金額
        </label>
        <input
          type="number"
          id="amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
          min="0"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          説明
        </label>
        <input
          type="text"
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          カテゴリー
        </label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
          {formData.type === 'transfer' ? '送金元アカウント' : 'アカウント'}
        </label>
        <select
          id="accountId"
          value={formData.accountId}
          onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        >
          <option value="">選択してください</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} (¥{account.balance.toLocaleString()})
            </option>
          ))}
        </select>
      </div>

      {formData.type === 'transfer' && (
        <div>
          <label htmlFor="toAccountId" className="block text-sm font-medium text-gray-700">
            送金先アカウント
          </label>
          <select
            id="toAccountId"
            value={formData.toAccountId}
            onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">選択してください</option>
            {accounts
              .filter((account) => account.id !== formData.accountId)
              .map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} (¥{account.balance.toLocaleString()})
                </option>
              ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          日付
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {buttonText}
      </button>
    </form>
  );
} 