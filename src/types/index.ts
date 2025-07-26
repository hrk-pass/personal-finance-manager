export type User = {
  id: string;
  email: string;
  displayName: string | null;
};

export type Account = {
  id: string;
  name: string;
  type: 'bank' | 'emoney' | 'wallet';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type TransactionType = 'income' | 'expense' | 'transfer';

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: Date;
  toAccountId?: string; // For transfers
  createdAt: Date;
  updatedAt: Date;
}; 