import React from 'react';
import { Download, Upload, Globe, Bell } from 'lucide-react';
import { Expense, LifeState, AppSettings } from '../types';
import { CurrencyApiService } from '../services/currencyApi';

interface SettingsProps {
  expenses: Expense[];
  lifeState: LifeState;
  settings: AppSettings;
  onSettingChange: (key: keyof AppSettings, value: any) => void;
  onNestedSettingChange: (parentKey: keyof AppSettings, childKey: string, value: any) => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetAllData: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  expenses,
  lifeState,
  settings,
  onSettingChange,
  onNestedSettingChange,
  onExportData,
  onImportData,
  onResetAllData
}) => {
  return (
    <div>
      <div className="settings-section">
        <h3 className="settings-title">⚙️ アプリ設定</h3>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '30px' }}>
          アプリの設定やデータ管理を行います。
        </p>

        <div className="settings-grid">
          {/* 基本設定 */}
          <div className="setting-group">
            <h4><Globe size={20} />基本設定</h4>
            
            <div className="setting-item">
              <span className="setting-label">デフォルト通貨</span>
              <div className="setting-control">
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => onSettingChange('defaultCurrency', e.target.value)}
                >
                  {CurrencyApiService.getSupportedCurrencies().map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">テーマ</span>
              <div className="setting-control">
                <select
                  value={settings.theme}
                  onChange={(e) => onSettingChange('theme', e.target.value)}
                >
                  <option value="auto">自動</option>
                  <option value="light">ライト</option>
                  <option value="dark">ダーク</option>
                </select>
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">言語</span>
              <div className="setting-control">
                <select
                  value={settings.language}
                  onChange={(e) => onSettingChange('language', e.target.value)}
                >
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* 通知設定 */}
          <div className="setting-group">
            <h4><Bell size={20} />通知設定</h4>
            
            <div className="setting-item">
              <span className="setting-label">予算アラート</span>
              <div className="setting-control">
                <input
                  type="checkbox"
                  checked={settings.notifications.budgetAlerts}
                  onChange={(e) => onNestedSettingChange('notifications', 'budgetAlerts', e.target.checked)}
                />
              </div>
            </div>

            <div className="setting-item">
              <span className="setting-label">週次レポート</span>
              <div className="setting-control">
                <input
                  type="checkbox"
                  checked={settings.notifications.weeklyReports}
                  onChange={(e) => onNestedSettingChange('notifications', 'weeklyReports', e.target.checked)}
                />
              </div>
            </div>
          </div>

          {/* データ統計 */}
          <div className="setting-group">
            <h4>📊 データ統計</h4>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
              <div>総支出: ¥{lifeState.totalExpense.toLocaleString()}</div>
              <div>支出件数: {expenses.length}件</div>
              <div>現在のライフステート: {lifeState.state}</div>
              <div>設定言語: {settings.language === 'ja' ? '日本語' : 'English'}</div>
              <div>デフォルト通貨: {settings.defaultCurrency}</div>
            </div>
          </div>

          {/* データ管理 */}
          <div className="setting-group">
            <h4>💾 データ管理</h4>
            
            <div className="export-import-buttons" style={{ marginBottom: '20px' }}>
              <button className="export-button" onClick={onExportData}>
                <Download size={16} />
                データをエクスポート
              </button>
              
              <button className="import-button" onClick={() => document.getElementById('import-file')?.click()}>
                <Upload size={16} />
                データをインポート
              </button>
              
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={onImportData}
                className="hidden-file-input"
              />
            </div>

            <div>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '15px', fontSize: '14px' }}>
                危険: すべての支出データを削除します。この操作は元に戻せません。
              </p>
              <button className="danger-button" onClick={onResetAllData}>
                すべてのデータを削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;