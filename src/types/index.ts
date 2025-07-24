export type User = {
  id: string;
  email: string;
  displayName: string | null;
};

export type AccountType = 'bank' | 'emoney' | 'wallet';

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
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