import React, { useState, useEffect } from 'react';
import { Heart, TrendingUp, Settings } from 'lucide-react';
import { Expense, LifeState, AppSettings, DEFAULT_SETTINGS } from './types';
import { LifeStateCalculator } from './utils/lifeStateCalculator';
import Dashboard from './pages/Dashboard';
import ExpenseHistory from './components/ExpenseHistory';
import SettingsPage from './pages/Settings';
import './styles/App.css';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [lifeState, setLifeState] = useState<LifeState>({
    totalExpense: 0,
    state: 'luxury',
    message: '今日はカフェでくつろいだ☕️',
    animation: 'luxury-apartment'
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // ローカルストレージから支出データと設定を読み込み
  useEffect(() => {
    const savedExpenses = localStorage.getItem('moneymood-expenses');
    const savedSettings = localStorage.getItem('moneymood-settings');
    
    if (savedExpenses) {
      const parsedExpenses = JSON.parse(savedExpenses);
      setExpenses(parsedExpenses);
      updateLifeState(parsedExpenses);
    }
    
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
    }
  }, []);

  // 支出データが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('moneymood-expenses', JSON.stringify(expenses));
    updateLifeState(expenses);
  }, [expenses]);

  // 設定が変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem('moneymood-settings', JSON.stringify(settings));
  }, [settings]);

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

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleNestedSettingChange = (parentKey: keyof AppSettings, childKey: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
  };

  const exportData = () => {
    const data = {
      expenses,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneymood-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.expenses && Array.isArray(data.expenses)) {
          setExpenses(data.expenses);
        }
        if (data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
        alert('データのインポートが完了しました！');
      } catch (error) {
        alert('ファイルの読み込みに失敗しました。正しいフォーマットのファイルを選択してください。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app">

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
            <Dashboard
              lifeState={lifeState}
              onAddExpense={handleAddExpense}
              defaultCurrency={settings.defaultCurrency}
            />
          )}

          {activeTab === 'history' && (
            <ExpenseHistory
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              expenses={expenses}
              lifeState={lifeState}
              settings={settings}
              onSettingChange={handleSettingChange}
              onNestedSettingChange={handleNestedSettingChange}
              onExportData={exportData}
              onImportData={importData}
              onResetAllData={resetAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App; 