import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import {
  Users,
  FileCheck,
  Settings,
  BarChart3,
  Building2,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface DashboardStats {
  users: {
    total: number;
    active_7d: number;
    recent: Array<{
      id: string;
      username: string;
      email: string;
      created_at: string;
    }>;
  };
  companies: {
    total: number;
    certified: number;
  };
  certifications: {
    pending_review: number;
  };
  data: {
    work_hours_records: number;
    evidences: number;
    screenshots: number;
    qa_entries: number;
  };
  agi_stats: {
    average_score: number;
  };
}

export function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isEn = i18n.language === 'en';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-6 h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-7 h-7 text-[var(--primary)]" />
            {isEn ? 'Welcome back, Administrator' : '欢迎回来，管理员'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{isEn ? 'Platform operations overview' : '平台运营数据总览'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +12.5%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.users.total || 0}</h3>
          <p className="text-sm text-gray-500 mt-1">{isEn ? 'Total Users' : '总用户数'}</p>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-green-50 group-hover:bg-green-100 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +8.2%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.users.active_7d || 0}</h3>
          <p className="text-sm text-gray-500 mt-1">{isEn ? 'Active Users (7D)' : '7日活跃用户'}</p>
        </div>

        {/* Companies */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              +15.3%
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.companies.total || 0}</h3>
          <p className="text-sm text-gray-500 mt-1">{isEn ? 'Registered Companies' : '注册企业数'}</p>
        </div>

        {/* Pending Reviews */}
        <div className="bg-white rounded-xl border border-[var(--border)] p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors">
              <FileCheck className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              {isEn ? 'Action Needed' : '需处理'}
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats?.certifications.pending_review || 0}</h3>
          <p className="text-sm text-gray-500 mt-1">{isEn ? 'Pending Reviews' : '待审核认证'}</p>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--primary)]" />
            {isEn ? 'Quick Actions' : '快捷操作'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/admin/certifications')}
              className="p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group"
            >
              <FileCheck className="w-8 h-8 mx-auto mb-2 text-[var(--primary)] group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{isEn ? 'Review Certifications' : '审核认证申请'}</p>
            </button>

            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 rounded-xl border border-[var(--border)] hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{isEn ? 'Manage Users' : '管理用户'}</p>
            </button>

            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-4 rounded-xl border border-[var(--border)] hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{isEn ? 'View Analytics' : '查看数据分析'}</p>
            </button>

            <button
              onClick={() => navigate('/admin/settings')}
              className="p-4 rounded-xl border border-[var(--border)] hover:border-gray-400 hover:bg-gray-50 transition-all group"
            >
              <Settings className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700">{isEn ? 'System Settings' : '系统设置'}</p>
            </button>
          </div>
        </div>

        {/* AGI Score */}
        <div className="bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold opacity-90">{isEn ? 'Average AGI Score' : '平均AGI评分'}</h3>
            <BarChart3 className="w-6 h-6 opacity-80" />
          </div>
          <div className="text-4xl font-bold mb-2">
            {stats?.agi_stats.average_score?.toFixed(1) || '0.0'}
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="bg-white rounded-full h-2 transition-all" 
              style={{ width: `${Math.min((stats?.agi_stats.average_score || 0), 100)}%` }}
            />
          </div>
          <p className="text-xs opacity-80">{isEn ? 'Based on all certified companies' : '基于所有已认证企业数据'}</p>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            {isEn ? 'Recent Registrations' : '最近注册用户'}
          </h2>
        </div>
        
        <div className="divide-y divide-[var(--border)]">
          {(stats?.users.recent || []).length > 0 ? (
            stats!.users.recent.slice(0, 5).map((user) => (
              <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.username}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/admin/users')}
                  className="text-[var(--primary)] hover:text-[var(--primary)]/80"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{isEn ? 'No new registrations yet' : '暂无新用户注册'}</p>
            </div>
          )}
        </div>

        {stats?.users.recent && stats.users.recent.length > 5 && (
          <div className="p-4 border-t border-[var(--border)] text-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/users')}
            >
              {isEn ? 'View All' : '查看全部'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
