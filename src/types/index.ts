// 共通エラー型
export interface AppError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}

// API レスポンス型
export interface ApiResponse<T> {
  data?: T;
  error?: AppError;
  success: boolean;
}

// 通貨コード型（型安全性のため）
export type CurrencyCode = 
  | 'JPY' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' 
  | 'CHF' | 'CNY' | 'KRW' | 'SGD' | 'HKD' | 'MYR' 
  | 'THB' | 'IDR' | 'PHP' | 'VND';

export interface Expense {
  readonly id: string;
  amount: number;
  currency: CurrencyCode;
  convertedAmount: number; // 円換算後の金額
  category: ExpenseCategory;
  memo: string;
  date: string; // ISO date string (YYYY-MM-DD)
  exchangeRate: number;
  readonly createdAt?: string; // ISO timestamp
  readonly updatedAt?: string; // ISO timestamp
}

export interface LifeState {
  totalExpense: number;
  state: 'luxury' | 'modest' | 'homeless' | 'ghost';
  message: string;
  animation: string;
}

export interface CurrencyRate {
  currency: CurrencyCode;
  rate: number;
  lastUpdated: string; // ISO timestamp
  source?: 'api' | 'fallback';
  confidence?: 'high' | 'medium' | 'low';
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

// 設定型の改善
export type ThemeMode = 'light' | 'dark' | 'auto';
export type LanguageCode = 'ja' | 'en';

export interface NotificationSettings {
  budgetAlerts: boolean;
  weeklyReports: boolean;
  pushNotifications?: boolean;
  emailNotifications?: boolean;
}

export interface PrivacySettings {
  dataRetentionDays: number;
  autoBackup: boolean;
  analyticsEnabled?: boolean;
  crashReporting?: boolean;
}

export interface AppSettings {
  defaultCurrency: CurrencyCode;
  theme: ThemeMode;
  language: LanguageCode;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  readonly version?: string;
  readonly lastModified?: string; // ISO timestamp
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: 'JPY' as CurrencyCode,
  theme: 'auto' as ThemeMode,
  language: 'ja' as LanguageCode,
  notifications: {
    budgetAlerts: true,
    weeklyReports: false,
    pushNotifications: false,
    emailNotifications: false,
  },
  privacy: {
    dataRetentionDays: 365,
    autoBackup: true,
    analyticsEnabled: false,
    crashReporting: true,
  },
  version: '1.0.0',
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

// フォームバリデーション関連の型
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

// API エラーコード
export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  CURRENCY_NOT_SUPPORTED = 'CURRENCY_NOT_SUPPORTED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

// ライフサイクル型
export type LifeStateKey = keyof typeof LIFE_STATES;

// ユーティリティ型
export type OptionalExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

// コンポーネントプロップス用の共通型
export interface ComponentWithError {
  error?: string | null;
  onErrorClear?: () => void;
}

export interface ComponentWithLoading {
  isLoading?: boolean;
}

// データエクスポート/インポート用の型
export interface ExportData {
  expenses: Expense[];
  settings: AppSettings;
  exportDate: string;
  version: string;
  checksum?: string;
}

export interface ImportResult {
  success: boolean;
  importedExpenses: number;
  skippedExpenses: number;
  errors: string[];
} 