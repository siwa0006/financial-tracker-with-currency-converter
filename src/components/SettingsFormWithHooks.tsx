import React from 'react';
import { Globe, Bell, Download, Upload } from 'lucide-react';
import { AppSettings, CurrencyCode } from '../types';
import { useSettings } from '../hooks/useSettings';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { withComponentErrorBoundary } from './withErrorBoundary';
import { CurrencyApiService } from '../services/currencyApi';

interface SettingsFormProps {
  onSettingsChange?: (settings: AppSettings) => void;
}

const SettingsFormWithHooks: React.FC<SettingsFormProps> = ({
  onSettingsChange
}) => {
  const {
    settings,
    isLoading: settingsLoading,
    error: settingsError,
    updateSetting,
    updateNestedSetting,
    resetSettings,
    exportSettings
  } = useSettings();

  const { error: generalError, handleAsyncError, clearError } = useErrorHandler();

  const supportedCurrencies = CurrencyApiService.getSupportedCurrencies();

  // 設定変更時に親コンポーネントに通知
  React.useEffect(() => {
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleAsyncError(async () => {
      // This would be implemented in useSettings
      console.log('Importing settings from file:', file.name);
      // await importSettings(file);
    });

    // ファイル入力をクリア
    event.target.value = '';
  };

  const handleReset = async () => {
    if (window.confirm('すべての設定をリセットしますか？')) {
      await handleAsyncError(async () => {
        resetSettings();
      });
    }
  };

  return (
    <div className="settings-form">
      <style>
        {`
          .settings-form {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .settings-title {
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          }
          
          .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
          }
          
          .setting-group {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 20px;
          }
          
          .setting-group h4 {
            color: white;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 18px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
          }
          
          .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .setting-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .setting-label {
            color: rgba(255, 255, 255, 0.9);
            font-size: 14px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
          }
          
          .setting-control select,
          .setting-control input[type="checkbox"] {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            color: white;
            padding: 8px 12px;
            text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
          }
          
          .setting-control select:focus {
            outline: none;
            border-color: #4CAF50;
            background: rgba(255, 255, 255, 0.2);
          }
          
          .action-buttons {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 20px;
          }
          
          .action-button {
            background: linear-gradient(45deg, #4CAF50, #45a049);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: bold;
          }
          
          .action-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
          }
          
          .action-button.secondary {
            background: linear-gradient(45deg, #2196F3, #1976D2);
          }
          
          .action-button.secondary:hover {
            box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4);
          }
          
          .action-button.danger {
            background: linear-gradient(45deg, #F44336, #D32F2F);
          }
          
          .action-button.danger:hover {
            box-shadow: 0 5px 15px rgba(244, 67, 54, 0.4);
          }
          
          .action-button:disabled {
            background: rgba(255, 255, 255, 0.2);
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          .hidden-file-input {
            display: none;
          }
          
          .error-display {
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
          
          @media (max-width: 768px) {
            .settings-grid {
              grid-template-columns: 1fr;
            }
            
            .action-buttons {
              flex-direction: column;
            }
          }
        `}
      </style>

      <h3 className="settings-title">⚙️ アプリ設定</h3>

      {(settingsError || generalError) && (
        <div className="error-display">
          ⚠️ {settingsError || generalError?.message}
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

      <div className="settings-grid">
        {/* 基本設定 */}
        <div className="setting-group">
          <h4><Globe size={20} />基本設定</h4>
          
          <div className="setting-item">
            <span className="setting-label">デフォルト通貨</span>
            <div className="setting-control">
              <select
                value={settings.defaultCurrency}
                onChange={(e) => updateSetting('defaultCurrency', e.target.value as CurrencyCode)}
                disabled={settingsLoading}
              >
                {supportedCurrencies.map(currency => (
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
                onChange={(e) => updateSetting('theme', e.target.value as any)}
                disabled={settingsLoading}
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
                onChange={(e) => updateSetting('language', e.target.value as any)}
                disabled={settingsLoading}
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
                onChange={(e) => updateNestedSetting('notifications', 'budgetAlerts', e.target.checked)}
                disabled={settingsLoading}
              />
            </div>
          </div>

          <div className="setting-item">
            <span className="setting-label">週次レポート</span>
            <div className="setting-control">
              <input
                type="checkbox"
                checked={settings.notifications.weeklyReports}
                onChange={(e) => updateNestedSetting('notifications', 'weeklyReports', e.target.checked)}
                disabled={settingsLoading}
              />
            </div>
          </div>

          {settings.notifications.pushNotifications !== undefined && (
            <div className="setting-item">
              <span className="setting-label">プッシュ通知</span>
              <div className="setting-control">
                <input
                  type="checkbox"
                  checked={settings.notifications.pushNotifications}
                  onChange={(e) => updateNestedSetting('notifications', 'pushNotifications', e.target.checked)}
                  disabled={settingsLoading}
                />
              </div>
            </div>
          )}
        </div>

        {/* データ管理 */}
        <div className="setting-group">
          <h4>💾 データ管理</h4>
          
          <div className="action-buttons">
            <button 
              className="action-button" 
              onClick={exportSettings}
              disabled={settingsLoading}
            >
              <Download size={16} />
              設定をエクスポート
            </button>
            
            <button 
              className="action-button secondary" 
              onClick={() => document.getElementById('import-settings-file')?.click()}
              disabled={settingsLoading}
            >
              <Upload size={16} />
              設定をインポート
            </button>
            
            <input
              id="import-settings-file"
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden-file-input"
            />
            
            <button 
              className="action-button danger" 
              onClick={handleReset}
              disabled={settingsLoading}
            >
              設定をリセット
            </button>
          </div>
        </div>
      </div>

      {settings.version && (
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '12px'
        }}>
          バージョン: {settings.version}
        </div>
      )}
    </div>
  );
};

// エラーバウンダリでラップしてエクスポート
export default withComponentErrorBoundary(SettingsFormWithHooks);