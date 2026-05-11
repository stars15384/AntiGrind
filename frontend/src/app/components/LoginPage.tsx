import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Award, Users, Building2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CaptchaInput } from "./CaptchaInput";
import type { UserRole } from "../../types";

export function LoginPage() {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  
  // 验证码字段
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [captchaError, setCaptchaError] = useState<string | undefined>();

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      setError(t('auth.enter_username'));
      return;
    }

    if (!password.trim()) {
      setError(t('auth.enter_password'));
      return;
    }

    if (!captchaCode.trim()) {
      setCaptchaError(t('captcha.error_incorrect') || '请输入验证码');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCaptchaError(undefined);
      
      await login(username, password, captchaCode, captchaSessionId);

      if (redirectTo) {
        navigate(redirectTo);
      } else if (selectedRole === 'employee') {
        navigate("/checkin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const message = err?.message || err || t('auth.login_failed');
      
      if (typeof message === 'string' && (message.includes('验证码') || message.includes('captcha'))) {
        setCaptchaError(message);
        setCaptchaCode('');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
            <Award className="w-10 h-10 text-[var(--primary)]" />
            <h1 style={{ fontFamily: 'var(--font-serif)' }} className="text-3xl text-[var(--primary)] group-hover:opacity-80 transition-opacity">{t('app.title')}</h1>
          </Link>
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('auth.welcome_back')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('auth.company_email_login')}</p>
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

        <div className="bg-white rounded-2xl p-8 border border-[var(--border)] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('auth.username_label')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={selectedRole === 'employee' ? t('auth.username_placeholder_employee') : t('auth.username_placeholder_company')}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('auth.password_label')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 验证码 */}
            <CaptchaInput
              value={captchaCode}
              onChange={(value, sessionId) => {
                setCaptchaCode(value);
                if (sessionId) setCaptchaSessionId(sessionId);
                if (captchaError) setCaptchaError(undefined);
              }}
              error={captchaError}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('auth.logging_in')}
                </>
              ) : (
                t('auth.login_as_role', { role: selectedRole === 'employee' ? t('auth.role_employee') : t('auth.role_company') })
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
            {t('auth.no_account')}
            <Link to="/register" className="text-[var(--primary)] hover:underline font-medium ml-1">
              {t('auth.register_now')}
            </Link>
          </div>
        </div>

        {/* 认证流程说明 */}
        <div className="mt-6 p-6 bg-[var(--muted)]/30 rounded-xl border border-[var(--border)]">
          <h3 className="font-medium text-[var(--foreground)] mb-3 text-center">
            {selectedRole === 'employee' ? t('auth.employee_process_title') : t('auth.company_process_title')}
          </h3>
          
          {selectedRole === 'employee' ? (
            <ol className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li dangerouslySetInnerHTML={{ __html: t('auth.emp_step_1') }}></li>
              <li dangerouslySetInnerHTML={{ __html: t('auth.emp_step_2') }}></li>
              <li dangerouslySetInnerHTML={{ __html: t('auth.emp_step_3') }}></li>
              <li dangerouslySetInnerHTML={{ __html: t('auth.emp_step_4') }}></li>
            </ol>
          ) : (
            <ol className="space-y-2 text-sm text-[var(--muted-foreground)]">
              <li dangerouslySetInnerHTML={{ __html: t('auth.comp_step_1') }}></li>
              <li dangerouslySetInnerHTML={{ __html: t('auth.comp_step_2') }}></li>
              <li dangerouslySetInnerHTML={{ __html: t('auth.comp_step_3') }}></li>
              <li dangerouslySetInnerHTML={{ __html: t('auth.comp_step_4') }}></li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
