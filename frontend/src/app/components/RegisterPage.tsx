import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Loader2, Award, Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CaptchaInput } from "./CaptchaInput";

export function RegisterPage() {
  const { t } = useTranslation();

  // 基础注册字段
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // 验证码字段
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaSessionId, setCaptchaSessionId] = useState("");
  const [captchaError, setCaptchaError] = useState<string | undefined>();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!username.trim()) {
      setError(t('register.error_username_empty'));
      return;
    }

    if (!email.trim()) {
      setError(t('register.error_email_empty'));
      return;
    }

    if (!password.trim()) {
      setError(t('register.error_password_empty'));
      return;
    }

    if (password.length < 6) {
      setError(t('register.error_password_length'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('register.error_password_mismatch'));
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

      await register(username, email, password, captchaCode, captchaSessionId);

      navigate("/login?registered=true");

    } catch (err: any) {
      const message = err?.message || err || t('register.register_failed');
      
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
          <h2 style={{ fontFamily: 'var(--font-serif)' }} className="text-2xl mb-2">{t('register.title')}</h2>
          <p className="text-[var(--muted-foreground)]">{t('register.subtitle_simple')}</p>
        </div>

        {/* 提示信息 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              {t('register.simple_note')}
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

            {/* 用户名 */}
            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('register.username_label')}
              </label>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('register.username_placeholder')}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('register.email_label')} <span className="text-red-500">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('register.email_placeholder')}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* 密码 */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('register.password_label')}
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('register.password_placeholder')}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>
            </div>

            {/* 确认密码 */}
            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-[var(--foreground)] mb-2">
                {t('register.confirm_password_label')}
              </label>
              <input
                id="reg-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('register.confirm_password_placeholder')}
                className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
                disabled={loading}
              />
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

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('register.registering')}
                </>
              ) : (
                t('register.register_btn')
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-[var(--muted-foreground)]">
          {t('register.has_account')}{' '}
          <Link to="/login" className="text-[var(--primary)] font-medium hover:underline">
            {t('register.login_here')}
          </Link>
        </p>
      </div>
    </div>
  );
}
