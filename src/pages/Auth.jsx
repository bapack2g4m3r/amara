import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Auth.css';

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

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
      <div className="auth-card card">
        <div className="auth-header">
          <img src="/amara-logo-full.png" alt="Amara Logo" className="auth-logo" />
          <h2>{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h2>
          <p className="subtitle">
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </div>

        {error && <div className="alert-box error">{error}</div>}
        {message && <div className="alert-box success">{message}</div>}

        <form className="auth-form" onSubmit={handleAuth}>
          <div className="input-group">
            <label>{t('auth.emailAddress')}</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="input-group">
            <label>{t('auth.password')}</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? t('auth.processing') : (isLogin ? <><LogIn size={18} /> {t('auth.signIn')}</> : <><UserPlus size={18} /> {t('auth.signUp')}</>)}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" className="google-icon" />
          {t('auth.continueGoogle')}
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
