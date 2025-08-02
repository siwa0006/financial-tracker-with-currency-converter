import { CurrencyRate, CurrencyCode, AppError, ApiErrorCode } from '../types';

// 無料の為替レートAPI（ExchangeRate-API）
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/JPY';

export class CurrencyApiService {
  private static rates: Map<string, number> = new Map();
  private static lastUpdated: string = '';
  private static cacheExpiryTime = 5 * 60 * 1000; // 5分

  static async getExchangeRates(): Promise<CurrencyRate[]> {
    // キャッシュが有効かチェック
    if (this.rates.size > 0 && this.lastUpdated) {
      const timeSinceUpdate = Date.now() - new Date(this.lastUpdated).getTime();
      if (timeSinceUpdate < this.cacheExpiryTime) {
        return Array.from(this.rates.entries()).map(([currency, rate]) => ({
          currency,
          rate,
          lastUpdated: this.lastUpdated
        }));
      }
    }

    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.rates) {
        this.rates.clear();
        Object.entries(data.rates).forEach(([currency, rate]) => {
          this.rates.set(currency, rate as number);
        });
        this.lastUpdated = new Date().toISOString();
      }

      return Array.from(this.rates.entries()).map(([currency, rate]) => ({
        currency,
        rate,
        lastUpdated: this.lastUpdated
      }));
    } catch (error) {
      console.error('為替レートの取得に失敗しました:', error);
      // フォールバック用の固定レート
      return this.getFallbackRates();
    }
  }

  static async convertToJPY(amount: number, fromCurrency: CurrencyCode): Promise<number> {
    // 入力値の検証
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      const error: AppError = {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: '金額は有効な数値である必要があります',
        timestamp: new Date().toISOString()
      };
      throw error;
    }
    
    if (amount <= 0) {
      const error: AppError = {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: '金額は0より大きい値である必要があります',
        timestamp: new Date().toISOString()
      };
      throw error;
    }
    
    if (amount > 100000000) {
      const error: AppError = {
        code: ApiErrorCode.VALIDATION_ERROR,
        message: '金額が大きすぎます（1億円以下で入力してください）',
        timestamp: new Date().toISOString()
      };
      throw error;
    }
    
    if (!fromCurrency || typeof fromCurrency !== 'string') {
      const error: AppError = {
        code: ApiErrorCode.INVALID_INPUT,
        message: '通貨コードが指定されていません',
        timestamp: new Date().toISOString()
      };
      throw error;
    }
    
    const supportedCurrencies = this.getSupportedCurrencies();
    if (!supportedCurrencies.includes(fromCurrency)) {
      const error: AppError = {
        code: ApiErrorCode.CURRENCY_NOT_SUPPORTED,
        message: `通貨 ${fromCurrency} はサポートされていません`,
        timestamp: new Date().toISOString()
      };
      throw error;
    }
    
    if (fromCurrency === 'JPY') {
      return amount;
    }

    try {
      const rates = await this.getExchangeRates();
      const rate = rates.find(r => r.currency === fromCurrency)?.rate;
      
      if (rate) {
        return amount / rate; // JPYベースのレートなので除算
      }
      
      const error: AppError = {
        code: ApiErrorCode.CURRENCY_NOT_SUPPORTED,
        message: `通貨 ${fromCurrency} のレートが見つかりません`,
        timestamp: new Date().toISOString()
      };
      throw error;
    } catch (error: any) {
      console.error(`通貨変換エラー (${fromCurrency} -> JPY):`, error);
      
      // 既にAppErrorの場合はそのまま再スロー
      if (error.code && error.message && error.timestamp) {
        throw error;
      }
      
      // フォールバックとして固定レートを使用
      const fallbackRates = this.getFallbackRates();
      const fallbackRate = fallbackRates.find(r => r.currency === fromCurrency)?.rate;
      
      if (fallbackRate) {
        return amount / fallbackRate;
      }
      
      const appError: AppError = {
        code: ApiErrorCode.NETWORK_ERROR,
        message: `通貨 ${fromCurrency} の変換に失敗しました`,
        details: error.message,
        timestamp: new Date().toISOString()
      };
      throw appError;
    }
  }

  static getSupportedCurrencies(): CurrencyCode[] {
    return [
      'JPY', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CHF', 'CNY', 
      'KRW', 'SGD', 'HKD', 'MYR', 'THB', 'IDR', 'PHP', 'VND'
    ];
  }

  private static getFallbackRates(): CurrencyRate[] {
    // フォールバック用の固定レート
    const fallbackRates: Record<string, number> = {
      USD: 0.0067,
      EUR: 0.0062,
      GBP: 0.0053,
      CAD: 0.0091,
      AUD: 0.0102,
      CHF: 0.0059,
      CNY: 0.048,
      KRW: 8.9,
      SGD: 0.0090,
      HKD: 0.052,
      MYR: 0.031,
      THB: 0.24,
      IDR: 105,
      PHP: 0.37,
      VND: 162
    };

    return Object.entries(fallbackRates).map(([currency, rate]) => ({
      currency,
      rate,
      lastUpdated: new Date().toISOString()
    }));
  }
} 