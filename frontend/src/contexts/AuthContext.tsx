import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, captchaCode?: string, captchaSessionId?: string) => Promise<void>;
  register: (username: string, email: string, password: string, captchaCode?: string, captchaSessionId?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }

  async function login(username: string, password: string, captchaCode?: string, captchaSessionId?: string) {
    await authApi.login({ username, password, captcha_code: captchaCode, captcha_session_id: captchaSessionId });
    const userData = await authApi.getProfile();
    setUser(userData);
  }

  async function register(username: string, email: string, password: string, captchaCode?: string, captchaSessionId?: string) {
    await authApi.register({ username, email, password, captcha_code: captchaCode, captcha_session_id: captchaSessionId });
  }

  function logout() {
    authApi.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
