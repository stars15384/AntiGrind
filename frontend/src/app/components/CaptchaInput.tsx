import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';

interface CaptchaInputProps {
  value: string;
  onChange: (value: string, sessionId?: string) => void;
  error?: string;
}

export function CaptchaInput({ value, onChange, error }: CaptchaInputProps) {
  const { t } = useTranslation();
  const [image, setImage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authApi.getCaptcha();
      setImage(data.image);
      setSessionId(data.session_id);
      onChange('', data.session_id);
    } catch (err) {
      console.error('Failed to fetch captcha:', err);
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        {t('captcha.label')}
        <span className="text-red-500 ml-1">*</span>
      </label>
      
      <div className="flex gap-3 items-start">
        <div
          className={`relative flex-shrink-0 w-[120px] h-[44px] rounded-lg border overflow-hidden cursor-pointer transition-colors ${
            error ? 'border-red-300' : 'border-[var(--border)] hover:border-[var(--primary)]'
          }`}
          onClick={fetchCaptcha}
          title={t('captcha.click_to_refresh')}
        >
          {loading ? (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          ) : image ? (
            <img
              src={image}
              alt={t('captcha.label')}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">--</span>
            </div>
          )}
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fetchCaptcha();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded bg-white/80 hover:bg-white shadow-sm transition-colors"
            title={t('captcha.refresh')}
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value, sessionId)}
          placeholder={t('captcha.placeholder')}
          maxLength={4}
          autoComplete="off"
          className={`flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-colors ${
            error ? 'border-red-300 bg-red-50' : 'border-[var(--border)] bg-white'
          }`}
        />
        
        <input type="hidden" name="captcha_session_id" value={sessionId} />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      <p className="text-xs text-[var(--muted-foreground)]">
        {t('captcha.click_to_refresh')}
      </p>
    </div>
  );
}
