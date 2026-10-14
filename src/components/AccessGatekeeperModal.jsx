import { useState, useEffect } from 'react';
import { Lock, Key, CheckCircle, LogOut, Sparkles, RefreshCw, ExternalLink, Clipboard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import useAuthStore from '../store/useAuthStore';
import useWeddingStore from '../store/useWeddingStore';
import { LYNK_PURCHASE_URL } from '../config/appConfig';
import '../styles/Auth.css';

const AccessGatekeeperModal = ({ userEmail, userId, reason, onAccessGranted }) => {
  const { signOut } = useAuthStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState(null);

  const isTrialExpired = reason === 'trial_expired';
  const isPartnerUnlinked = reason === 'partner_unlinked';

  // Auto-detect code from URL params or check if user is already an invited wedding partner
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const urlCode = searchParams.get('code') || searchParams.get('c') || searchParams.get('order_id');
      if (urlCode) {
        const clean = urlCode.toUpperCase().trim();
        setCode(clean);
        try {
          if (navigator?.clipboard?.writeText) {
            navigator.clipboard.writeText(clean);
          }
        } catch (_clipErr) {
          // ignore
        }
      }
    } catch (_e) {
      // ignore
    }

    if (userId) {
      supabase
        .from('profiles')
        .select('wedding_owner_id, has_access')
        .eq('id', userId)
        .maybeSingle()
        .then(({ data: prof }) => {
          if (prof?.wedding_owner_id) {
            onAccessGranted();
          }
        });
    }
  }, [userId, onAccessGranted]);

  // Quick check if email was just registered in Lynk.id webhook or is an invited partner
  const handleCheckEmailAccess = async () => {
    setCheckingEmail(true);
    setError(null);
    try {
      // 1. Check if user is an invited partner
      const { data: prof } = await supabase
        .from('profiles')
        .select('wedding_owner_id, has_access')
        .eq('id', userId)
        .maybeSingle();

      if (prof?.wedding_owner_id) {
        onAccessGranted();
        return;
      }

      // 2. Check general access via RPC
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
      // If code is a partner invitation code, accept invite directly
      if (cleanCode.startsWith('AMARA-')) {
        await useWeddingStore.getState().acceptPartnerInvite(cleanCode);
        onAccessGranted();
        return;
      }

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
      const msg = err.message || '';
      if (msg.includes('foreign key constraint') || msg.includes('violates foreign key')) {
        setError('Gagal menghubungkan profil akun: foreign key constraint database. Silakan jalankan migration SQL fix-claim-access-code-any-email.sql di Supabase SQL Editor.');
      } else {
        setError(msg || 'Terjadi kesalahan saat mengaktifkan kode akses.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setCode(text.trim().toUpperCase());
      }
    } catch (_e) {
      // ignore
    }
  };

  return (
    <div className="auth-container" style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(20, 8, 27, 0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        <div className="auth-header">
          <div className="auth-logo-wrapper" style={{ background: (isTrialExpired || isPartnerUnlinked) ? 'rgba(220, 38, 38, 0.1)' : 'rgba(153, 24, 42, 0.1)', padding: '12px', borderRadius: '50%', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={28} color={(isTrialExpired || isPartnerUnlinked) ? '#dc2626' : 'var(--color-primary, #99182a)'} />
          </div>
          <h2 className="auth-title">
            {isTrialExpired ? 'Masa Free Trial Berakhir' : isPartnerUnlinked ? 'Akses Kolaborasi Terputus' : 'Aktivasi Akses Amara'}
          </h2>
          <p className="auth-subtitle" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
            {isTrialExpired ? (
              <>
                Masa percobaan (Free Trial) untuk akun <strong>{userEmail}</strong> telah selesai. Masukkan kode lisensi permanen atau aktifkan pembelian Lynk.id untuk melanjutkan.
              </>
            ) : isPartnerUnlinked ? (
              <>
                Akses kolaborasi untuk akun <strong>{userEmail}</strong> telah diputuskan oleh pasangan Anda. Untuk menggunakan Amara secara mandiri atau menghubungkan kode lisensi baru, silakan masukkan kode akses di bawah.
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

        {isPartnerUnlinked && !error && (
          <div className="alert-box" style={{ background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#b91c1c', marginBottom: '16px', fontSize: '0.84rem' }}>
            Akses ke dashboard pernikahan pasangan Anda telah dinonaktifkan.
          </div>
        )}

        {error && <div className="alert-box error" style={{ marginBottom: '16px' }}>{error}</div>}

        <form className="auth-form" onSubmit={handleActivate}>
          <div className="input-group">
            <label className="auth-label">Kode Akses Registrasi</label>
            <div className="input-wrapper" style={{ position: 'relative' }}>
              <Key size={17} className="input-icon" />
              <input 
                type="text" 
                className="auth-input"
                placeholder="Contoh: LYNK-XXXX atau AMR-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                style={{ letterSpacing: '1.2px', fontWeight: 600, textTransform: 'uppercase', paddingRight: '88px' }}
                autoFocus
              />
              <button
                type="button"
                onClick={handlePaste}
                title="Tempel dari Clipboard"
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(153, 24, 42, 0.08)',
                  color: 'var(--color-primary, #99182a)',
                  border: '1px solid rgba(153, 24, 42, 0.2)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  zIndex: 2
                }}
              >
                <Clipboard size={12} />
                <span>Tempel</span>
              </button>
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

        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
          <a
            href={LYNK_PURCHASE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.86rem',
              fontWeight: 600,
              padding: '10px 16px',
              borderRadius: 'var(--border-radius, 10px)',
              textDecoration: 'none',
              background: 'rgba(153, 24, 42, 0.08)',
              color: 'var(--color-primary, #99182a)',
              border: '1px solid rgba(153, 24, 42, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Beli Akses Amara di Lynk.id (Rumah Ramai)</span>
            <ExternalLink size={14} />
          </a>

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
