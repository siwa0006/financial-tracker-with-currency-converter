import React, { ComponentType, ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import AsyncErrorBoundary from './AsyncErrorBoundary';
import { AppError } from '../types';

interface WithErrorBoundaryOptions {
  level?: 'global' | 'component';
  fallback?: ReactNode;
  withAsync?: boolean;
  onError?: (error: Error | AppError) => void;
}

// 高階コンポーネント：エラーバウンダリでラップ
export function withErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const {
    level = 'component',
    fallback,
    withAsync = false,
    onError
  } = options;

  const WrappedComponent: React.FC<P> = (props) => {
    const handleError = (error: any) => {
      if (onError) {
        onError(error);
      }
    };

    if (withAsync) {
      return (
        <ErrorBoundary
          level={level}
          fallback={fallback}
          onError={handleError}
        >
          <AsyncErrorBoundary onError={handleError}>
            <Component {...props} />
          </AsyncErrorBoundary>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary
        level={level}
        fallback={fallback}
        onError={handleError}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  // デバッグ用にコンポーネント名を設定
  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

// 特定用途向けのプリセット
export const withGlobalErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  onError?: (error: Error) => void
) => withErrorBoundary(Component, { 
  level: 'global', 
  onError 
});

export const withAsyncErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  onError?: (error: AppError) => void
) => withErrorBoundary(Component, { 
  withAsync: true, 
  onError 
});

export const withComponentErrorBoundary = <P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) => withErrorBoundary(Component, { 
  level: 'component', 
  fallback 
});

// カスタムフォールバックコンポーネント用のファクトリー
export const createCustomFallback = (
  title: string,
  message: string,
  emoji: string = '⚠️'
): ReactNode => (
  <div style={{
    background: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    borderRadius: '8px',
    padding: '20px',
    margin: '10px 0',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>{emoji}</div>
    <h3 style={{ color: '#ff6b6b', marginBottom: '10px' }}>{title}</h3>
    <p style={{ color: '#666' }}>{message}</p>
  </div>
);

// 使用例のためのデコレーター関数
export const ErrorBoundaryDecorator = (options: WithErrorBoundaryOptions = {}) => 
  <P extends object>(target: ComponentType<P>) => 
    withErrorBoundary(target, options);