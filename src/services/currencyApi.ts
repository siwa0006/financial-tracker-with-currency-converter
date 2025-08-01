import { CurrencyRate } from '../types';

// 無料の為替レートAPI（ExchangeRate-API）
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest/JPY';

export class CurrencyApiService {
  private static rates: Map<string, number> = new Map();
  private static lastUpdated: string = '';

  static async getExchangeRates(): Promise<CurrencyRate[]> {
    try {
      const response = await fetch(API_BASE_URL);
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

  static async convertToJPY(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'JPY') {
      return amount;
    }

    const rates = await this.getExchangeRates();
    const rate = rates.find(r => r.currency === fromCurrency)?.rate;
    
    if (rate) {
      return amount / rate; // JPYベースのレートなので除算
    }
    
    throw new Error(`通貨 ${fromCurrency} のレートが見つかりません`);
  }

  static getSupportedCurrencies(): string[] {
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