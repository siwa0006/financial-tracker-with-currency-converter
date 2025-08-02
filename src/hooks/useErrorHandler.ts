import { useState, useCallback } from 'react';
import { AppError, ApiErrorCode } from '../types';

interface UseErrorHandlerReturn {
  error: AppError | null;
  hasError: boolean;
  setError: (error: AppError | string | null) => void;
  clearError: () => void;
  handleAsyncError: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  createError: (code: ApiErrorCode, message: string, details?: string) => AppError;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback((error: AppError | string | null) => {
    if (error === null) {
      setErrorState(null);
    } else if (typeof error === 'string') {
      setErrorState({
        code: ApiErrorCode.SERVER_ERROR,
        message: error,
        timestamp: new Date().toISOString()
      });
    } else {
      setErrorState(error);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const createError = useCallback((
    code: ApiErrorCode, 
    message: string, 
    details?: string
  ): AppError => ({
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  }), []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError();
      const result = await asyncFn();
      return result;
    } catch (err: any) {
      const appError: AppError = {
        code: err.code || ApiErrorCode.SERVER_ERROR,
        message: err.message || '予期しないエラーが発生しました',
        details: err.stack,
        timestamp: new Date().toISOString()
      };
      
      setErrorState(appError);
      
      // エラーログの記録
      if (process.env.NODE_ENV === 'development') {
        console.error('Async error caught:', appError);
      }
      
      return null;
    }
  }, [clearError]);

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
    handleAsyncError,
    createError
  };
};

// 特定のエラータイプに対するヘルパー関数
export const createNetworkError = (message?: string): AppError => ({
  code: ApiErrorCode.NETWORK_ERROR,
  message: message || 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  timestamp: new Date().toISOString()
});

export const createValidationError = (message: string, details?: string): AppError => ({
  code: ApiErrorCode.VALIDATION_ERROR,
  message,
  details,
  timestamp: new Date().toISOString()
});

export const createCurrencyError = (currency: string): AppError => ({
  code: ApiErrorCode.CURRENCY_NOT_SUPPORTED,
  message: `通貨 ${currency} はサポートされていません。`,
  timestamp: new Date().toISOString()
});

// エラーの重要度を判定するヘルパー
export const getErrorSeverity = (error: AppError): 'low' | 'medium' | 'high' | 'critical' => {
  switch (error.code) {
    case ApiErrorCode.VALIDATION_ERROR:
      return 'low';
    case ApiErrorCode.CURRENCY_NOT_SUPPORTED:
    case ApiErrorCode.INVALID_INPUT:
      return 'medium';
    case ApiErrorCode.NETWORK_ERROR:
    case ApiErrorCode.RATE_LIMIT_EXCEEDED:
      return 'high';
    case ApiErrorCode.SERVER_ERROR:
      return 'critical';
    default:
      return 'medium';
  }
};

// エラーメッセージを日本語に変換するヘルパー
export const getLocalizedErrorMessage = (error: AppError): string => {
  const baseMessages: Record<ApiErrorCode, string> = {
    [ApiErrorCode.NETWORK_ERROR]: 'ネットワークエラーが発生しました',
    [ApiErrorCode.INVALID_INPUT]: '入力内容が正しくありません',
    [ApiErrorCode.CURRENCY_NOT_SUPPORTED]: 'サポートされていない通貨です',
    [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 'リクエスト制限に達しました',
    [ApiErrorCode.SERVER_ERROR]: 'サーバーエラーが発生しました',
    [ApiErrorCode.VALIDATION_ERROR]: '入力検証エラーです'
  };

  return error.message || baseMessages[error.code as ApiErrorCode] || '予期しないエラーが発生しました';
};