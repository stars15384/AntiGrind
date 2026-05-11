import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (process.env.NODE_ENV === 'production') {
      // 在生产环境可以上报错误到监控服务
      // reportErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              出了点问题
            </h1>

            <p className="text-gray-600 mb-2">
              应用程序遇到了意外错误
            </p>

            {this.state.error && process.env.NODE_ENV !== 'production' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-medium text-red-800 mb-1">
                  错误详情（仅开发环境显示）:
                </p>
                <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                重试
              </button>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                返回首页
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-500">
              如果问题持续存在，请{' '}
              <a
                href="mailto:support@antigrind.com"
                className="text-[var(--primary)] underline hover:no-underline"
              >
                联系我们
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


interface AsyncErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function AsyncErrorFallback({ error, resetError }: AsyncErrorFallbackProps) {
  return (
    <div role="alert" className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            加载失败
          </h3>
          <p className="text-red-700 mb-4 text-sm">
            {error.message || '页面加载时发生错误'}
          </p>
          <button
            onClick={resetError}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            重新加载
          </button>
        </div>
      </div>
    </div>
  );
}
