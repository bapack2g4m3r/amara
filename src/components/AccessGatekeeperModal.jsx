import { useState, useEffect } from 'react';
import { Lock, Key, CheckCircle, LogOut, Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import '../styles/Auth.css';

const AccessGatekeeperModal = ({ userEmail, userId, reason, onAccessGranted }) => {
  const { signOut } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState(null);

  const isTrialExpired = reason === 'trial_expired';

  // Auto-detect code from URL params on mount
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlCode = searchParams.get('code') || searchParams.get('c') || searchParams.get('order_id');
      if (urlCode) {
        setCode(urlCode.toUpperCase().trim());
      }
    } catch (_e) {
      // ignore
    }
  }, []);

  // Quick check if email was just registered in Lynk.id webhook
  const handleCheckEmailAccess = async () => {
    setCheckingEmail(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.rpc('check_user_access');
      if (err) throw err;
      if (data?.has_access) {
        onAccessGranted();
      } else {
        setError(`Belum ditemukan pembelian aktif untuk email ini di Lynk.id. Pastikan Anda checkout menggunakan email yang sama (${userEmail}).`);
      }
    } catch (e) {
      setError(e.message || 'Gagal memeriksa status lisensi.');
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError('Silakan masukkan kode akses Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Validate
      const { data: valData, error: valErr } = await supabase.rpc('validate_access_code', {
        p_code: cleanCode
      });
      if (valErr) throw valErr;
      if (!valData || !valData.is_valid) {
        throw new Error(valData?.message || 'Kode akses tidak valid atau sudah digunakan.');
      }

      // 2. Claim
      const { data: claimData, error: claimErr } = await supabase.rpc('claim_access_code', {
        p_code: cleanCode,
        p_email: userEmail,
        p_user_id: userId
      });
      if (claimErr) throw claimErr;
      if (!claimData?.success) {
        throw new Error(claimData?.message || 'Gagal mengklaim kode akses.');
      }

      // Success!
      onAccessGranted();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat mengaktifkan kode akses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(20, 8, 27, 0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <div className="auth-logo-wrapper" style={{ background: isTrialExpired ? 'rgba(220, 38, 38, 0.1)' : 'rgba(153, 24, 42, 0.1)', padding: '12px', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={28} color={isTrialExpired ? '#dc2626' : 'var(--color-primary, #99182a)'} />
          </div>
          <h2 className="auth-title">
            {isTrialExpired ? 'Masa Free Trial Berakhir' : 'Aktivasi Akses Amara'}
          </h2>
          <p className="auth-subtitle" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            {isTrialExpired ? (
              <>
                Masa percobaan (Free Trial) untuk akun <strong>{userEmail}</strong> telah selesai. Masukkan kode lisensi permanen atau aktifkan pembelian Lynk.id untuk melanjutkan.
              </>
            ) : (
              <>
                Akun <strong>{userEmail}</strong> belum memiliki akses aktif. Jika Anda baru saja membeli di Lynk.id, klik tombol cek di bawah, atau masukkan kode akses Anda.
              </>
            )}
          </p>
        </div>

        {isTrialExpired && !error && (
          <div className="alert-box" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#b45309', marginBottom: '16px', fontSize: '0.84rem' }}>
            Data pernikahan Anda tetap aman tersimpan. Hubungkan lisensi untuk membuka kembali akses.
          </div>
        )}

        {error && <div className="alert-box error" style={{ marginBottom: '16px' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleActivate}>
          <div className="input-group">
            <label className="auth-label">Kode Akses Registrasi</label>
            <div className="input-wrapper">
              <Key size={17} className="input-icon" />
              <input 
                type="text" 
                className="auth-input"
                placeholder="Contoh: TRL-XXXX atau AMR-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                style={{ letterSpacing: '1.2px', fontWeight: 600, textTransform: 'uppercase' }}
                autoFocus
              />
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary, #64748b)', marginTop: 4, display: 'block' }}>
              Masukkan kode unik Free Trial atau lisensi khusus yang Anda terima dari Amara.
            </span>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? (
              <span>Memvalidasi...</span>
            ) : (
              <>
                <Sparkles size={17} />
                <span>Aktifkan Akun Saya</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button 
            type="button" 
            onClick={handleCheckEmailAccess} 
            disabled={checkingEmail}
            className="btn-text-link"
            style={{ fontSize: '0.82rem', color: 'var(--color-primary, #99182a)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <RefreshCw size={14} className={checkingEmail ? 'spin' : ''} />
            <span>{checkingEmail ? 'Memeriksa Lynk.id...' : 'Sudah bayar di Lynk.id? Cek Akses Email Otomatis'}</span>
          </button>
        </div>

        <div className="auth-footer" style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border, #e2e8f0)' }}>
          <button 
            type="button" 
            className="btn-text-link" 
            onClick={signOut}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary, #64748b)' }}
          >
            <LogOut size={15} />
            <span>Keluar / Ganti Akun Lain</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessGatekeeperModal;
