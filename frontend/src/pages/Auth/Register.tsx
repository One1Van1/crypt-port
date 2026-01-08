import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { Lock, User, Mail, AlertCircle, Loader, Globe, Sun, Moon, CheckCircle, Crown, Key } from 'lucide-react';
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
      return authService.registerAdmin({ username, email, password }, masterKey);
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

  const logoStyle = { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
  const buttonStyle = { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };

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
            <form onSubmit={handleRegister} className="login-form register-form">
              <div className="login-card-header">
                <div className="login-logo">
                  <div className="logo-circle" style={logoStyle}>
                    <Crown size={32} />
                  </div>
                  <h1>Crypto Port</h1>
                </div>

                <h2>{t('auth.registerAdmin')}</h2>
                <p className="login-subtitle">
                  {t('auth.createAdminAccount')}
                </p>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

              </div>

              <div className="login-card-body">
                <div className="form-group">
                  <label htmlFor="masterKey">{t('auth.masterKey')}</label>
                  <div className="input-wrapper no-icon">
                    <input
                      id="masterKey"
                      type="text"
                      value={masterKey}
                      onChange={(e) => setMasterKey(e.target.value)}
                      placeholder={t('auth.masterKey')}
                      required
                      autoFocus
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="username">{t('auth.username')}</label>
                  <div className="input-wrapper no-icon">
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('auth.username')}
                      required
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('auth.email')}</label>
                  <div className="input-wrapper no-icon">
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
                  <div className="input-wrapper no-icon">
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
                      <Crown size={18} />
                      {t('auth.registerAdmin')}
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
