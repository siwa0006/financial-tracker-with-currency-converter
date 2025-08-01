import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, Tag, MessageSquare } from 'lucide-react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../types';
import { CurrencyApiService } from '../services/currencyApi';

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('JPY');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const supportedCurrencies = CurrencyApiService.getSupportedCurrencies();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      alert('有効な金額を入力してください');
      return;
    }

    setIsLoading(true);

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
        date: new Date().toISOString().split('T')[0],
        exchangeRate: currency === 'JPY' ? 1 : amountNum / convertedAmount
      };

      onAddExpense(newExpense);
      
      // フォームをリセット
      setAmount('');
      setMemo('');
      
    } catch (error) {
      console.error('支出の追加に失敗しました:', error);
      alert('支出の追加に失敗しました。もう一度お試しください。');
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
            color: white;
            margin-bottom: 20px;
            text-align: center;
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
            color: white;
            font-weight: 500;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .form-input,
          .form-select {
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
          }
          
          .form-input:focus,
          .form-select:focus {
            outline: none;
            border-color: #4CAF50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
          }
          
          .form-input::placeholder {
            color: rgba(255, 255, 255, 0.6);
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
          
          @media (max-width: 768px) {
            .form-grid {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>

      <h2 className="form-title">💰 新しい支出を追加</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              <DollarSign size={16} />
              金額
            </label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
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

          <div className="form-group">
            <label className="form-label">
              <Calendar size={16} />
              日付
            </label>
            <input
              type="date"
              className="form-input"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
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
          disabled={isLoading || !amount}
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