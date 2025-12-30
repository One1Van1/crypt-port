import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, LogOut, Bell, Clock } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import './Header.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const timeFormat = useAppStore((state) => state.timeFormat);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleTimeFormat = useAppStore((state) => state.toggleTimeFormat);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const logout = useAuthStore((state) => state.logout);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    setLanguage(newLang as 'en' | 'ru');
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <span className="logo-part">crypt</span>
          <svg className="logo-bubble" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="49" cy="59" r="28" fill="currentColor"/>
            <path d="M 50 30 L 87 84 L 50 82 Z" fill="currentColor"/>
            <circle cx="49" cy="59" r="10" fill="var(--bg-secondary)"/>
          </svg>
          <span className="logo-part">port</span>
        </div>
      </div>

      <div className="header-right">
        <button className="icon-button" title={t('language.toggle')} onClick={handleLanguageToggle}>
          <Globe size={20} />
          <span className="button-label">{i18n.language.toUpperCase()}</span>
        </button>

        <button className="icon-button" title={t('timeFormat.toggle')} onClick={toggleTimeFormat}>
          <Clock size={20} />
          <span className="button-label">{timeFormat === '24h' ? '24' : '12'}</span>
        </button>

        <button className="icon-button" title={t('theme.toggle')} onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="icon-button">
          <Bell size={20} />
        </button>

        <button className="icon-button" title={t('auth.logout')} onClick={logout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
