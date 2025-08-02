import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ApiErrorCode } from '../types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    // エラーログの記録
    this.logError(error, errorInfo);

    // 親コンポーネントにエラーを通知
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData: AppError = {
      code: ApiErrorCode.SERVER_ERROR,
      message: error.message,
      details: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    // 開発環境ではコンソールに出力
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', errorData);
      console.error('Component stack:', errorInfo.componentStack);
      console.error('Error stack:', error.stack);
    }

    // プロダクション環境では外部サービスに送信
    // TODO: エラー監視サービス（Sentry等）への送信を実装
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // レベルに応じた標準エラーUI
      if (this.props.level === 'global') {
        return <GlobalErrorFallback 
          error={this.state.error}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          errorId={this.state.errorId}
        />;
      }

      return <ComponentErrorFallback 
        error={this.state.error}
        onRetry={this.handleRetry}
        errorId={this.state.errorId}
      />;
    }

    return this.props.children;
  }
}

// グローバルエラー用のフォールバックコンポーネント
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
  onReload?: () => void;
  errorId: string | null;
}

const GlobalErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  onReload,
  errorId
}) => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px'
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '500px',
      width: '100%',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '20px' }}>💥</div>
      <h1 style={{ fontSize: '24px', marginBottom: '20px', fontWeight: 'bold' }}>
        予期しないエラーが発生しました
      </h1>
      <p style={{ 
        marginBottom: '20px', 
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: '1.6'
      }}>
        アプリケーションでエラーが発生しました。<br />
        お手数ですが、以下のボタンから再試行してください。
      </p>
      
      {process.env.NODE_ENV === 'development' && error && (
        <details style={{
          marginBottom: '20px',
          textAlign: 'left',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <summary style={{ marginBottom: '10px', cursor: 'pointer' }}>
            エラー詳細 (開発環境)
          </summary>
          <code style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </code>
        </details>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={onRetry}
          style={{
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          再試行
        </button>
        {onReload && (
          <button
            onClick={onReload}
            style={{
              background: 'linear-gradient(45deg, #2196F3, #1976D2)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            ページを再読み込み
          </button>
        )}
      </div>

      {errorId && (
        <p style={{
          marginTop: '20px',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          エラーID: {errorId}
        </p>
      )}
    </div>
  </div>
);

// コンポーネントレベルエラー用のフォールバック
const ComponentErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  errorId
}) => (
  <div style={{
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px 0',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
    <h3 style={{ color: '#ff6b6b', marginBottom: '10px' }}>
      コンポーネントエラー
    </h3>
    <p style={{ marginBottom: '15px', color: '#666' }}>
      この部分でエラーが発生しました。再試行してください。
    </p>
    
    {process.env.NODE_ENV === 'development' && error && (
      <details style={{
        marginBottom: '15px',
        textAlign: 'left',
        background: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <summary style={{ marginBottom: '5px', cursor: 'pointer' }}>
          エラー詳細
        </summary>
        <code>{error.message}</code>
      </details>
    )}

    <button
      onClick={onRetry}
      style={{
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      再試行
    </button>
  </div>
);

export default ErrorBoundary;