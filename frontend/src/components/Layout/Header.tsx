import { useTranslation } from 'react-i18next';
import { Sun, Moon, Globe, LogOut, Bell } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import './Header.css';

export default function Header() {
  const { t, i18n } = useTranslation();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const logout = useAuthStore((state) => state.logout);

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    setLanguage(newLang as 'en' | 'ru');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{t('common.welcome')}</h1>
      </div>

      <div className="header-right">
        <button className="icon-button" title={t('language.toggle')} onClick={handleLanguageToggle}>
          <Globe size={20} />
          <span className="button-label">{i18n.language.toUpperCase()}</span>
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
