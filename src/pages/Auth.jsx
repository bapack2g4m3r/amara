import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Moon, Sun, Globe, Sparkles } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';
import useThemeStore from '../store/useThemeStore';
import '../styles/Auth.css';

const Auth = () => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(t('auth.checkEmail'));
      }
    } catch (err) {
      setError(err.message || t('auth.errAuth'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message || t('auth.errGoogle'));
    }
  };

  return (
    <div className="auth-container">
      {/* Floating Top Controls */}
      <div className="auth-top-controls">
        <button 
          type="button" 
          className="auth-control-pill" 
          onClick={toggleLanguage}
          aria-label="Toggle language"
        >
          <Globe size={14} />
          <span>{language.toUpperCase()}</span>
        </button>

        <button 
          type="button" 
          className="auth-control-pill" 
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <img src="/amara-logo-full.png" alt="Amara Logo" className="auth-brand-logo" />
          </div>
          <h2 className="auth-title">
            {isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {message && <div className="alert-box success">{message}</div>}

        <form className="auth-form" onSubmit={handleAuth}>
          <div className="input-group">
            <label className="auth-label">{t('auth.emailAddress')}</label>
            <div className="input-wrapper">
              <Mail size={17} className="input-icon" />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="auth-label">{t('auth.password')}</label>
            <div className="input-wrapper">
              <Lock size={17} className="input-icon" />
              <input 
                type={showPassword ? 'text' : 'password'}
                className="auth-input password-input"
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>{t('auth.processing')}</span>
            ) : isLogin ? (
              <>
                <LogIn size={17} />
                <span>{t('auth.signIn')}</span>
              </>
            ) : (
              <>
                <Sparkles size={17} />
                <span>{t('auth.signUp')}</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button type="button" className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="google-icon" />
          <span>{t('auth.continueGoogle')}</span>
        </button>

        <div className="auth-footer">
          <p>
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            <button className="btn-text-link" onClick={() => setIsLogin(!isLogin)} type="button">
              {isLogin ? t('auth.signUp') : t('auth.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;

