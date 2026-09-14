import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, Eye, EyeOff, Sparkles, Key, CheckCircle } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Auth.css';

const Auth = () => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [codeVerifiedInfo, setCodeVerifiedInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Check URL params for access code (e.g. ?code=TRIAL-BUDI)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const codeParam = params.get('code') || params.get('c');
      if (codeParam) {
        setAccessCode(codeParam.toUpperCase().trim());
        setIsLogin(false); // Auto open sign-up tab for invited users
      }
    } catch (_e) {
      // ignore
    }
  }, []);

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
        const cleanCode = accessCode.trim().toUpperCase();
        if (!cleanCode) {
          throw new Error(t('auth.errAccessCodeRequired') || 'Kode akses wajib diisi untuk mendaftar akun baru.');
        }

        // 1. Validate the access code first
        const { data: valData, error: valErr } = await supabase.rpc('validate_access_code', { 
          p_code: cleanCode 
        });

        if (valErr) throw valErr;
        if (!valData || !valData.is_valid) {
          throw new Error(valData?.message || 'Kode akses tidak valid atau sudah kedaluwarsa.');
        }

        // 2. Perform Supabase Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        // 3. Claim the access code
        const userId = signUpData?.user?.id || null;
        await supabase.rpc('claim_access_code', {
          p_code: cleanCode,
          p_email: email,
          p_user_id: userId
        });

        if (signUpData?.session) {
          // If Supabase auto-confirms without email verification
          setMessage('Akun berhasil dibuat! Mengalihkan ke dashboard...');
        } else {
          setMessage(t('auth.checkEmail'));
        }
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
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-wrapper">
            <img src="/amara-logo.png" alt="Amara Logo" className="auth-brand-logo" />
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

          {!isLogin && (
            <div className="input-group">
              <label className="auth-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>
                  {t('auth.accessCode')}
                  <span style={{ color: 'var(--primary, #6b1d2f)', marginLeft: 4 }}>*</span>
                </span>
              </label>
              <div className="input-wrapper">
                <Key size={17} className="input-icon" />
                <input 
                  type="text" 
                  className="auth-input access-code-input"
                  placeholder={t('auth.accessCodePlaceholder')}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  required
                  style={{ letterSpacing: '1.2px', fontWeight: 600, textTransform: 'uppercase' }}
                />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #666)', marginTop: 4, display: 'block' }}>
                {t('auth.accessCodeHelp')}
              </span>
            </div>
          )}

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

