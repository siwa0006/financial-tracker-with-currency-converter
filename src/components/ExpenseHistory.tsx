import React, { useState, useMemo } from 'react';
import { Trash2, Edit, Calendar, DollarSign } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES } from '../types';

interface ExpenseHistoryProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expense) => void;
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({ 
  expenses, 
  onDeleteExpense, 
  onEditExpense 
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 選択された月の支出をフィルタリング（パフォーマンス最適化）
  const filteredExpenses = useMemo(() => 
    expenses.filter(expense => expense.date.startsWith(selectedMonth)),
    [expenses, selectedMonth]
  );

  // 月別の合計支出と統計を計算（パフォーマンス最適化）
  const { monthlyTotal, categoryTotals } = useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => 
      sum + expense.convertedAmount, 0
    );
    
    const categories = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.convertedAmount;
      return acc;
    }, {} as Record<string, number>);

    return {
      monthlyTotal: total,
      categoryTotals: categories
    };
  }, [filteredExpenses]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="expense-history">
      <style>
        {`
          .expense-history {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .history-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 15px;
          }
          
          .history-title {
            font-size: 24px;
            font-weight: bold;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          }
          
          .month-selector {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .month-input {
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
            font-size: 14px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .month-input:focus {
            outline: none;
            border-color: #4CAF50;
            background: rgba(255, 255, 255, 0.2);
          }
          
          .monthly-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 25px;
          }
          
          .summary-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            text-align: center;
          }
          
          .summary-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            margin-bottom: 5px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          }
          
          .summary-value {
            color: #ffffff;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
          }
          
          .expense-list {
            max-height: 400px;
            overflow-y: auto;
          }
          
          .expense-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
          }
          
          .expense-item:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
          }
          
          .expense-info {
            flex: 1;
          }
          
          .expense-amount {
            font-size: 18px;
            font-weight: bold;
            color: #ffffff;
            margin-bottom: 5px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          }
          
          .expense-details {
            display: flex;
            gap: 15px;
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .expense-actions {
            display: flex;
            gap: 10px;
          }
          
          .action-button {
            padding: 8px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .edit-button {
            background: rgba(76, 175, 80, 0.3);
            color: #4CAF50;
          }
          
          .edit-button:hover {
            background: rgba(76, 175, 80, 0.5);
          }
          
          .delete-button {
            background: rgba(244, 67, 54, 0.3);
            color: #F44336;
          }
          
          .delete-button:hover {
            background: rgba(244, 67, 54, 0.5);
          }
          
          .category-chart {
            margin-top: 20px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }
          
          .chart-title {
            color: #ffffff;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
          }
          
          .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .category-name {
            color: #ffffff;
            font-size: 14px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .category-amount {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .empty-state {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            padding: 40px 20px;
          }
          
          /* レスポンシブ対応 */
          @media (max-width: 768px) {
            .expense-history {
              padding: 20px;
              margin: 15px 0;
            }
            
            .history-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
            
            .history-title {
              font-size: 20px;
            }
            
            .monthly-summary {
              grid-template-columns: 1fr;
              gap: 10px;
            }
            
            .expense-item {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
              padding: 12px;
            }
            
            .expense-actions {
              align-self: flex-end;
            }
            
            .category-chart {
              padding: 15px;
            }
            
            .chart-title {
              font-size: 16px;
            }
          }
          
          @media (max-width: 480px) {
            .expense-history {
              padding: 15px;
              margin: 10px 0;
            }
            
            .history-title {
              font-size: 18px;
            }
            
            .month-input {
              font-size: 13px;
              padding: 6px 10px;
            }
            
            .summary-card {
              padding: 12px;
            }
            
            .summary-label {
              font-size: 13px;
            }
            
            .summary-value {
              font-size: 18px;
            }
            
            .expense-list {
              max-height: 350px;
            }
            
            .expense-item {
              padding: 10px;
              margin-bottom: 8px;
            }
            
            .expense-amount {
              font-size: 16px;
            }
            
            .expense-details {
              font-size: 13px;
              flex-wrap: wrap;
              gap: 8px;
            }
            
            .action-button {
              padding: 6px;
            }
            
            .category-chart {
              padding: 12px;
            }
            
            .chart-title {
              font-size: 15px;
            }
            
            .category-name,
            .category-amount {
              font-size: 13px;
            }
            
            .empty-state {
              padding: 30px 15px;
            }
          }
          
          @media (max-width: 360px) {
            .expense-history {
              padding: 12px;
            }
            
            .history-title {
              font-size: 16px;
            }
            
            .summary-value {
              font-size: 16px;
            }
            
            .expense-amount {
              font-size: 15px;
            }
            
            .expense-details {
              font-size: 12px;
            }
          }
        `}
      </style>

      <div className="history-header">
        <h2 className="history-title">📊 支出履歴</h2>
        <div className="month-selector">
          <Calendar size={16} color="white" />
          <input
            type="month"
            className="month-input"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="monthly-summary">
        <div className="summary-card">
          <div className="summary-label">今月の支出</div>
          <div className="summary-value">¥{monthlyTotal.toLocaleString()}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">支出件数</div>
          <div className="summary-value">{filteredExpenses.length}件</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">平均支出</div>
          <div className="summary-value">
            ¥{filteredExpenses.length > 0 ? (monthlyTotal / filteredExpenses.length).toLocaleString() : '0'}
          </div>
        </div>
      </div>

      {filteredExpenses.length > 0 ? (
        <>
          <div className="expense-list">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <div className="expense-amount">
                    ¥{expense.convertedAmount.toLocaleString()}
                    <span style={{ fontSize: '12px', marginLeft: '5px', opacity: 0.7 }}>
                      ({expense.amount} {expense.currency})
                    </span>
                  </div>
                  <div className="expense-details">
                    <span>{EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES]}</span>
                    <span>{formatDate(expense.date)}</span>
                    {expense.memo && <span>{expense.memo}</span>}
                  </div>
                </div>
                <div className="expense-actions">
                  <button
                    className="action-button edit-button"
                    onClick={() => onEditExpense(expense)}
                    title="編集"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-button delete-button"
                    onClick={() => onDeleteExpense(expense.id)}
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="category-chart">
            <h3 className="chart-title">📈 カテゴリ別支出</h3>
            {Object.entries(categoryTotals)
              .sort(([, a], [, b]) => b - a)
              .map(([category, amount]) => (
                <div key={category} className="category-item">
                  <span className="category-name">
                    {EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]}
                  </span>
                  <span className="category-amount">
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <DollarSign size={48} color="rgba(255, 255, 255, 0.3)" />
          <p>この月の支出はまだありません</p>
          <p>新しい支出を追加してみましょう！</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory; 