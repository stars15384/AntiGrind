import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  BarChart3,
  Settings,
  FileText,
  Menu,
  X,
  LogOut,
  Bell,
  Shield,
  ChevronRight,
  Home,
} from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface SidebarItem {
  key: string;
  icon: React.ReactNode;
  labelKey: string;
  labelDefault: string; // 默认文本
  path: string;
}

export function AdminLayout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEn = i18n.language === 'en';

  const sidebarItems: SidebarItem[] = [
    {
      key: 'dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      labelKey: 'admin.sidebar.dashboard',
      labelDefault: isEn ? 'Dashboard' : '仪表板',
      path: '/admin',
    },
    {
      key: 'users',
      icon: <Users className="w-5 h-5" />,
      labelKey: 'admin.sidebar.users',
      labelDefault: isEn ? 'User Management' : '用户管理',
      path: '/admin/users',
    },
    {
      key: 'companies',
      icon: <Building2 className="w-5 h-5" />,
      labelKey: 'admin.sidebar.companies',
      labelDefault: isEn ? 'Company Management' : '公司管理',
      path: '/admin/companies',
    },
    {
      key: 'certifications',
      icon: <ClipboardCheck className="w-5 h-5" />,
      labelKey: 'admin.sidebar.certifications',
      labelDefault: isEn ? 'Certification Review' : '认证审核',
      path: '/admin/certifications',
    },
    {
      key: 'analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      labelKey: 'admin.sidebar.analytics',
      labelDefault: isEn ? 'Analytics' : '数据分析',
      path: '/admin/analytics',
    },
    {
      key: 'settings',
      icon: <Settings className="w-5 h-5" />,
      labelKey: 'admin.sidebar.settings',
      labelDefault: isEn ? 'Settings' : '系统设置',
      path: '/admin/settings',
    },
    {
      key: 'logs',
      icon: <FileText className="w-5 h-5" />,
      labelKey: 'admin.sidebar.logs',
      labelDefault: isEn ? 'Operation Logs' : '操作日志',
      path: '/admin/logs',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/');
  };

  const getLabel = (item: SidebarItem) => {
    const translated = t(item.labelKey);
    return translated !== item.labelKey ? translated : item.labelDefault;
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[var(--border)] transform transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${!sidebarOpen ? 'lg:w-20' : ''}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border)] bg-gradient-to-r from-[var(--primary)] to-blue-600">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-lg font-bold text-white">{isEn ? 'Admin Panel' : '管理面板'}</span>
            </div>
          ) : (
            <Shield className="w-8 h-8 text-white mx-auto" />
          )}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive(item.path)
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className={`transition-colors ${
                isActive(item.path) ? 'text-[var(--primary)]' : 'text-gray-400 group-hover:text-gray-600'
              }`}>
                {item.icon}
              </span>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm">{getLabel(item)}</span>
                  {isActive(item.path) && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Back to Home */}
        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all"
          >
            <Home className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">{isEn ? 'Back to Home' : '返回首页'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:min-w-0">
        {/* Top Header - Match user-facing style */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-30 shadow-sm">
          <div className="h-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Desktop collapse button */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden lg:flex text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {/* Page title breadcrumb */}
              <div className="hidden sm:block">
                <h2 className="text-base font-semibold text-gray-800">
                  {getLabel(sidebarItems.find(item => isActive(item.path)) || sidebarItems[0])}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User info & logout */}
              <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
                <div className="hidden md:flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">A</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-800 leading-tight">{isEn ? 'Admin' : '管理员'}</p>
                    <p className="text-xs text-gray-500">{isEn ? 'Super Admin' : '超级管理员'}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={isEn ? 'Logout' : '退出登录'}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
