import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../store/useLanguageStore';
import useAuthStore from '../store/useAuthStore';
import { Lock, Eye, EyeOff, X, CheckCircle } from 'lucide-react';
import '../styles/Auth.css'; // Reuse auth styles

const ResetPasswordModal = () => {
  const { t, language } = useTranslation();
  const { clearPasswordRecovery } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError(language === 'id' ? 'Password minimal 6 karakter.' : 'Password must be at least 6 characters.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err.message || (language === 'id' ? 'Gagal memperbarui password.' : 'Failed to update password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    clearPasswordRecovery();
  };

  return (
    <div 
      className="modal-overlay"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 14, 23, 0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}
    >
      <div className="auth-card" style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: 0 }}>
        {!success && (
          <button 
            type="button" 
            onClick={handleClose} 
            className="welcome-close-btn"
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <X size={20} />
          </button>
        )}

        <div className="auth-header" style={{ marginBottom: '24px' }}>
          <h2 className="auth-title">
            {language === 'id' ? 'Buat Password Baru' : 'Create New Password'}
          </h2>
          <p className="auth-subtitle">
            {language === 'id' ? 'Silakan masukkan password baru untuk akun Anda.' : 'Please enter a new password for your account.'}
          </p>
        </div>

        {error && <div className="alert-box error" style={{ marginBottom: '20px' }}>{error}</div>}

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ marginBottom: '8px' }}>
              {language === 'id' ? 'Password Diperbarui!' : 'Password Updated!'}
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
              {language === 'id' ? 'Password Anda berhasil diperbarui. Anda sekarang dapat menggunakan password baru untuk login.' : 'Your password has been successfully updated. You can now use your new password to log in.'}
            </p>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleClose}
              style={{ width: '100%' }}
            >
              {language === 'id' ? 'Tutup & Lanjutkan' : 'Close & Continue'}
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleUpdatePassword}>
            <div className="input-group">
              <label className="auth-label">{t('auth.password') || 'New Password'}</label>
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
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading} style={{ marginTop: '24px' }}>
              {loading ? (
                <span>{t('auth.processing') || 'Processing...'}</span>
              ) : (
                <span>{language === 'id' ? 'Simpan Password Baru' : 'Save New Password'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
