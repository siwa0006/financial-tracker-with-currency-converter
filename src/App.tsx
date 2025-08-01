import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Settings } from 'lucide-react';
import { Expense, LifeState } from './types';
import { LifeStateCalculator } from './utils/lifeStateCalculator';
import LifeAnimation from './components/LifeAnimation';
import ExpenseForm from './components/ExpenseForm';
import ExpenseHistory from './components/ExpenseHistory';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lifeState, setLifeState] = useState<LifeState>({
    totalExpense: 0,
    state: 'luxury',
    message: '今日はカフェでくつろいだ☕️',
    animation: 'luxury-apartment'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');

  // ローカルストレージから支出データを読み込み
  useEffect(() => {
    const savedExpenses = localStorage.getItem('moneymood-expenses');
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      setExpenses(parsedExpenses);
      updateLifeState(parsedExpenses);
    }
  }, []);

  // 支出データが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('moneymood-expenses', JSON.stringify(expenses));
    updateLifeState(expenses);
  }, [expenses]);

  const updateLifeState = (currentExpenses: Expense[]) => {
    const totalExpense = currentExpenses.reduce((sum, expense) => 
      sum + expense.convertedAmount, 0
    );
    const newLifeState = LifeStateCalculator.calculateLifeState(totalExpense);
    setLifeState(newLifeState);
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses(prev => [...prev, newExpense]);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('この支出を削除しますか？')) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  const handleEditExpense = (expenseToEdit: Expense) => {
    // 簡易的な編集機能（実際の実装ではモーダルや専用フォームを使用）
    const newAmount = prompt('新しい金額を入力してください（円）:', expenseToEdit.convertedAmount.toString());
    if (newAmount && !isNaN(parseFloat(newAmount))) {
      const updatedExpense = {
        ...expenseToEdit,
        convertedAmount: parseFloat(newAmount)
      };
      setExpenses(prev => 
        prev.map(expense => 
          expense.id === expenseToEdit.id ? updatedExpense : expense
        )
      );
    }
  };

  const resetAllData = () => {
    if (window.confirm('すべてのデータを削除しますか？この操作は元に戻せません。')) {
      setExpenses([]);
      localStorage.removeItem('moneymood-expenses');
    }
  };

  return (
    <div className="app">
      <style>
        {`
          .app {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          
          .app-container {
            max-width: 1200px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            overflow: hidden;
          }
          
          .app-header {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .app-title {
            font-size: 36px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }
          
          .app-subtitle {
            color: rgba(255, 255, 255, 0.8);
            font-size: 18px;
            margin-bottom: 20px;
          }
          
          .tab-navigation {
            display: flex;
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .tab-button {
            flex: 1;
            padding: 20px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          
          .tab-button.active {
            color: white;
            background: rgba(255, 255, 255, 0.1);
            border-bottom: 3px solid #4CAF50;
          }
          
          .tab-button:hover {
            color: white;
            background: rgba(255, 255, 255, 0.05);
          }
          
          .tab-content {
            padding: 30px;
            min-height: 500px;
          }
          
          .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          
          .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: white;
            margin-bottom: 5px;
          }
          
          .stat-label {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
          }
          
          .settings-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
          }
          
          .settings-title {
            color: white;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          
          .danger-button {
            background: linear-gradient(45deg, #F44336, #D32F2F);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .danger-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
          }
          
          @media (max-width: 768px) {
            .dashboard-grid {
              grid-template-columns: 1fr;
            }
            
            .app-title {
              font-size: 28px;
            }
            
            .tab-content {
              padding: 20px;
            }
          }
        `}
      </style>

      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">💰 MoneyMood</h1>
          <p className="app-subtitle">支出は感情になる - 新感覚の支出管理アプリ</p>
        </header>

        <nav className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Heart size={20} />
            ダッシュボード
          </button>
          <button
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <TrendingUp size={20} />
            履歴
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={20} />
            設定
          </button>
        </nav>

        <main className="tab-content">
          {activeTab === 'dashboard' && (
            <div>
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-value">¥{lifeState.totalExpense.toLocaleString()}</div>
                  <div className="stat-label">総支出</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{expenses.length}</div>
                  <div className="stat-label">支出件数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    ¥{expenses.length > 0 ? (lifeState.totalExpense / expenses.length).toLocaleString() : '0'}
                  </div>
                  <div className="stat-label">平均支出</div>
                </div>
              </div>

              <div className="dashboard-grid">
                <div>
                  <LifeAnimation lifeState={lifeState} />
                </div>
                <div>
                  <ExpenseForm onAddExpense={handleAddExpense} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <ExpenseHistory
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
            />
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="settings-section">
                <h3 className="settings-title">⚙️ アプリ設定</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '20px' }}>
                  アプリの設定やデータ管理を行います。
                </p>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ color: 'white', marginBottom: '10px' }}>📊 データ統計</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    総支出: ¥{lifeState.totalExpense.toLocaleString()}<br />
                    支出件数: {expenses.length}件<br />
                    現在のライフステート: {lifeState.state}
                  </p>
                </div>

                <div>
                  <h4 style={{ color: 'white', marginBottom: '10px' }}>🗑️ データ管理</h4>
                  <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '15px' }}>
                    すべての支出データを削除します。この操作は元に戻せません。
                  </p>
                  <button
                    className="danger-button"
                    onClick={resetAllData}
                  >
                    すべてのデータを削除
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App; 