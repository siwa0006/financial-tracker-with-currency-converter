import React, { ReactNode, useState, useEffect } from 'react';
import { AppError, ApiErrorCode } from '../types';

interface Props {
  children: ReactNode;
  onError?: (error: AppError) => void;
}

interface AsyncErrorBoundaryState {
  error: AppError | null;
  isRetrying: boolean;
}

const AsyncErrorBoundary: React.FC<Props> = ({ children, onError }) => {
  const [state, setState] = useState<AsyncErrorBoundaryState>({
    error: null,
    isRetrying: false
  });

  // Promiseのunhandledrejectionをキャッチ
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error: AppError = {
        code: ApiErrorCode.NETWORK_ERROR,
        message: event.reason?.message || 'ネットワークエラーが発生しました',
        details: event.reason?.stack,
        timestamp: new Date().toISOString()
      };

      setState(prev => ({ ...prev, error }));
      
      if (onError) {
        onError(error);
      }

      // デフォルトの処理を防ぐ
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  const handleRetry = async () => {
    setState(prev => ({ ...prev, isRetrying: true }));
    
    // 少し待ってからリセット
    setTimeout(() => {
      setState({ error: null, isRetrying: false });
    }, 1000);
  };

  const clearError = () => {
    setState({ error: null, isRetrying: false });
  };

  if (state.error) {
    return (
      <AsyncErrorFallback
        error={state.error}
        onRetry={handleRetry}
        onClear={clearError}
        isRetrying={state.isRetrying}
      />
    );
  }

  return <>{children}</>;
};

interface AsyncErrorFallbackProps {
  error: AppError;
  onRetry: () => void;
  onClear: () => void;
  isRetrying: boolean;
}

const AsyncErrorFallback: React.FC<AsyncErrorFallbackProps> = ({
  error,
  onRetry,
  onClear,
  isRetrying
}) => {
  const getErrorMessage = (code: string) => {
    switch (code) {
      case ApiErrorCode.NETWORK_ERROR:
        return {
          title: 'ネットワークエラー',
          message: 'インターネット接続を確認してもう一度お試しください。',
          emoji: '🌐'
        };
      case ApiErrorCode.RATE_LIMIT_EXCEEDED:
        return {
          title: 'リクエスト制限',
          message: 'しばらく時間をおいてからもう一度お試しください。',
          emoji: '⏱️'
        };
      case ApiErrorCode.CURRENCY_NOT_SUPPORTED:
        return {
          title: '通貨エラー',
          message: 'サポートされていない通貨が選択されています。',
          emoji: '💱'
        };
      case ApiErrorCode.VALIDATION_ERROR:
        return {
          title: '入力エラー',
          message: '入力内容を確認してください。',
          emoji: '⚠️'
        };
      default:
        return {
          title: 'エラーが発生しました',
          message: 'もう一度お試しください。',
          emoji: '❌'
        };
    }
  };

  const { title, message, emoji } = getErrorMessage(error.code);

  return (
    <div style={{
      background: 'rgba(255, 107, 107, 0.1)',
      border: '1px solid rgba(255, 107, 107, 0.3)',
      borderRadius: '12px',
      padding: '20px',
      margin: '15px 0',
      textAlign: 'center',
      color: '#ff6b6b'
    }}>
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{emoji}</div>
      <h3 style={{ 
        fontSize: '18px', 
        fontWeight: 'bold', 
        marginBottom: '8px',
        color: '#ff6b6b'
      }}>
        {title}
      </h3>
      <p style={{ 
        marginBottom: '15px', 
        color: 'rgba(255, 107, 107, 0.8)',
        lineHeight: '1.4'
      }}>
        {message}
      </p>

      {process.env.NODE_ENV === 'development' && (
        <details style={{
          marginBottom: '15px',
          textAlign: 'left',
          background: 'rgba(255, 107, 107, 0.05)',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '12px',
          border: '1px solid rgba(255, 107, 107, 0.2)'
        }}>
          <summary style={{ 
            marginBottom: '5px', 
            cursor: 'pointer',
            color: '#ff6b6b',
            fontWeight: 'bold'
          }}>
            エラー詳細 (開発環境)
          </summary>
          <div style={{ color: '#666', fontFamily: 'monospace' }}>
            <div><strong>Code:</strong> {error.code}</div>
            <div><strong>Message:</strong> {error.message}</div>
            <div><strong>Timestamp:</strong> {error.timestamp}</div>
            {error.details && (
              <div>
                <strong>Details:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>
                  {error.details}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          style={{
            background: isRetrying 
              ? 'rgba(76, 175, 80, 0.6)' 
              : 'linear-gradient(45deg, #4CAF50, #45a049)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: isRetrying ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          {isRetrying ? '再試行中...' : '再試行'}
        </button>
        <button
          onClick={onClear}
          style={{
            background: 'transparent',
            color: '#ff6b6b',
            border: '1px solid #ff6b6b',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default AsyncErrorBoundary;