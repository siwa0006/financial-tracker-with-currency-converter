import { useState, useEffect, useCallback } from 'react';
import { Expense } from '../types';
import { CurrencyApiService } from '../services/currencyApi';

interface UseExpensesReturn {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, 'id' | 'convertedAmount' | 'exchangeRate'>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByMonth: (month: string) => Expense[];
  getTotalExpense: () => number;
  getExpensesByCategory: () => Record<string, number>;
  clearAllExpenses: () => void;
}

const STORAGE_KEY = 'moneymood-expenses';

export const useExpenses = (): UseExpensesReturn => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージから支出データを読み込み
  useEffect(() => {
    try {
      const savedExpenses = localStorage.getItem(STORAGE_KEY);
      if (savedExpenses) {
        const parsedExpenses = JSON.parse(savedExpenses);
        // データの妥当性チェック
        if (Array.isArray(parsedExpenses)) {
          setExpenses(parsedExpenses);
        } else {
          console.warn('Invalid expenses data format, using empty array');
          setExpenses([]);
        }
      }
    } catch (error) {
      console.error('Failed to load expenses from localStorage:', error);
      setError('支出データの読み込みに失敗しました');
      setExpenses([]);
    }
  }, []);

  // 支出データが変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (error) {
      console.error('Failed to save expenses to localStorage:', error);
      setError('支出データの保存に失敗しました');
    }
  }, [expenses]);

  // 新しい支出を追加
  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'convertedAmount' | 'exchangeRate'>) => {
    setIsLoading(true);
    setError(null);

    try {
      // 通貨変換
      const convertedAmount = await CurrencyApiService.convertToJPY(expenseData.amount, expenseData.currency);
      
      const newExpense: Expense = {
        ...expenseData,
        id: Date.now().toString(),
        convertedAmount,
        exchangeRate: expenseData.currency === 'JPY' ? 1 : convertedAmount / expenseData.amount
      };

      setExpenses(prev => [...prev, newExpense]);
    } catch (error) {
      console.error('Failed to add expense:', error);
      setError('支出の追加に失敗しました。ネットワーク接続を確認してもう一度お試しください。');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 支出を更新
  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === id ? { ...expense, ...updates } : expense
      )
    );
  }, []);

  // 支出を削除
  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, []);

  // 月別の支出を取得
  const getExpensesByMonth = useCallback((month: string) => {
    return expenses.filter(expense => expense.date.startsWith(month));
  }, [expenses]);

  // 総支出を計算
  const getTotalExpense = useCallback(() => {
    return expenses.reduce((sum, expense) => sum + expense.convertedAmount, 0);
  }, [expenses]);

  // カテゴリ別支出を計算
  const getExpensesByCategory = useCallback(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.convertedAmount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  // すべての支出をクリア
  const clearAllExpenses = useCallback(() => {
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    getExpensesByMonth,
    getTotalExpense,
    getExpensesByCategory,
    clearAllExpenses
  };
};