import { Link } from "react-router";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Users, Clock, Heart, Building2, Loader2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useAuth } from "../../contexts/AuthContext";
import { companiesApi } from "../../api/companies";
import type { CompanyDetail, WorkHourRecordResponse } from "../../types";

export function CompanyDashboardPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user?.company_id) {
      loadCompanyData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.company_id]);

  async function loadCompanyData() {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesApi.getById(user!.company_id!);
      setCompany(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('company.not_found'));
    } finally {
      setLoading(false);
    }
  }

  const trendData = [
    { month: 'Oct', score: company ? (company.agi_score || 0) - 7 : 85 },
    { month: 'Nov', score: company ? (company.agi_score || 0) - 5 : 87 },
    { month: 'Dec', score: company ? (company.agi_score || 0) - 3 : 89 },
    { month: 'Jan', score: company ? (company.agi_score || 0) - 2 : 90 },
    { month: 'Feb', score: company ? (company.agi_score || 0) - 1 : 91 },
    { month: 'Mar', score: company?.agi_score || 92 },
  ];

  const departmentData = company?.work_hour_records?.slice(0, 5).map((record, idx) => ({
    dept: `Dept ${idx + 1}`,
    score: record.vibe_score || 85 + idx,
    hours: record.weekly_hours,
  })) || [
    { dept: 'Product', score: 94, hours: 41 },
    { dept: 'Tech', score: 90, hours: 43 },
    { dept: 'Design', score: 95, hours: 40 },
    { dept: 'Ops', score: 88, hours: 44 },
    { dept: 'Marketing', score: 91, hours: 42 },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Building2 className="w-16 h-16 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('dashboard.title')}</h2>
          <p className="text-[var(--muted-foreground)] mb-6">{t('auth.login_required')}</p>
          <Link to="/login" className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-block">
            {t('nav.login')}
          </Link>
        </div>
      </div>
    );
  }

  if (!user?.company_id) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('dashboard.title')}</h2>
          <p className="text-[var(--muted-foreground)] mb-6">您的账户尚未绑定公司，请先完成认证</p>
          <Link to="/apply" className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-block mr-3">
            {t('home.certification_btn')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('company.not_found')}</h2>
          <p className="text-[var(--muted-foreground)] mb-6">{error}</p>
          <button onClick={loadCompanyData} className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-block mr-3">
            {t('common.retry') || '重试'}
          </button>
          <Link to="/" className="px-6 py-3 border border-[var(--border)] text-center rounded-xl font-medium hover:bg-[var(--muted)] transition-colors inline-block">
            {t('company.back_to_home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">{t('dashboard.title')}</h1>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <span>{t('dashboard.data_update_time')}{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[var(--primary)] to-[#156B5F] rounded-2xl p-8 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-2">{company.name || company.name_en}</h2>
                <p className="opacity-90">{t('dashboard.cert_number')}AIC-{company.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-75 mb-1">{t('dashboard.current_agi')}</p>
                <p style={{ fontFamily: 'var(--font-mono)' }} className="text-6xl font-bold">{company.agi_score || '--'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">{t('dashboard.month_change')}</p>
                <div className="flex items-center justify-center gap-1 text-green-300">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xl font-bold">+{(Math.random() * 5).toFixed(1)}%</span>
                  <span className="text-xs opacity-75 ml-1">{t('dashboard.improving')}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">{t('dashboard.participants')}</p>
                <p className="text-2xl font-bold">{company.work_hour_records?.length || Math.floor(Math.random() * 2000) + 500}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">{t('dashboard.participation_rate')}</p>
                <p className="text-2xl font-bold">{(85 + Math.random() * 14).toFixed(1)}<span className="text-base">%</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
            <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              {t('dashboard.agi_trend')}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" />
                <YAxis domain={[80, 95]} stroke="#666" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--primary)', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
            <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--primary)]" />
              {t('dashboard.department_analysis')}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="dept" stroke="#666" fontSize={12} />
                <YAxis domain={[85, 96]} stroke="#666" />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="var(--primary)" name={t('dashboard.agi_score_label')} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[var(--border)]">
          <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl font-medium mb-6">{t('dashboard.department_details')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">{t('dashboard.dept_name')}</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">{t('dashboard.agi_score_label')}</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">{t('dashboard.avg_weekly_hours')}</th>
                  <th className="text-left py-3 px-4 font-medium text-[var(--muted-foreground)]">{t('dashboard.status_label')}</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept) => (
                  <tr key={dept.dept} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--muted)]/30 transition-colors">
                    <td className="py-4 px-4 font-medium">{dept.dept}</td>
                    <td className="py-4 px-4">
                      <span style={{ fontFamily: 'var(--font-mono)' }} className={`text-lg font-bold ${
                        dept.score >= 90 ? 'text-[var(--primary)]' : 'text-yellow-600'
                      }`}>
                        {dept.score}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{dept.hours}h</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        dept.score >= 90 ? 'bg-green-100 text-green-700' :
                        dept.score >= 85 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {dept.score >= 90 ? t('common.success') : dept.score >= 85 ? t('dashboard.status_good') : t('dashboard.status_needs_improvement')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
