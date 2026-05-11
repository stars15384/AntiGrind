import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingContextType {
  isLoading: boolean;
  loadingCount: number;
  setLoading: (loading: boolean) => void;
  withLoading: <T>(promise: Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const isLoading = loadingCount > 0;

  const setLoading = useCallback((loading: boolean) => {
    setLoadingCount(prev => prev + (loading ? 1 : -1));
  }, []);

  const withLoading = useCallback(async <T>(promise: Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      const result = await promise;
      return result;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, loadingCount, setLoading, withLoading }}>
      {children}
      {isLoading && <GlobalLoadingIndicator />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}


function GlobalLoadingIndicator() {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl shadow-2xl p-6 flex items-center gap-3 animate-fade-in">
        <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
        <span className="text-[var(--foreground)] font-medium">加载中...</span>
      </div>
    </div>
  );
}


interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function PageLoader({ 
  message = '加载中...', 
  fullScreen = false 
}: PageLoaderProps) {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto" />
          <p className="text-[var(--muted-foreground)]">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto" />
        <p className="text-sm text-[var(--muted-foreground)]">{message}</p>
      </div>
    </div>
  );
}


interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";

  const variantClasses = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
