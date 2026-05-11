import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
          <p className="mt-4 text-[var(--muted-foreground)]">验证身份中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    );
  }

  if (allowedRoles.length > 0 && user?.role && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
            权限不足
          </h1>

          <p className="text-[var(--muted-foreground)] mb-6">
            您没有访问此页面的权限。如需帮助，请联系管理员。
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              返回上一页
            </button>

            <a
              href="/"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
            >
              返回首页
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}


interface CompanyRouteProps {
  children: ReactNode;
}

export function CompanyRoute({ children }: CompanyRouteProps) {
  return (
    <ProtectedRoute allowedRoles={['company', 'admin']}>
      {children}
    </ProtectedRoute>
  );
}


interface EmployeeRouteProps {
  children: ReactNode;
}

export function EmployeeRoute({ children }: EmployeeRouteProps) {
  return (
    <ProtectedRoute allowedRoles={['employee', 'admin', 'company']}>
      {children}
    </ProtectedRoute>
  );
}


interface PublicOnlyRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

export function PublicOnlyRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: PublicOnlyRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
