import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-sm font-medium"
      title={i18n.language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Globe className="w-4 h-4" />
      <span>{i18n.language === 'zh' ? 'EN' : '中'}</span>
    </button>
  );
}
