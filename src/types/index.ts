export type User = {
  id: string;
  email: string;
  displayName: string | null;
  preferences?: {
    defaultCurrency: string;
    language: string;
    theme: 'light' | 'dark';
  };
  createdAt?: Date;
  updatedAt?: Date;
};

export type AccountType = 
  | 'bank' 
  | 'cash' 
  | 'credit_card' 
  | 'investment' 
  | 'loan' 
  | 'emoney' 
  | 'point'
  | 'wallet';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon?: string;
  institutionName?: string;
  accountNumber?: string;
  isArchived: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionCategory = {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
  parentId?: string;
  userId: string;
};

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: Date;
  currency: string;
  exchangeRate?: number;
  status: 'pending' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurringSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
  };
  tags: string[];
  attachments: {
    id: string;
    url: string;
    type: string;
    name: string;
  }[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  toAccountId?: string; // For transfers
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

export type Budget = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  currency: string;
  categoryIds: string[];
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  rollover: boolean;
  notifications: {
    enabled: boolean;
    threshold: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Report = {
  id: string;
  userId: string;
  name: string;
  type: 'expense' | 'income' | 'balance' | 'budget';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    accounts?: string[];
    categories?: string[];
    tags?: string[];
  };
  groupBy: 'day' | 'week' | 'month' | 'year' | 'category';
  createdAt: Date;
  updatedAt: Date;
}; 