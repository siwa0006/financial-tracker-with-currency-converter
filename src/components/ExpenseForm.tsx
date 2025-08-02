import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, Tag, MessageSquare } from 'lucide-react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { CurrencyApiService } from '../services/currencyApi';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  defaultCurrency?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, defaultCurrency = 'JPY' }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [memo, setMemo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    date?: string;
    general?: string;
  }>({});

  const supportedCurrencies = CurrencyApiService.getSupportedCurrencies();

  // デフォルト通貨が変更されたら通貨選択を更新
  React.useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  // 金額の入力検証
  const validateAmount = (value: string): string | null => {
    if (!value.trim()) {
      return '金額を入力してください';
    }
    
    // 全角数字を検出
    if (/[０-９]/.test(value)) {
      return '数字は半角で入力してください（例: 500）';
    }
    
    // 不正な文字を検出（数字、小数点、負号以外）
    if (!/^-?[0-9]*\.?[0-9]*$/.test(value)) {
      return '数字のみ入力してください（例: 500 または 1500.50）';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return '有効な数字を入力してください';
    }
    
    if (numValue <= 0) {
      return '金額は0より大きい値を入力してください';
    }
    
    if (numValue > 10000000) {
      return '金額は1,000万円以下で入力してください';
    }
    
    // 小数点以下2桁まで
    if (value.includes('.') && value.split('.')[1]?.length > 2) {
      return '小数点以下は2桁まで入力してください';
    }
    
    return null;
  };

  // 日付の入力検証
  const validateDate = (value: string): string | null => {
    if (!value) {
      return '日付を選択してください';
    }
    
    const selectedDate = new Date(value);
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const oneYearLater = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
    if (selectedDate > oneYearLater) {
      return '1年以上先の日付は選択できません';
    }
    
    if (selectedDate < oneYearAgo) {
      return '1年以上前の日付は選択できません';
    }
    
    return null;
  };

  // リアルタイム検証
  const handleAmountChange = (value: string) => {
    setAmount(value);
    
    // リアルタイムでエラーメッセージを表示
    const error = validateAmount(value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors.amount = error;
      } else {
        delete newErrors.amount;
      }
      return newErrors;
    });
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    
    // リアルタイムでエラーメッセージを表示
    const error = validateDate(value);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors.date = error;
      } else {
        delete newErrors.date;
      }
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // フォーム全体の検証
    const amountError = validateAmount(amount);
    const dateError = validateDate(date);
    
    const newErrors: typeof errors = {};
    if (amountError) newErrors.amount = amountError;
    if (dateError) newErrors.date = dateError;
    
    setErrors(newErrors);
    
    // エラーがある場合は送信しない
    if (amountError || dateError) {
      return;
    }

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: undefined }));

    try {
      const amountNum = parseFloat(amount);
      const convertedAmount = await CurrencyApiService.convertToJPY(amountNum, currency);
      
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: amountNum,
        currency,
        convertedAmount,
        category,
        memo,
        date: date,
        exchangeRate: currency === 'JPY' ? 1 : convertedAmount / amountNum
      };

      onAddExpense(newExpense);
      
      // フォームをリセット
      setAmount('');
      setMemo('');
      setErrors({});
      
    } catch (error) {
      console.error('支出の追加に失敗しました:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: 'ネットワークエラーが発生しました。インターネット接続を確認してもう一度お試しください。' 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="expense-form">
      <style>
        {`
          .expense-form {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .form-title {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          }
          
          .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .form-group {
            display: flex;
            flex-direction: column;
          }
          
          .form-group.full-width {
            grid-column: 1 / -1;
          }
          
          .form-label {
            color: #ffffff;
            font-weight: 600;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
          }
          
          .form-input,
          .form-select {
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            font-size: 16px;
            transition: all 0.3s ease;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          }
          
          .form-input:focus,
          .form-select:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
            background: rgba(255, 255, 255, 0.2);
          }
          
          .form-input::placeholder {
            color: rgba(255, 255, 255, 0.75);
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .submit-button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          
          .submit-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
          }
          
          .submit-button:disabled {
            background: rgba(255, 255, 255, 0.2);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .error-message {
            color: #ff8a8a;
            font-size: 14px;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
          }

          .general-error {
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid rgba(255, 107, 107, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 20px;
            color: #ff6b6b;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .form-input.error,
          .form-select.error {
            border-color: #ff6b6b;
            box-shadow: 0 0 5px rgba(255, 107, 107, 0.3);
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-5px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          /* レスポンシブ対応 */
          @media (max-width: 768px) {
            .expense-form {
              padding: 20px;
              margin: 15px 0;
            }
            
            .form-title {
              font-size: 20px;
            }
            
            .form-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }
            
            .form-input,
            .form-select {
              font-size: 16px;
              padding: 12px;
            }
            
            .submit-button {
              font-size: 16px;
              padding: 14px;
            }
          }
          
          @media (max-width: 480px) {
            .expense-form {
              padding: 15px;
              margin: 10px 0;
            }
            
            .form-title {
              font-size: 18px;
              margin-bottom: 15px;
            }
            
            .form-grid {
              gap: 10px;
            }
            
            .form-label {
              font-size: 14px;
            }
            
            .form-input,
            .form-select {
              font-size: 16px;
              padding: 10px;
            }
            
            .submit-button {
              font-size: 15px;
              padding: 12px;
            }
            
            .error-message {
              font-size: 13px;
            }
            
            .general-error {
              padding: 10px;
              font-size: 13px;
            }
          }
          
          @media (max-width: 360px) {
            .expense-form {
              padding: 12px;
            }
            
            .form-title {
              font-size: 16px;
            }
            
            .form-input,
            .form-select {
              padding: 8px;
            }
            
            .submit-button {
              font-size: 14px;
              padding: 10px;
            }
          }
        `}
      </style>

      <h2 className="form-title">💰 新しい支出を追加</h2>
      
      {errors.general && (
        <div className="general-error">
          ⚠️ {errors.general}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className={`form-group ${errors.amount ? 'has-error' : ''}`}>
            <label className="form-label">
              <DollarSign size={16} />
              金額
            </label>
            <input
              type="text"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="500"
              required
            />
            {errors.amount && (
              <div className="error-message">
                ⚠️ {errors.amount}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              <DollarSign size={16} />
              通貨
            </label>
            <select
              className="form-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {supportedCurrencies.map(curr => (
                <option key={curr} value={curr}>
                  {curr}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Tag size={16} />
              カテゴリ
            </label>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className={`form-group ${errors.date ? 'has-error' : ''}`}>
            <label className="form-label">
              <Calendar size={16} />
              日付
            </label>
            <input
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
            {errors.date && (
              <div className="error-message">
                ⚠️ {errors.date}
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label className="form-label">
              <MessageSquare size={16} />
              メモ
            </label>
            <input
              type="text"
              className="form-input"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="支出の詳細を入力..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={isLoading || !amount || !!errors.amount || !!errors.date || !!errors.general}
        >
          {isLoading ? (
            <>処理中...</>
          ) : (
            <>
              <Plus size={20} />
              支出を追加
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm; 