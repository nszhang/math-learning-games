'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    console.error('🚨 ErrorBoundary: Error caught in getDerivedStateFromError:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 ErrorBoundary: Error caught in componentDidCatch:', error);
    console.error('🚨 ErrorBoundary: Error info:', errorInfo);
    console.error('🚨 ErrorBoundary: Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      console.error('🚨 ErrorBoundary: Rendering error UI');
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">Something went wrong</h1>
              <p className="text-gray-600">The application encountered an error and couldn't continue.</p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Error Details:</h3>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Error:</strong> {this.state.error?.message || 'Unknown error'}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Stack:</strong>
              </p>
              <pre className="text-xs text-gray-600 bg-white p-2 rounded mt-2 overflow-auto max-h-32">
                {this.state.error?.stack || 'No stack trace available'}
              </pre>
            </div>

            {this.state.errorInfo && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Component Stack:</h3>
                <pre className="text-xs text-gray-600 bg-white p-2 rounded overflow-auto max-h-32">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  console.log('🔄 ErrorBoundary: Reloading page');
                  window.location.reload();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  console.log('🏠 ErrorBoundary: Going to home');
                  window.location.href = '/';
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
