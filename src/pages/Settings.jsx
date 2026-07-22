import { useState } from 'react';
import { Bell, Lock, Globe, Moon, Ruler, Trash2, Users, Edit3, X } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import useThemeStore from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Settings.css';

const Settings = () => {
  const { profile, updateProfile, resetData } = useWeddingStore();
  const { theme, toggleTheme } = useThemeStore();
  const { t, language, setLanguage } = useTranslation();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    partner_1_name: profile?.partner_1_name || 'Partner 1',
    partner_2_name: profile?.partner_2_name || 'Partner 2',
    wedding_date: profile?.wedding_date || '',
    wedding_location: profile?.wedding_location || '',
    avatar_url: profile?.avatar_url || ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setShowProfileModal(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large! Maximum 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfileForm({ ...profileForm, avatar_url: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('overview.dateNotSet');
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <div className="settings-container">
      <header className="page-header">
        <h1>{t('settings.title')}</h1>
      </header>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="card profile-card" style={{ position: 'relative' }}>
          <button 
            onClick={() => {
              setProfileForm({
                partner_1_name: profile?.partner_1_name || '',
                partner_2_name: profile?.partner_2_name || '',
                wedding_date: profile?.wedding_date || '',
                wedding_location: profile?.wedding_location || '',
                avatar_url: profile?.avatar_url || ''
              });
              setShowProfileModal(true);
            }} 
            style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <Edit3 size={18} />
          </button>
          
          <div className="profile-info">
            <div className="profile-avatars">
              {profile?.avatar_url ? (
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '3px solid white', boxShadow: 'var(--shadow)' }}>
                  <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="avatar-couple"></div>
              )}
            </div>
            <div className="profile-details">
              <h2>{profile?.partner_1_name || 'Partner 1'} & {profile?.partner_2_name || 'Partner 2'}</h2>
              <p className="date">{formatDate(profile?.wedding_date)}</p>
              <p className="location">📍 {profile?.wedding_location || t('timeline.locationNotSet')}</p>
            </div>
          </div>
          <button className="btn-primary btn-full">{t('settings.viewSite')}</button>
        </div>

        {/* Account Settings */}
        <div className="card account-settings-card">
          <h3>{t('settings.accountSettings')}</h3>
          <ul className="settings-list">
            <li className="settings-item" onClick={() => alert(t('settings.comingSoon'))} style={{ cursor: 'pointer' }}>
              <div className="icon-box-small"><Bell size={18} /></div>
              <div className="item-text">
                <h4>{t('settings.notifications')}</h4>
                <p>{t('settings.notificationsDesc')}</p>
              </div>
              <span className="arrow-right">›</span>
            </li>
            <li className="settings-item" onClick={() => alert(t('settings.comingSoon'))} style={{ cursor: 'pointer' }}>
              <div className="icon-box-small"><Lock size={18} /></div>
              <div className="item-text">
                <h4>{t('settings.privacy')}</h4>
                <p>{t('settings.privacyDesc')}</p>
              </div>
              <span className="arrow-right">›</span>
            </li>
            <li className="settings-item" onClick={toggleLanguage} style={{ cursor: 'pointer' }}>
              <div className="icon-box-small"><Globe size={18} /></div>
              <div className="item-text">
                <h4>{t('settings.language')}</h4>
                <p>{language === 'id' ? 'Bahasa Indonesia' : 'English (United States)'}</p>
              </div>
              <button className="btn-text">CHANGE</button>
            </li>
          </ul>
        </div>

        {/* App Preferences */}
        <div className="card preferences-card">
          <h3>{t('settings.appPref')}</h3>
          <ul className="settings-list">
            <li className="settings-item">
              <div className="icon-box-small"><Moon size={18} /></div>
              <div className="item-text">
                <h4>{t('settings.darkMode')}</h4>
                <p>{t('settings.darkModeDesc')}</p>
              </div>
              <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme} style={{ cursor: 'pointer' }}>
                {theme === 'dark' ? (
                  <div style={{ width: '40px', height: '20px', background: 'var(--color-primary)', borderRadius: '10px', position: 'relative' }}>
                    <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px' }}></div>
                  </div>
                ) : (
                  <div style={{ width: '40px', height: '20px', background: 'var(--color-border)', borderRadius: '10px', position: 'relative' }}>
                    <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: '2px' }}></div>
                  </div>
                )}
              </div>
            </li>
          </ul>
        </div>

        {/* Account Management */}
        <div className="card danger-zone-card">
          <h3>{t('settings.accountMgmt')}</h3>
          <p>{t('settings.accountMgmtDesc')}</p>
          <button className="btn-danger-outline" onClick={() => setShowDeleteModal(true)}><Trash2 size={16} /> {t('settings.deleteAccount')}</button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{t('settings.editProfile')}</h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--color-bg-secondary)', marginBottom: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '2px solid var(--color-border)' }}>
                  {profileForm.avatar_url ? (
                    <img src={profileForm.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Users size={30} color="var(--color-text-muted)" />
                  )}
                </div>
                <input type="file" id="avatarUpload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                <label htmlFor="avatarUpload" className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px', cursor: 'pointer' }}>
                  {language === 'id' ? 'Unggah Foto' : 'Upload Photo'}
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('settings.yourName')}</label>
                  <input type="text" value={profileForm.partner_1_name} onChange={e => setProfileForm({...profileForm, partner_1_name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('settings.partnerName')}</label>
                  <input type="text" value={profileForm.partner_2_name} onChange={e => setProfileForm({...profileForm, partner_2_name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('settings.weddingDate')}</label>
                <input type="date" value={profileForm.wedding_date} onChange={e => setProfileForm({...profileForm, wedding_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{t('settings.location')}</label>
                <input type="text" value={profileForm.wedding_location} onChange={e => setProfileForm({...profileForm, wedding_location: e.target.value})} placeholder="e.g., Bali, Indonesia" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{t('budget.save')}</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => { setShowDeleteModal(false); setDeleteInput(''); }} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '15px', color: 'var(--color-danger)' }}>{t('settings.deleteAccount')}</h3>
            <p style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              {t('settings.deleteConfirmationText').replace('{word}', t('settings.deleteConfirmationInput'))}
            </p>
            <input 
              type="text" 
              value={deleteInput}
              onChange={e => setDeleteInput(e.target.value)}
              placeholder={t('settings.deleteConfirmationInput')}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)', marginBottom: '15px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn-danger" 
                style={{ flex: 1, padding: '10px', borderRadius: '5px', backgroundColor: 'var(--color-danger)', color: 'white', opacity: deleteInput === t('settings.deleteConfirmationInput') ? 1 : 0.5 }}
                disabled={deleteInput !== t('settings.deleteConfirmationInput')}
                onClick={async () => {
                  if (deleteInput === t('settings.deleteConfirmationInput')) {
                    await resetData(true);
                    setShowDeleteModal(false);
                    setDeleteInput('');
                  }
                }}
              >
                {t('settings.deleteConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
