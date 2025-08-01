export interface Expense {
  id: string;
  amount: number;
  currency: string;
  convertedAmount: number; // 円換算後の金額
  category: string;
  memo: string;
  date: string;
  exchangeRate: number;
}

export interface LifeState {
  totalExpense: number;
  state: 'luxury' | 'modest' | 'homeless' | 'ghost';
  message: string;
  animation: string;
}

export interface CurrencyRate {
  currency: string;
  rate: number;
  lastUpdated: string;
}

export interface MonthlyExpense {
  month: string; // YYYY-MM形式
  totalExpense: number;
  averageExpense: number;
  targetExpense?: number;
  lifeState: LifeState;
}

export type ExpenseCategory = 
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'bills'
  | 'health'
  | 'education'
  | 'other';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, string> = {
  food: '🍽️ 食費',
  transport: '🚗 交通費',
  entertainment: '🎮 娯楽費',
  shopping: '🛍️ 買い物',
  bills: '📄 光熱費',
  health: '🏥 医療費',
  education: '📚 教育費',
  other: '📝 その他'
};

export const LIFE_STATES = {
  luxury: {
    min: 0,
    max: 49999,
    message: '今日はカフェでくつろいだ☕️',
    animation: 'luxury-apartment'
  },
  modest: {
    min: 50000,
    max: 79999,
    message: '今日はインスタントラーメン🍜',
    animation: 'modest-apartment'
  },
  homeless: {
    min: 80000,
    max: 99999,
    message: '今夜は橋の下で眠ります...🥶',
    animation: 'homeless'
  },
  ghost: {
    min: 100000,
    max: Infinity,
    message: '金欠により現世との接続が切れました💸👻',
    animation: 'ghost'
  }
} as const; 