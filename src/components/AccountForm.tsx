import { useState } from 'react';
import { Account } from '@/types';

type AccountFormProps = {
  onSubmit: (data: Omit<Account, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => void;
  initialData?: Partial<Account>;
  buttonText: string;
};

export default function AccountForm({ onSubmit, initialData, buttonText }: AccountFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'bank',
    balance: initialData?.balance || 0,
    currency: initialData?.currency || 'JPY',
    color: initialData?.color || '#1976d2',
    isArchived: initialData?.isArchived ?? false,
    metadata: initialData?.metadata || {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          アカウント名
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          タイプ
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Account['type'] })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="bank">銀行口座</option>
          <option value="emoney">電子マネー</option>
          <option value="wallet">財布</option>
        </select>
      </div>

      <div>
        <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
          残高
        </label>
        <input
          type="number"
          id="balance"
          value={formData.balance}
          onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
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