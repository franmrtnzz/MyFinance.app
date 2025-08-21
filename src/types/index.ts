export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'equity' | 'etf' | 'fund' | 'crypto' | 'cash' | 'bond' | 'commodity' | 'forex' | 'real_estate';
  symbol?: string;
  currency: string;
  currentValue: number;
  targetAllocation?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetTransaction {
  id: string;
  assetId: string;
  type: 'buy' | 'sell' | 'dividend' | 'fee' | 'transfer';
  amount: number;
  quantity?: number;
  price?: number;
  currency: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  currency: string;
  category: string;
  cadence: 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  account: string;
  merchant: string;
  notes?: string;
  isActive: boolean;
  noDueDate?: boolean; // Nueva propiedad para suscripciones sin vencimiento
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  assets: Asset[];
  allocation: Record<string, number>;
}

export interface UserSettings {
  userName: string;
  defaultCurrency: string;
  weekStartsOn: 'monday' | 'sunday';
  categories: string[];
  accounts: string[];
  theme: 'light' | 'dark';
} 