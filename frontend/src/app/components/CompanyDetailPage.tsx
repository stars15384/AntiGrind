import { Link, useParams, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import i18n from "../../i18n";
import { ArrowLeft, Award, Users, Calendar, TrendingUp, Clock, Heart, Loader2, AlertCircle, Home, Search } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { companiesApi } from "../../api/companies";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CompanyCharts } from "./CompanyCharts";
import { getCompanyName, getTermTranslation } from "../../utils/i18n";
import type { CompanyDetail } from "../../types";

export function CompanyDetailPage() {
  const t = (key: string, opts?: any) => i18n.t(key, opts) || key;
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCompany(id);
    }
  }, [id]);

  async function loadCompany(companyId: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await companiesApi.getById(companyId);
      setCompany(data);
    } catch (err) {
      console.error("Failed to load company:", err);
      setError(err instanceof Error ? err.message : t('company.error_message'));
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
        <span className="ml-3 text-[var(--muted-foreground)]">{t('common.loading')}</span>
      </div>
    );
  }

  // 错误状态：显示友好的错误提示
  if (!company || error) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <LanguageSwitcher />
            <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">{t('company.detail')}</h1>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-4 text-[var(--foreground)]">
              {t('company.not_found')}
            </h2>

            <p className="text-lg text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
              {error || `${t('company.not_found')} ID: "${id}"`}
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <Link
                to="/"
                className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                {t('company.back_to_home')}
              </Link>

              <Link
                to="/search"
                className="px-6 py-3 border border-[var(--border)] rounded-xl font-medium hover:bg-[var(--muted)] transition-colors inline-flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                {t('company.search_company')}
              </Link>
            </div>

            {/* 推荐操作 */}
            <div className="bg-white rounded-2xl p-8 border border-[var(--border)] text-left">
              <h3 className="font-medium text-lg mb-4 text-[var(--foreground)]">{t('company.try_options')}</h3>
              <ul className="space-y-3 text-sm text-[var(--muted-foreground)]">
                <li className="flex items-start gap-3">
                  <span className="text-[var(--primary)] font-bold">1.</span>
                  <span>{t('company.option1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--primary)] font-bold">2.</span>
                  <span>{t('company.option2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[var(--primary)] font-bold">3.</span>
                  <span>{t('company.option3')}</span>
                </li>
              </ul>
            </div>

            {/* 技术信息 */}
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
                {t('company.tech_details')}
              </summary>
              <pre className="mt-2 p-4 bg-[var(--muted)] rounded-lg text-xs overflow-auto">
                {`${t('company.request_id')}: ${id}\n${t('company.error_message')}: ${error || '404 Not Found'}`}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  const score = company.agi_score || 0;
  const circumference = 2 * Math.PI * 80;
  const progress = (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <nav className="border-b border-[var(--border)] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <LanguageSwitcher />
          <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-xl">{t('company.detail')}</h1>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl p-8 border border-[var(--border)] mb-8">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[#156B5F] flex items-center justify-center">
              <Award className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-4xl mb-3">{getCompanyName(company, i18n.language)}</h2>
              <div className="flex items-center gap-6 text-[var(--muted-foreground)]">
                {company.industry && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                    {t(`company.industries.${company.industry}`)}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{company.verification_status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(company.created_at).toLocaleDateString()}</span>
                </div>
                {company.description && (
                  <span>{company.description}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-1 bg-white rounded-2xl p-8 border border-[var(--border)] flex flex-col items-center justify-center">
            <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-8 text-center">{t('home.anti_grind_index')}</h3>
            <div className="relative w-48 h-48 mb-4">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="var(--muted)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="var(--primary)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - progress}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div style={{ fontFamily: 'var(--font-mono)' }} className="text-6xl font-bold text-[var(--primary)]">
                  {score || '--'}
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">/ 100</div>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-medium">
              <Award className="w-4 h-4" />
              <span>{company.verification_status === 'verified' ? t('company.certified_status') : t('company.pending_status')}</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl p-8 border border-[var(--border)]">
            <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-8">{t('company.work_hours')}</h3>
            {company.work_hour_records.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  {t('company.verified_count', { count: company.work_hour_records.length })}
                </p>
                {company.work_hour_records.slice(0, 3).map((record) => (
                  <div key={record.id} className="p-4 bg-[var(--muted)]/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{t('company.weekly_hours_label')}: {record.weekly_hours}{t('company.hours_unit')}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        record.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {t('company.weekend_policy')}: {getTermTranslation(record.weekend_policy, 'weekend_policy', i18n.language)} | {t('company.overtime_compensation')}: {getTermTranslation(record.overtime_compensation, 'overtime_compensation', i18n.language)}
                    </div>
                    <div className="text-sm text-[var(--muted-foreground)]">
                      {t('company.verification_count')}: {record.verification_count}/5
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--muted-foreground)]">{t('company.no_records')}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[var(--border)]">
          <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-8 text-center">{t('company.multi_dimension_eval')}</h3>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={[
              { metric: t('company.metric_work_hours'), value: score, fullMark: 100 },
              { metric: t('company.metric_overtime_freq'), value: Math.max(0, score - 5), fullMark: 100 },
              { metric: t('company.metric_vacation_guarantee'), value: Math.min(100, score + 5), fullMark: 100 },
              { metric: t('company.metric_salary_transparency'), value: Math.max(0, score - 3), fullMark: 100 },
              { metric: t('company.metric_promotion_fairness'), value: Math.max(0, score - 7), fullMark: 100 },
              { metric: t('company.metric_employee_satisfaction'), value: Math.min(100, score + 3), fullMark: 100 },
            ]}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--foreground)', fontSize: 14 }} />
              <Radar
                name={t('company.score_label')}
                dataKey="value"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <CompanyCharts workHourRecords={company.work_hour_records} />

        <div className="mt-8 bg-gradient-to-r from-[var(--primary)] to-[#156B5F] rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('company.cert_number_label')}</h3>
              <p style={{ fontFamily: 'var(--font-mono)' }} className="text-3xl font-bold opacity-90">AIC-2026-{id?.padStart(6, '0')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75 mb-1">{t('company.created_time_label')}</p>
              <p className="text-xl font-medium">{new Date(company.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
