import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Lock, User, Shield, AlertCircle, Loader, Globe, Sun, Moon } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import './Login.css';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [error, setError] = useState('');

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    setLanguage(newLang as 'en' | 'ru');
  };

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setTempToken(data.tempToken);
      setStep('2fa');
      setError('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: authService.verify2FA,
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken, {
        id: data.userId,
        username: data.username,
        email: data.email,
        role: data.role,
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || '2FA verification failed');
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ username, password });
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    verify2FAMutation.mutate({ tempToken, code });
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <button className="icon-btn" onClick={handleLanguageToggle}>
          <Globe size={20} />
          <span>{i18n.language.toUpperCase()}</span>
        </button>
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <div className="logo-circle">
              <Shield size={32} />
            </div>
            <h1>Crypto Port</h1>
          </div>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="login-form">
              <h2>{t('auth.login')}</h2>
              <p className="login-subtitle">P2P Processing System</p>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="username">{t('auth.username')}</label>
                <div className="input-wrapper">
                  <User size={18} />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('auth.username')}
                    required
                    autoFocus
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">{t('auth.password')}</label>
                <div className="input-wrapper">
                  <Lock size={18} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-login"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader size={18} className="spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.login')
                )}
              </button>

              <div className="form-footer">
                <span>{t('auth.noAccount')}</span>
                <Link to="/register" className="link">{t('auth.register')}</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="login-form">
              <h2>{t('auth.verifyCode')}</h2>
              <p className="login-subtitle">{t('auth.twoFactorCode')}</p>

              {error && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="code">{t('auth.twoFactorCode')}</label>
                <div className="input-wrapper">
                  <Shield size={18} />
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                    autoComplete="off"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-login"
                disabled={verify2FAMutation.isPending}
              >
                {verify2FAMutation.isPending ? (
                  <>
                    <Loader size={18} className="spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  t('auth.verifyCode')
                )}
              </button>

              <button 
                type="button" 
                className="btn-back"
                onClick={(e) => {
                  e.preventDefault();
                  setStep('login');
                  setError('');
                  setCode('');
                  setTempToken('');
                }}
              >
                ← {t('common.cancel')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
