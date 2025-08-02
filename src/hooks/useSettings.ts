import { useState, useEffect, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types';

interface UseSettingsReturn {
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updateNestedSetting: <P extends keyof AppSettings, K extends keyof AppSettings[P]>(
    parentKey: P, 
    childKey: K, 
    value: AppSettings[P][K]
  ) => void;
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (file: File) => Promise<void>;
}

const STORAGE_KEY = 'moneymood-settings';

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージから設定を読み込み
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // 設定の妥当性チェック
        if (parsedSettings && typeof parsedSettings === 'object') {
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        } else {
          console.warn('Invalid settings format, using defaults');
          setSettings(DEFAULT_SETTINGS);
        }
      }
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      setError('設定データの読み込みに失敗しました');
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // 設定が変更されたらローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
      setError('設定データの保存に失敗しました');
    }
  }, [settings]);

  // 設定を更新
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setError(null);
  }, []);

  // ネストした設定を更新
  const updateNestedSetting = useCallback(<
    P extends keyof AppSettings,
    K extends keyof AppSettings[P]
  >(
    parentKey: P,
    childKey: K,
    value: AppSettings[P][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [parentKey]: {
        ...(prev[parentKey] as any),
        [childKey]: value
      }
    }));
    setError(null);
  }, []);

  // 設定をリセット
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 設定をエクスポート
  const exportSettings = useCallback(() => {
    try {
      const dataToExport = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moneymood-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
      setError('設定のエクスポートに失敗しました');
    }
  }, [settings]);

  // 設定をインポート
  const importSettings = useCallback(async (file: File): Promise<void> => {
    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          
          if (data.settings && typeof data.settings === 'object') {
            // 設定の妥当性チェック
            const validSettings = { ...DEFAULT_SETTINGS, ...data.settings };
            setSettings(validSettings);
            setIsLoading(false);
            resolve();
          } else {
            throw new Error('Invalid settings format');
          }
        } catch (error) {
          console.error('Failed to import settings:', error);
          setError('設定のインポートに失敗しました。正しいフォーマットのファイルを選択してください。');
          setIsLoading(false);
          reject(error);
        }
      };

      reader.onerror = () => {
        setError('ファイルの読み込みに失敗しました');
        setIsLoading(false);
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    updateNestedSetting,
    resetSettings,
    exportSettings,
    importSettings
  };
};