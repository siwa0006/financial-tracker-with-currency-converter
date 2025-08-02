import React from 'react';
import { Plus, DollarSign, Calendar, Tag, MessageSquare } from 'lucide-react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { CurrencyApiService } from '../services/currencyApi';
import { useFormValidation, createAmountValidationRule, createDateValidationRule } from '../hooks/useFormValidation';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { withAsyncErrorBoundary } from './withErrorBoundary';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  defaultCurrency?: string;
}

interface ExpenseFormData {
  amount: string;
  currency: string;
  category: ExpenseCategory;
  memo: string;
  date: string;
}

const ExpenseFormWithHooks: React.FC<ExpenseFormProps> = ({ 
  onAddExpense, 
  defaultCurrency = 'JPY' 
}) => {
  const initialValues: ExpenseFormData = {
    amount: '',
    currency: defaultCurrency,
    category: 'food',
    memo: '',
    date: new Date().toISOString().split('T')[0]
  };

  const validationRules = {
    amount: createAmountValidationRule(),
    date: createDateValidationRule()
  };

  const { values, errors, isValid, setValue, validateAll, reset } = useFormValidation(
    initialValues,
    validationRules
  );

  const { error: asyncError, handleAsyncError, clearError } = useErrorHandler();

  const supportedCurrencies = CurrencyApiService.getSupportedCurrencies();

  // デフォルト通貨が変更されたら通貨選択を更新
  React.useEffect(() => {
    setValue('currency', defaultCurrency);
  }, [defaultCurrency, setValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // フォーム全体の検証
    if (!validateAll()) {
      return;
    }

    const result = await handleAsyncError(async () => {
      const amountNum = parseFloat(values.amount);
      const convertedAmount = await CurrencyApiService.convertToJPY(
        amountNum, 
        values.currency as any
      );
      
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount: amountNum,
        currency: values.currency as any,
        convertedAmount,
        category: values.category,
        memo: values.memo,
        date: values.date,
        exchangeRate: values.currency === 'JPY' ? 1 : convertedAmount / amountNum,
        createdAt: new Date().toISOString()
      };

      onAddExpense(newExpense);
      reset();
      return newExpense;
    });

    if (!result) {
      // エラーが発生した場合（handleAsyncErrorがnullを返した場合）
      // エラーは既にuseErrorHandlerで管理されている
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
          
          .form-input.error,
          .form-select.error {
            border-color: #ff6b6b;
            box-shadow: 0 0 5px rgba(255, 107, 107, 0.3);
          }
          
          .error-message {
            color: #ff6b6b;
            font-size: 14px;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
            font-weight: 500;
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
          
          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
          }
          
          .submit-button:disabled {
            background: rgba(255, 255, 255, 0.2);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          @media (max-width: 768px) {
            .form-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <h2 className="form-title">💰 新しい支出を追加</h2>
      
      {asyncError && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '20px',
          color: '#ff6b6b',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ {asyncError.message}
          <button
            onClick={clearError}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              <DollarSign size={16} />
              金額
            </label>
            <input
              type="text"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              value={values.amount}
              onChange={(e) => setValue('amount', e.target.value)}
              placeholder="1000 または 1000.50"
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
              value={values.currency}
              onChange={(e) => setValue('currency', e.target.value)}
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
              value={values.category}
              onChange={(e) => setValue('category', e.target.value as ExpenseCategory)}
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              日付
            </label>
            <input
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={values.date}
              onChange={(e) => setValue('date', e.target.value)}
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
              value={values.memo}
              onChange={(e) => setValue('memo', e.target.value)}
              placeholder="支出の詳細を入力..."
            />
          </div>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={!isValid || !!asyncError}
        >
          <Plus size={20} />
          支出を追加
        </button>
      </form>
    </div>
  );
};

// エラーバウンダリでラップしてエクスポート
export default withAsyncErrorBoundary(ExpenseFormWithHooks);