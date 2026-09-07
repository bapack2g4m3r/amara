import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Calendar, MapPin, ShieldCheck, CheckCircle2, Moon, Sun, Globe, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import useThemeStore from '../store/useThemeStore';
import '../styles/JoinInvite.css';

const JoinInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { getInviteInfo, acceptPartnerInvite } = useWeddingStore();
  const { t, language, setLanguage } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();

  const codeParam = searchParams.get('code') || '';
  const dataParam = searchParams.get('d') || '';
  const [code, setCode] = useState(codeParam);
  const [inviteData, setInviteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  useEffect(() => {
    if (codeParam) {
      setCode(codeParam);
      checkCode(codeParam, dataParam);
    } else {
      setLoading(false);
    }
  }, [codeParam, dataParam]);

  const checkCode = async (inviteCode, payload = dataParam) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInviteInfo(inviteCode, payload);
      if (res.error) {
        setError(res.error);
        setInviteData(null);
      } else {
        setInviteData(res.owner);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail undangan.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!session) {
      // Store pending invite code in localStorage so when they log in or register they can be linked
      localStorage.setItem('amara_pending_invite', code);
      if (dataParam) {
        localStorage.setItem('amara_pending_invite_data', dataParam);
      }
      navigate('/');
      return;
    }

    setJoining(true);
    setError(null);
    try {
      await acceptPartnerInvite(code, inviteData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/overview');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Gagal menerima undangan kolaborasi.');
    } finally {
      setJoining(false);
    }
  };

  const coupleName = inviteData 
    ? `${inviteData.partner_1_name || 'Pasangan 1'} & ${inviteData.partner_2_name || 'Pasangan 2'}`
    : 'Pasangan Amara';

  const isEditor = (inviteData?.partner_role || 'editor') === 'editor';

  return (
    <div className="join-container">
      {/* Floating Top Controls */}
      <div className="auth-top-controls">
        <button 
          type="button" 
          className="auth-control-pill" 
          onClick={toggleLanguage}
          title={language === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
        >
          <Globe size={14} />
          <span>{language === 'id' ? 'EN' : 'ID'}</span>
        </button>

        <button 
          type="button" 
          className="auth-control-pill" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div className="join-card">
        {/* Brand Logo */}
        <div className="join-logo-wrapper">
          <img 
            src="/amara-logo-full.png" 
            alt="Amara Wedding" 
            className="join-logo-img"
          />
        </div>

        <div className="join-icon-badge">
          <Heart size={30} fill="currentColor" />
        </div>

        <h1 className="join-title">
          {language === 'id' ? 'Undangan Kolaborasi' : 'Collaboration Invite'}
        </h1>

        <p className="join-subtitle">
          {language === 'id' 
            ? 'Yuk rencanakan dan kelola persiapan hari bahagia bersama pasangan Anda di Amara!'
            : 'Plan and manage your big day preparations together with your partner on Amara!'}
        </p>

        {error && (
          <div className="join-error-box">
            <AlertCircle size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '30px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            {language === 'id' ? 'Memeriksa undangan...' : 'Checking invite...'}
          </div>
        ) : inviteData ? (
          <>
            <div className="join-details-box">
              <div className="join-couple-name">{coupleName}</div>
              
              {inviteData.wedding_date && (
                <div className="join-info-row">
                  <Calendar size={16} className="join-info-icon" />
                  <span>{new Date(inviteData.wedding_date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'long' })}</span>
                </div>
              )}

              {inviteData.wedding_location && (
                <div className="join-info-row">
                  <MapPin size={16} className="join-info-icon" />
                  <span>{inviteData.wedding_location}</span>
                </div>
              )}

              <div className="join-info-row" style={{ marginTop: '12px' }}>
                <ShieldCheck size={16} className="join-info-icon" />
                <span>{language === 'id' ? 'Hak Akses:' : 'Access Role:'}</span>
                <span className={`join-role-pill ${isEditor ? 'editor' : 'viewer'}`}>
                  {isEditor 
                    ? (language === 'id' ? 'Editor (Akses Penuh)' : 'Editor (Full Access)') 
                    : (language === 'id' ? 'Viewer (Hanya Melihat)' : 'Viewer (View Only)')}
                </span>
              </div>
            </div>

            {success ? (
              <div style={{ color: '#10B981', fontWeight: 600, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} />
                <span>{language === 'id' ? 'Berhasil terhubung! Membuka dashboard...' : 'Connected successfully! Opening dashboard...'}</span>
              </div>
            ) : (
              <>
                <button 
                  type="button" 
                  className="join-action-btn"
                  onClick={handleAccept}
                  disabled={joining}
                >
                  {joining ? (
                    <div className="join-loading-spinner" />
                  ) : (
                    <>
                      <span>{session 
                        ? (language === 'id' ? 'Terima & Gabung Dashboard' : 'Accept & Join Dashboard')
                        : (language === 'id' ? 'Masuk untuk Menerima Undangan' : 'Sign In to Accept Invite')}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                {session ? (
                  <Link to="/overview" className="join-secondary-btn">
                    {language === 'id' ? 'Kembali ke Dashboard Saya' : 'Back to My Dashboard'}
                  </Link>
                ) : (
                  <Link to="/" className="join-secondary-btn">
                    {language === 'id' ? 'Sudah Punya Akun? Masuk ke Amara' : 'Already have an account? Sign in'}
                  </Link>
                )}
              </>
            )}
          </>
        ) : (
          <div style={{ marginTop: '16px' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {language === 'id' ? 'Masukkan kode undangan Amara di bawah ini:' : 'Enter your Amara invite code below:'}
            </p>
            <input 
              type="text" 
              placeholder="Contoh: AMARA-XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--border-radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                textAlign: 'center',
                letterSpacing: '2px',
                fontWeight: 700,
                marginBottom: '16px',
                fontSize: '1.1rem'
              }}
            />
            <button 
              type="button" 
              className="join-action-btn"
              onClick={() => checkCode(code)}
              disabled={!code.trim()}
            >
              <span>{language === 'id' ? 'Periksa Kode' : 'Check Code'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinInvite;
