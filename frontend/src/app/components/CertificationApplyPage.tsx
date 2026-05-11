import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Award, Users, Building2, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import type { UserRole } from "../../types";

export function CertificationApplyPage() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();

  // 检查登录状态
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('cert_apply.login_required')}</h2>
          <p className="text-[var(--muted-foreground)] mb-6">{t('cert_apply.login_required_desc')}</p>
          <Link to="/login" className="px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity inline-block">
            {t('cert_apply.go_login')}
          </Link>
        </div>
      </div>
    );
  }

  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  
  // 公司邮箱验证字段
  const [companyEmailDomain, setCompanyEmailDomain] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");

  // 公司特有字段
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 验证邮箱域名是否匹配公司域名
  function validateCompanyEmail(): boolean {
    if (!companyEmail || !companyEmailDomain) return false;
    return companyEmail.endsWith('@' + companyEmailDomain.toLowerCase());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 验证公司邮箱域名
    if (!companyEmailDomain.trim()) {
      setError(t('register.error_domain_empty'));
      return;
    }

    // 验证邮箱必须匹配公司域名
    if (!validateCompanyEmail()) {
      setError(t('register.error_email_mismatch', { domain: companyEmailDomain }));
      return;
    }

    // 公司角色额外验证：需要填写公司名称
    if (selectedRole === 'company' && !companyName.trim()) {
      setError(t('register.error_company_name_empty'));
      return;
    }

    // 公司角色额外验证：需要选择行业分类
    if (selectedRole === 'company' && !industry.trim()) {
      setError(t('company.industry') + ' ' + t('company.industry_required'));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // TODO: 调用后端API提交认证申请
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 更新用户信息（模拟）
      await updateUser({
        ...user,
        role: selectedRole,
        company_email_domain: companyEmailDomain,
        company_email: companyEmail,
        company_name: companyName || undefined,
        industry: industry || undefined,
      });

      setSuccess(true);

    } catch (err) {
      setError(err instanceof Error ? err.message : t('cert.apply_failed'));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl mb-4">{t('cert_apply.success_title')}</h2>
          <p className="text-[var(--muted-foreground)] mb-8">{t('cert_apply.success_desc')}</p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm"><strong>{t('register.email_label')}:</strong> {companyEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm"><strong>{t('auth.role')}:</strong> {selectedRole === 'employee' ? t('home.role_employee') : t('home.role_company')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              to={selectedRole === 'employee' ? '/checkin' : '/dashboard'}
              className="block w-full py-3 bg-[var(--primary)] text-white text-center rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              {selectedRole === 'employee' ? t('home.upload_action') : t('home.dashboard_action')}
            </Link>
            <Link
              to="/"
              className="block w-full py-3 border border-[var(--border)] text-center rounded-xl font-medium hover:bg-[var(--muted)] transition-colors"
            >
              {t('nav.home')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <Award className="w-10 h-10 text-[var(--primary)]" />
            <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl text-[var(--primary)] group-hover:opacity-80 transition-opacity">{t('app.title')}</h1>
          </Link>
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('cert_apply.title')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('cert_apply.subtitle', { username: user.username })}</p>
        </div>

        {/* 角色选择 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setSelectedRole('employee')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'employee'
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
            }`}
          >
            <Users className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'employee' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
            <div className={`font-medium ${selectedRole === 'employee' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
              {t('auth.employee_label')}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{t('auth.employee_desc')}</p>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('company')}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedRole === 'company'
                ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                : 'border-[var(--border)] hover:border-[var(--primary)]/50'
            }`}
          >
            <Building2 className={`w-8 h-8 mx-auto mb-2 ${selectedRole === 'company' ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`} />
            <div className={`font-medium ${selectedRole === 'company' ? 'text-[var(--primary)]' : 'text-[var(--foreground)]'}`}>
              {t('auth.company_label')}
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{t('auth.company_desc')}</p>
          </button>
        </div>

        {/* 重要提示 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              {t('cert_apply.important_note')}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 当前账户信息 */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-[var(--muted-foreground)] mb-1">{t('cert_apply.current_account')}</div>
              <div className="font-medium">{user.username} ({user.email})</div>
            </div>

            {/* 公司名称（公司角色必填） */}
            {selectedRole === 'company' && (
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  {t('register.company_name_label')} <span className="text-red-500">{t('register.company_name_required')}</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('register.company_name_placeholder')}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {t('register.company_name_hint')}
                </p>
              </div>
            )}

            {/* 行业分类（公司角色必填） */}
            {selectedRole === 'company' && (
              <div>
                <label htmlFor="industry-select" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  {t('company.industry')} <span className="text-red-500">{t('company.industry_required')}</span>
                </label>
                <select
                  id="industry-select"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder={t('company.industry_placeholder')}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  disabled={loading}
                >
                  <option value="">{t('company.industry_placeholder')}</option>
                  <option value="A">{t('company.industries.A')}</option>
                  <option value="B">{t('company.industries.B')}</option>
                  <option value="C">{t('company.industries.C')}</option>
                  <option value="D">{t('company.industries.D')}</option>
                  <option value="E">{t('company.industries.E')}</option>
                  <option value="F">{t('company.industries.F')}</option>
                  <option value="G">{t('company.industries.G')}</option>
                  <option value="H">{t('company.industries.H')}</option>
                  <option value="I">{t('company.industries.I')}</option>
                  <option value="J">{t('company.industries.J')}</option>
                  <option value="K">{t('company.industries.K')}</option>
                  <option value="L">{t('company.industries.L')}</option>
                  <option value="M">{t('company.industries.M')}</option>
                  <option value="N">{t('company.industries.N')}</option>
                  <option value="O">{t('company.industries.O')}</option>
                  <option value="P">{t('company.industries.P')}</option>
                  <option value="Q">{t('company.industries.Q')}</option>
                  <option value="R">{t('company.industries.R')}</option>
                  <option value="S">{t('company.industries.S')}</option>
                  <option value="T">{t('company.industries.T')}</option>
                </select>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {t('company.industry_hint')}
                </p>
              </div>
            )}

            {/* 公司邮箱域名 */}
            <div>
              <label htmlFor="company-domain" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('register.domain_label')} <span className="text-red-500">{t('register.domain_required')}</span>
              </label>
              <input
                id="company-domain"
                type="text"
                value={companyEmailDomain}
                onChange={(e) => setCompanyEmailDomain(e.target.value.toLowerCase().replace('@', ''))}
                placeholder={t('register.domain_placeholder')}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {t('register.domain_hint')}
              </p>
            </div>

            {/* 公司邮箱地址 */}
            <div>
              <label htmlFor="verify-email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('register.email_label')} <span className="text-red-500">{t('register.email_required')}</span>
              </label>
              <input
                id="verify-email"
                type="email"
                value={companyEmail}
                onChange={(e) => setCompanyEmail(e.target.value)}
                placeholder={`your.name@${companyEmailDomain || 'company.com'}`}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                disabled={loading}
              />

              {/* 实时验证状态 */}
              {companyEmail && companyEmailDomain && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${
                  validateCompanyEmail() ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {validateCompanyEmail() ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{t('register.email_match_success', { domain: companyEmailDomain })}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      <span>{t('register.email_match_warning', { domain: companyEmailDomain })}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('cert_apply.submitting')}
                </>
              ) : (
                selectedRole === 'employee' 
                  ? t('cert_apply.submit_employee')
                  : t('cert_apply.submit_company')
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[var(--muted-foreground)]">
          <Link to="/" className="hover:underline">
            {t('company.back_to_home')}
          </Link>
        </p>
      </div>
    </div>
  );
}
