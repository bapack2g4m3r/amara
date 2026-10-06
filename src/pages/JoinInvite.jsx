import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  AlertCircle,
  UserPlus,
  LogIn
} from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/JoinInvite.css';

const JoinInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const { getInviteInfo, acceptPartnerInvite } = useWeddingStore();
  const { language } = useTranslation();

  const codeParam = searchParams.get('code') || '';
  const dataParam = searchParams.get('d') || '';
  const [code, setCode] = useState(codeParam);
  const [inviteData, setInviteData] = useState(null);
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
        // Pre-fill partner display name if available in invite payload
        if (res.owner?.partner_2_name) {
          setPartnerNameInput(prev => prev || res.owner.partner_2_name);
        }
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail undangan.');
    } finally {
      setLoading(false);
    }
  };

  const savePendingContext = () => {
    localStorage.setItem('amara_pending_invite', code);
    if (dataParam) {
      localStorage.setItem('amara_pending_invite_data', dataParam);
    }
    if (partnerNameInput.trim()) {
      localStorage.setItem('amara_pending_partner_name', partnerNameInput.trim());
    }
  };

  const handleGoToSignup = () => {
    savePendingContext();
    const query = dataParam 
      ? `mode=signup&code=${encodeURIComponent(code)}&d=${encodeURIComponent(dataParam)}`
      : `mode=signup&code=${encodeURIComponent(code)}`;
    navigate(`/login?${query}`);
  };

  const handleGoToLogin = () => {
    savePendingContext();
    const query = dataParam 
      ? `mode=login&code=${encodeURIComponent(code)}&d=${encodeURIComponent(dataParam)}`
      : `mode=login&code=${encodeURIComponent(code)}`;
    navigate(`/login?${query}`);
  };

  const handleAccept = async () => {
    if (!session) {
      handleGoToSignup();
      return;
    }

    setJoining(true);
    setError(null);
    try {
      const nameToSave = partnerNameInput.trim() || localStorage.getItem('amara_pending_partner_name') || '';
      await acceptPartnerInvite(code, inviteData, nameToSave);
      localStorage.removeItem('amara_pending_invite');
      localStorage.removeItem('amara_pending_invite_data');
      localStorage.removeItem('amara_pending_partner_name');
      if (session?.user?.id) {
        localStorage.setItem(`amara_onboarding_done_${session.user.id}`, 'true');
      }
      sessionStorage.setItem('amara_onboarding_session_done', 'true');
      setSuccess(true);
      setTimeout(() => {
        navigate('/overview', { replace: true });
      }, 1200);
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
      <div className="join-card">
        {/* Brand Logo */}
        <div className="join-logo-wrapper">
          <img 
            src="/amara-logo.png" 
            alt="Amara Wedding" 
            className="join-logo-img"
          />
        </div>

        <div className="join-icon-badge">
          <Heart size={26} fill="currentColor" />
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
              <div className="join-success-box">
                <CheckCircle2 size={24} className="text-success" />
                <div>
                  <h4>{language === 'id' ? 'Berhasil Terhubung!' : 'Successfully Connected!'}</h4>
                  <p>{language === 'id' ? 'Membuka dashboard pernikahan Anda & pasangan...' : 'Opening your shared wedding dashboard...'}</p>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '18px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '6px', color: 'var(--color-text)' }}>
                    {language === 'id' ? 'Nama Panggilan Anda (Opsional):' : 'Your Display Name (Optional):'}
                  </label>
                  <input 
                    type="text"
                    placeholder={language === 'id' ? 'Masukkan nama Anda...' : 'Enter your name...'}
                    value={partnerNameInput}
                    onChange={(e) => setPartnerNameInput(e.target.value)}
                    className="join-input-name"
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                    {language === 'id' 
                      ? 'Nama ini akan ditampilkan bersama pasangan di dashboard pernikahan.'
                      : 'This name will appear on the wedding dashboard.'}
                  </span>
                </div>

                {!session ? (
                  <div className="join-auth-prompt-card">
                    <p className="join-auth-prompt-text">
                      {language === 'id' 
                        ? `Untuk menerima undangan dan bergabung ke persiapan pernikahan ${coupleName}, silakan buat akun baru gratis atau masuk jika sudah terdaftar:`
                        : `To accept the invite and join ${coupleName}'s preparations, please create a free account or sign in:`}
                    </p>

                    <div className="join-btn-stack">
                      <button 
                        type="button" 
                        className="join-action-btn join-signup-btn"
                        onClick={handleGoToSignup}
                      >
                        <UserPlus size={18} />
                        <span>{language === 'id' ? 'Daftar Akun Baru (Gratis)' : 'Create Free Account'}</span>
                        <ArrowRight size={17} style={{ marginLeft: 'auto' }} />
                      </button>

                      <button 
                        type="button" 
                        className="join-secondary-btn"
                        onClick={handleGoToLogin}
                      >
                        <LogIn size={16} />
                        <span>{language === 'id' ? 'Sudah Punya Akun? Masuk' : 'Already Have an Account? Sign In'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="join-authenticated-prompt">
                    <div className="join-session-pill">
                      <UserCheck size={15} />
                      <span>
                        {language === 'id' ? `Akun Anda: ${session.user?.email}` : `Signed in as: ${session.user?.email}`}
                      </span>
                    </div>

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
                          <CheckCircle2 size={18} />
                          <span>{language === 'id' ? 'Terima & Gabung Dashboard' : 'Accept & Join Dashboard'}</span>
                          <ArrowRight size={17} style={{ marginLeft: 'auto' }} />
                        </>
                      )}
                    </button>

                    <Link to="/overview" className="join-secondary-btn">
                      {language === 'id' ? 'Kembali ke Dashboard Saya' : 'Back to My Dashboard'}
                    </Link>
                  </div>
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
              className="join-code-input"
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
