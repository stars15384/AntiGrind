import { Link } from "react-router";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Search, TrendingUp, Award, Building2, User, LogOut, Users, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { companiesApi } from "../../api/companies";
import { useAuth } from "../../contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getCompanyName } from "../../utils/i18n";
import type { CompanyResponse } from "../../types";

export function HomePage() {
  const { t, i18n } = useTranslation();
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 排序状态
  const [sortBy, setSortBy] = useState<string>('agi_score');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    loadCompanies();
  }, [sortBy, sortOrder]);

  async function loadCompanies() {
    try {
      setLoading(true);
      const data = await companiesApi.list({
        limit: 10,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setCompanies(data);
    } catch (error) {
      console.error("Failed to load companies:", error);
    } finally {
      setLoading(false);
    }
  }

  // 切换排序顺序
  function toggleSortOrder() {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = '/search?q=' + encodeURIComponent(searchQuery);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-[var(--primary)]" />
            <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl text-[var(--primary)]">{t('app.title')}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/scan" className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
              {t('nav.scan')}
            </Link>

            {/* 双轨认证入口 */}
            <div className="relative group">
              <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity flex items-center gap-2">
                {t('home.certification_btn')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-[var(--border)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-3">
                  <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2 px-3">{t('home.two_methods')}</p>

                  <Link
                    to={isAuthenticated ? "/apply" : "/login?redirect=/apply"}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{t('home.as_employee')}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{t('home.as_employee_desc')}</div>
                    </div>
                  </Link>

                  <Link
                    to={isAuthenticated ? "/apply" : "/login?redirect=/apply"}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors mt-1"
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{t('home.as_company')}</div>
                      <div className="text-xs text-[var(--muted-foreground)]">{t('home.as_company_desc')}</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[var(--primary)]" />
                  <span className="font-medium">{user?.username}</span>
                  {user?.role && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      user.role === 'employee'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role === 'employee' ? t('home.role_employee') : t('home.role_company')}
                    </span>
                  )}
                </div>
                <Link
                  to={user?.role === 'employee' ? '/checkin' : '/dashboard'}
                  className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors"
                >
                  {user?.role === 'employee' ? t('home.upload_action') : t('home.dashboard_action')}
                </Link>
                <button
                  onClick={logout}
                  className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition-colors">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity">
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-[var(--primary)] to-[#156B5F] text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-5xl mb-6">{t('home.welcome')}</h2>
          <p className="text-xl opacity-90 mb-8">{t('home.tagline')}</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder={t('home.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-[var(--foreground)] shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl text-[var(--foreground)] mb-2">{t('home.ranking_title')}</h3>
            <p className="text-[var(--muted-foreground)]">{t('home.ranking_subtitle')}</p>
          </div>

          {/* 排序控制区域 */}
          <div className="flex items-center gap-4">
            {/* 排序字段选择 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent cursor-pointer hover:border-[var(--primary)]/50 transition-all"
            >
              <option value="agi_score">{t('home.sort_by_agi')}</option>
              <option value="employee_count">{t('home.sort_by_employees')}</option>
              <option value="created_at">{t('home.sort_by_time')}</option>
              <option value="verification_status">{t('home.sort_by_status')}</option>
            </select>

            {/* 排序顺序切换按钮 */}
            <button
              onClick={toggleSortOrder}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-white hover:bg-[var(--muted)] transition-colors flex items-center gap-2"
              title={sortOrder === 'desc' ? t('home.descending') : t('home.ascending')}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="w-4 h-4" />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>

            <TrendingUp className="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--muted-foreground)]">{t('common.loading')}</div>
        ) : (
          <div className="grid gap-4">
            {companies.map((company, idx) => (
              <Link
                key={company.id}
                to={`/company/${company.id}`}
                className="bg-white rounded-xl p-6 border border-[var(--border)] hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-mono font-bold ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-[var(--muted)] text-[var(--muted-foreground)]'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h4 className="text-xl font-medium group-hover:text-[var(--primary)] transition-colors">{getCompanyName(company, i18n.language)}</h4>
                      {company.industry && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {t(`company.industries.${company.industry}`)}
                        </span>
                      )}
                      <span className="text-sm text-[var(--muted-foreground)]">{company.verification_status}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
                      <span>{t('home.created_at')}{new Date(company.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontFamily: 'var(--font-mono)' }} className={`text-5xl font-bold mb-1 ${
                      (company.agi_score || 0) >= 90 ? 'text-[var(--primary)]' :
                      (company.agi_score || 0) >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {company.agi_score || '--'}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">{t('home.anti_grind_index')}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl text-center mb-12">{t('home.stats_title')}</h3>
          {loading ? (
            <div className="text-center text-[var(--muted-foreground)]">{t('common.loading')}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-[var(--cream)] rounded-xl">
                <div style={{ fontFamily: 'var(--font-mono)' }} className="text-5xl font-bold text-[var(--primary)] mb-2">
                  {companies.length}
                </div>
                <p className="text-[var(--muted-foreground)]">{t('home.registered_companies')}</p>
              </div>
              <div className="text-center p-8 bg-green-50 rounded-xl">
                <div style={{ fontFamily: 'var(--font-mono)' }} className="text-5xl font-bold text-green-600 mb-2">
                  {companies.filter(c => c.verification_status === 'verified').length}
                </div>
                <p className="text-[var(--muted-foreground)]">{t('home.verified_companies_count')}</p>
              </div>
              <div className="text-center p-8 bg-blue-50 rounded-xl">
                <div style={{ fontFamily: 'var(--font-mono)' }} className="text-5xl font-bold text-blue-600 mb-2">
                  {companies.length > 0
                    ? (companies.reduce((sum, c) => sum + (c.agi_score || 0), 0) / companies.length).toFixed(1)
                    : '--'}
                </div>
                <p className="text-[var(--muted-foreground)]">{t('home.avg_agi_score')}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {!loading && companies.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-8">{t('home.recently_verified')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.slice(0, 3).map((company) => (
              <Link
                key={company.id}
                to={`/company/${company.id}`}
                className="bg-white rounded-xl p-6 border border-[var(--border)] hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{getCompanyName(company, i18n.language)}</h4>
                    <p className="text-sm text-[var(--muted-foreground)]">{company.verification_status}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <span className="text-sm text-[var(--muted-foreground)]">{new Date(company.created_at).toLocaleDateString()}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }} className="text-2xl font-bold text-[var(--primary)]">
                    {company.agi_score || '--'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
