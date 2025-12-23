import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Lock, User, Mail, Shield, AlertCircle, Loader, Globe, Sun, Moon, CheckCircle, Crown, Key } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useAppStore } from '../../store/appStore';
import './Login.css';

export default function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const setLanguage = useAppStore((state) => state.setLanguage);

  const [step, setStep] = useState<'form' | 'qrcode'>('form');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [error, setError] = useState('');

  const handleLanguageToggle = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    setLanguage(newLang as 'en' | 'ru');
  };

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (isAdminMode) {
        return authService.registerAdmin({ username, email, password }, masterKey);
      }
      return authService.register({ username, email, password });
    },
    onSuccess: async (data) => {
      try {
        const qrBlob = await authService.getQRCode(data.tempToken);
        const qrUrl = URL.createObjectURL(qrBlob);
        setQrCodeUrl(qrUrl);
        setStep('qrcode');
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load QR code');
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Registration failed');
    },
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate();
  };

  const logoStyle = isAdminMode 
    ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
    : { background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' };

  const buttonStyle = isAdminMode
    ? { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
    : {};

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
          {step === 'form' ? (
            <form onSubmit={handleRegister} className="login-form">
              <div className="login-card-header">
                <div className="login-logo">
                  <div className="logo-circle" style={logoStyle}>
                    {isAdminMode ? <Crown size={32} /> : <Shield size={32} />}
                  </div>
                  <h1>CRM Pro</h1>
                </div>

                <h2>{isAdminMode ? t('auth.registerAdmin') : t('auth.register')}</h2>
                <p className="login-subtitle">
                  {isAdminMode ? t('auth.createAdminAccount') : t('auth.createAccount')}
                </p>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <div className="admin-toggle">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={isAdminMode}
                      onChange={(e) => setIsAdminMode(e.target.checked)}
                      className="toggle-checkbox"
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-text">
                      <Crown size={16} />
                      {t('auth.registerAsAdmin')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="login-card-body">
                <div className={`admin-key-wrapper ${isAdminMode ? 'visible' : ''}`}>
                  <div className="form-group admin-key-group">
                    <label htmlFor="masterKey">{t('auth.masterKey')}</label>
                    <div className="input-wrapper">
                      <Key size={18} />
                      <input
                        id="masterKey"
                        type="password"
                        value={masterKey}
                        onChange={(e) => setMasterKey(e.target.value)}
                        placeholder={t('auth.masterKey')}
                        required={isAdminMode}
                        tabIndex={isAdminMode ? 0 : -1}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>

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
                      autoFocus={!isAdminMode}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('auth.email')}</label>
                  <div className="input-wrapper">
                    <Mail size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.email')}
                      required
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
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-login"
                  style={buttonStyle}
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader size={18} className="spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      {isAdminMode && <Crown size={18} />}
                      {isAdminMode ? t('auth.registerAdmin') : t('auth.register')}
                    </>
                  )}
                </button>

                <div className="form-footer">
                  <span>{t('auth.haveAccount')}</span>
                  <Link to="/login" className="link">{t('auth.login')}</Link>
                </div>
              </div>
            </form>
          ) : (
            <div className="qrcode-container">
              <div className="success-icon">
                <CheckCircle size={48} />
              </div>
              <h2>{t('auth.setupTwoFactor')}</h2>
              <p className="qrcode-subtitle">{t('auth.scanQRCode')}</p>

              <div className="qrcode-box">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" />
                ) : (
                  <div className="qrcode-loading">
                    <Loader className="spin" size={32} />
                  </div>
                )}
              </div>

              <div className="qrcode-instructions">
                <p>1. {t('auth.downloadAuthenticator')}</p>
                <p>2. {t('auth.scanQRWithApp')}</p>
                <p>3. {t('auth.useCodeToLogin')}</p>
              </div>

              <button 
                className="btn-login"
                style={buttonStyle}
                onClick={() => navigate('/login')}
              >
                {t('auth.continueToLogin')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
