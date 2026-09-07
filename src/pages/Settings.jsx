import { useState, useEffect } from 'react';
import { 
  Bell, Lock, Globe, Moon, Ruler, RotateCcw, Users, Edit3, X, Database, Download, Upload, 
  User, Heart, Calendar, MapPin, Camera, Sparkles, Share2, Copy, Check, UserCheck, 
  UserMinus, MessageCircle, ShieldCheck, ShieldAlert, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import useThemeStore from '../store/useThemeStore';
import { useTranslation } from '../store/useLanguageStore';
import { formatDate } from '../utils/dateFormatter';
import '../styles/Settings.css';

const Settings = () => {
  const { 
    profile, myProfile, connectedPartner, userRole, updateProfile, 
    resetData, exportFullBackup, importFullBackup, generateInviteCode, 
    updatePartnerRole, updatePartnerDisplayName, unlinkPartner 
  } = useWeddingStore();
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

  // Partner Collaboration states
  const [selectedRole, setSelectedRole] = useState(myProfile?.partner_role || 'editor');
  const [inviteUrl, setInviteUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [unlinkSuccessToast, setUnlinkSuccessToast] = useState(false);
  const [unlinkError, setUnlinkError] = useState('');
  const [isEditingPartnerName, setIsEditingPartnerName] = useState(false);
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [isSavingPartnerName, setIsSavingPartnerName] = useState(false);

  // Initial sync for role: only runs when user/partner loads, never overwrites user's active choice
  useEffect(() => {
    if (connectedPartner?.partner_role) {
      setSelectedRole(connectedPartner.partner_role);
    } else if (myProfile?.partner_role) {
      setSelectedRole(myProfile.partner_role);
    }
  }, [connectedPartner?.partner_role, myProfile?.id]);

  // Synchronize invite URL whenever invite_code or selectedRole changes
  useEffect(() => {
    if (myProfile?.invite_code) {
      let encoded = '';
      try {
        const payload = {
          id: myProfile.id,
          partner_1_name: profile?.partner_1_name || 'Pasangan',
          partner_2_name: profile?.partner_2_name || '',
          wedding_date: profile?.wedding_date || '',
          wedding_location: profile?.wedding_location || '',
          partner_role: selectedRole,
          invite_code: myProfile.invite_code
        };
        encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(payload)))));
      } catch (_e) {}

      const link = encoded 
        ? `${window.location.origin}/join?code=${myProfile.invite_code}&d=${encoded}`
        : `${window.location.origin}/join?code=${myProfile.invite_code}`;

      setInviteUrl(link);
    } else {
      setInviteUrl('');
    }
  }, [
    myProfile?.invite_code, 
    myProfile?.id, 
    profile?.partner_1_name, 
    profile?.partner_2_name, 
    profile?.wedding_date, 
    profile?.wedding_location, 
    selectedRole
  ]);

  // Backup & Restore states
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restorePreview, setRestorePreview] = useState(null);
  const [restoreMode, setRestoreMode] = useState('replace');

  const handleDownloadBackup = async () => {
    try {
      setIsExporting(true);
      await exportFullBackup();
      alert(t('settings.backupSuccess'));
    } catch (err) {
      console.error('Backup error:', err);
      alert('Gagal mengunduh cadangan data: ' + (err?.message || 'Terjadi kesalahan sistem'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.app || !json.data) {
          alert(t('settings.restoreInvalidFile'));
          return;
        }

        const counts = {
          tasks: json.data.tasks?.length || 0,
          expenses: json.data.expenses?.length || 0,
          vendors: json.data.vendors?.length || 0,
          guests: json.data.guests?.length || 0,
        };

        setRestorePreview({
          couple: json.couple || 'Amara Couple',
          exported_at: json.exported_at,
          counts,
          payload: json
        });
        setRestoreMode('replace');
        setShowRestoreModal(true);
      } catch (err) {
        console.error('Parse error:', err);
        alert(t('settings.restoreInvalidFile'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!restorePreview?.payload) return;
    try {
      setIsImporting(true);
      await importFullBackup(restorePreview.payload, restoreMode);
      setShowRestoreModal(false);
      setRestorePreview(null);
      alert(t('settings.restoreSuccess'));
    } catch (err) {
      console.error('Restore error:', err);
      alert('Gagal memulihkan data. Periksa kembali file backup Anda.');
    } finally {
      setIsImporting(false);
    }
  };

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

  const formatDateDisplay = (dateString) => {
    if (!dateString) return t('overview.dateNotSet');
    return formatDate(dateString);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'id' ? 'en' : 'id');
  };

  // Collaboration Handlers
  const isPartnerLinked = Boolean(connectedPartner || myProfile?.wedding_owner_id);
  const effectivePartnerRole = myProfile?.wedding_owner_id 
    ? (myProfile?.partner_role || 'editor')
    : (connectedPartner?.partner_role || 'editor');

  const partnerDisplayName = myProfile?.wedding_owner_id
    ? (profile?.partner_1_name || connectedPartner?.partner_1_name || connectedPartner?.partner_name || connectedPartner?.full_name || (language === 'id' ? 'Pasangan (Pemilik)' : 'Partner (Owner)'))
    : (connectedPartner?.partner_name || connectedPartner?.partner_2_name || (profile?.partner_2_name && !['Partner 2', 'Pasangan 2'].includes(profile.partner_2_name) ? profile.partner_2_name : null) || connectedPartner?.full_name || connectedPartner?.email || (language === 'id' ? 'Pasangan Anda' : 'Your Partner'));

  const waMessage = language === 'id'
    ? `Hai sayang! Yuk kita rencanakan dan kelola persiapan pernikahan kita bareng di Amara Wedding Dashboard: ${inviteUrl}`
    : `Hey love! Let's plan and manage our wedding together on Amara Wedding Dashboard: ${inviteUrl}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(waMessage)}`;

  const handleRoleSelect = async (role) => {
    setSelectedRole(role);
    if (userRole === 'owner') {
      try {
        await updatePartnerRole(role);
      } catch (err) {
        console.warn('Failed to persist partner role preference:', err);
      }
    }
  };

  const handleSavePartnerName = async (e) => {
    if (e) e.preventDefault();
    const trimmed = partnerNameInput.trim();
    if (!trimmed) return;
    setIsSavingPartnerName(true);
    try {
      await updatePartnerDisplayName(trimmed);
      setIsEditingPartnerName(false);
    } catch (err) {
      console.error('Failed to update partner display name:', err);
    } finally {
      setIsSavingPartnerName(false);
    }
  };

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const res = await generateInviteCode(selectedRole);
      setInviteUrl(res.inviteUrl);
    } catch (err) {
      console.error('Failed to generate invite:', err);
      alert('Gagal membuat tautan undangan: ' + (err?.message || ''));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUnlinkPartner = async () => {
    setIsUnlinking(true);
    setUnlinkError('');
    try {
      await unlinkPartner();
      setShowUnlinkModal(false);
      setInviteUrl('');
      setUnlinkSuccessToast(true);
      setTimeout(() => setUnlinkSuccessToast(false), 4500);
    } catch (err) {
      console.error('Failed to unlink partner:', err);
      setUnlinkError(err?.message || (language === 'id' ? 'Gagal memutuskan tautan pasangan. Silakan coba lagi.' : 'Failed to disconnect partner. Please try again.'));
    } finally {
      setIsUnlinking(false);
    }
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
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--color-surface-solid)', boxShadow: 'var(--shadow)' }}>
                  <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="avatar-couple"></div>
              )}
            </div>
            <div className="profile-details">
              <h2>{profile?.partner_1_name || 'Partner 1'} & {profile?.partner_2_name || 'Partner 2'}</h2>
              <p className="date">{formatDateDisplay(profile?.wedding_date)}</p>
              <p className="location">📍 {profile?.wedding_location || t('timeline.locationNotSet')}</p>
            </div>
          </div>
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
              <div className="language-toggle">
                <span className={language === 'en' ? 'active' : ''}>EN</span>
                <span className={language === 'id' ? 'active' : ''}>ID</span>
              </div>
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
              <div className={`toggle-switch ${theme === 'dark' ? 'active' : ''}`} onClick={toggleTheme} style={{ cursor: 'pointer' }}></div>
            </li>
          </ul>
        </div>

        {/* Partner Collaboration */}
        <div className="card partner-collab-card">
          <div className="partner-card-header">
            <div className="icon-badge-theme" style={{ background: 'rgba(241, 94, 128, 0.12)', color: 'var(--color-primary)' }}>
              <Heart size={22} fill="currentColor" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{t('settings.partnerCollaboration')}</h3>
                {isPartnerLinked && (
                  <span className="partner-status-badge linked">
                    <UserCheck size={14} />
                    <span>{t('settings.partnerConnected')}</span>
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                {t('settings.partnerCollabDesc')}
              </p>
            </div>
          </div>

          {isPartnerLinked ? (
            <div className="partner-linked-box">
              <div className="partner-info-row">
                <div className="partner-avatar">
                  {(partnerDisplayName || 'P').charAt(0).toUpperCase()}
                </div>
                <div className="partner-info-details">
                  {isEditingPartnerName ? (
                    <form className="partner-name-edit-form" onSubmit={handleSavePartnerName}>
                      <input 
                        type="text" 
                        value={partnerNameInput}
                        onChange={(e) => setPartnerNameInput(e.target.value)}
                        className="partner-name-inline-input"
                        placeholder={language === 'id' ? 'Nama Pasangan' : 'Partner Name'}
                        autoFocus
                        disabled={isSavingPartnerName}
                      />
                      <button 
                        type="submit" 
                        className="btn-inline-save"
                        disabled={isSavingPartnerName || !partnerNameInput.trim()}
                        title={language === 'id' ? 'Simpan' : 'Save'}
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="btn-inline-cancel"
                        onClick={() => setIsEditingPartnerName(false)}
                        disabled={isSavingPartnerName}
                        title={language === 'id' ? 'Batal' : 'Cancel'}
                      >
                        <X size={14} />
                      </button>
                    </form>
                  ) : (
                    <div className="partner-name-row">
                      <span className="partner-name-label">{partnerDisplayName}</span>
                      {userRole === 'owner' && (
                        <button
                          type="button"
                          className="btn-edit-partner-name"
                          onClick={() => {
                            setPartnerNameInput(partnerDisplayName);
                            setIsEditingPartnerName(true);
                          }}
                          title={language === 'id' ? 'Ubah nama pasangan' : 'Edit partner name'}
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="partner-role-indicator">
                    <span>{t('settings.partnerRoleCurrent')}:</span>
                    <span className={`partner-role-tag ${effectivePartnerRole}`}>
                      {effectivePartnerRole === 'editor' ? t('settings.roleEditor') : t('settings.roleViewer')}
                    </span>
                  </div>
                </div>

                {userRole === 'owner' && (
                  <div className="partner-role-selector-inline">
                    <select
                      value={selectedRole}
                      onChange={(e) => handleRoleSelect(e.target.value)}
                      className="partner-role-select"
                    >
                      <option value="editor">{t('settings.roleEditor')}</option>
                      <option value="viewer">{t('settings.roleViewer')}</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="partner-actions-footer">
                <button
                  type="button"
                  className="btn-unlink-partner"
                  onClick={() => setShowUnlinkModal(true)}
                >
                  <UserMinus size={15} />
                  <span>{t('settings.unlinkPartner')}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="partner-invite-box">
              <div className="role-selection-group">
                <label className="section-mini-label">{t('settings.partnerRole')}</label>
                <div className="role-cards-grid">
                  <div 
                    className={`role-option-card ${selectedRole === 'editor' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('editor')}
                  >
                    <div className="role-card-radio">
                      <div className={`radio-dot ${selectedRole === 'editor' ? 'checked' : ''}`} />
                    </div>
                    <div className="role-card-content">
                      <div className="role-card-title">{t('settings.roleEditor')}</div>
                      <div className="role-card-desc">{t('settings.roleEditorDesc')}</div>
                    </div>
                  </div>

                  <div 
                    className={`role-option-card ${selectedRole === 'viewer' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('viewer')}
                  >
                    <div className="role-card-radio">
                      <div className={`radio-dot ${selectedRole === 'viewer' ? 'checked' : ''}`} />
                    </div>
                    <div className="role-card-content">
                      <div className="role-card-title">{t('settings.roleViewer')}</div>
                      <div className="role-card-desc">{t('settings.roleViewerDesc')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {inviteUrl ? (
                <div className="invite-link-display">
                  <div className="invite-url-field">
                    <input 
                      type="text" 
                      readOnly 
                      value={inviteUrl} 
                      className="invite-url-input"
                    />
                    <button 
                      type="button" 
                      className="btn-copy-link"
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                      <span>{copied ? (language === 'id' ? 'Tersalin!' : 'Copied!') : t('settings.copyInviteLink')}</span>
                    </button>
                  </div>

                  <div className="invite-share-row">
                    <a 
                      href={whatsAppUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-share-whatsapp"
                    >
                      <MessageCircle size={17} />
                      <span>{t('settings.sendViaWhatsApp')}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <button 
                  type="button" 
                  className="btn-generate-invite"
                  onClick={handleGenerateInvite}
                  disabled={isGenerating}
                >
                  <Share2 size={16} />
                  <span>{isGenerating ? '...' : t('settings.generateInvite')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Backup & Restore Data */}
        <div className="card backup-restore-card">
          <div className="backup-card-header">
            <div className="icon-badge-theme">
              <Database size={22} />
            </div>
            <div>
              <h3>{t('settings.backupRestore')}</h3>
              <p>{t('settings.backupDesc')}</p>
            </div>
          </div>

          <div className="backup-actions-grid">
            <button 
              type="button"
              className="btn-backup-action"
              onClick={handleDownloadBackup}
              disabled={isExporting}
            >
              <div className="btn-action-icon">
                <Download size={18} />
              </div>
              <div className="btn-action-text">
                <span className="btn-action-title">
                  {isExporting ? '...' : t('settings.downloadBackup')}
                </span>
                <span className="btn-action-desc">JSON file • Instant</span>
              </div>
            </button>

            <label className="btn-backup-action">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }} 
              />
              <div className="btn-action-icon">
                <Upload size={18} />
              </div>
              <div className="btn-action-text">
                <span className="btn-action-title">{t('settings.restoreBackup')}</span>
                <span className="btn-action-desc">Upload & Preview</span>
              </div>
            </label>
          </div>
        </div>

        {/* Account Management */}
        <div className="card danger-zone-card">
          <h3>{t('settings.accountMgmt')}</h3>
          <p>{t('settings.accountMgmtDesc')}</p>
          <button className="btn-danger-outline" onClick={() => setShowDeleteModal(true)}><RotateCcw size={16} /> {t('settings.deleteAccount')}</button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowProfileModal(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(11, 14, 23, 0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}
        >
          <div className="card profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => setShowProfileModal(false)} 
              className="welcome-close-btn"
              aria-label="Tutup"
            >
              <X size={18} />
            </button>

            <div className="profile-modal-header">
              <div className="profile-modal-badge">
                <Edit3 size={22} />
              </div>
              <div>
                <h3>{t('settings.editProfile')}</h3>
                <p>
                  {language === 'id' 
                    ? 'Perbarui detail pernikahan dan nama pasangan Anda' 
                    : 'Update your wedding and couple details'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="profile-form-grid">
              {/* Avatar Section */}
              <div className="profile-avatar-edit-section">
                <div className="profile-avatar-frame">
                  {profileForm.avatar_url ? (
                    <img src={profileForm.avatar_url} alt="Avatar" />
                  ) : (
                    <Users size={32} color="var(--color-primary)" style={{ opacity: 0.8 }} />
                  )}
                </div>
                <input 
                  type="file" 
                  id="avatarUpload" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
                <label htmlFor="avatarUpload" className="profile-upload-pill">
                  <Camera size={13} />
                  <span>{language === 'id' ? 'Unggah Foto' : 'Upload Photo'}</span>
                </label>
              </div>

              {/* Names Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="profile-field-group">
                  <label className="profile-field-label">
                    <User size={14} className="label-icon" />
                    {t('settings.yourName')}
                  </label>
                  <input 
                    type="text" 
                    value={profileForm.partner_1_name} 
                    onChange={e => setProfileForm({...profileForm, partner_1_name: e.target.value})} 
                    required 
                    className="profile-input" 
                    placeholder={language === 'id' ? 'Nama Anda' : 'Your name'}
                  />
                </div>
                <div className="profile-field-group">
                  <label className="profile-field-label">
                    <Heart size={14} className="label-icon" />
                    {t('settings.partnerName')}
                  </label>
                  <input 
                    type="text" 
                    value={profileForm.partner_2_name} 
                    onChange={e => setProfileForm({...profileForm, partner_2_name: e.target.value})} 
                    required 
                    className="profile-input" 
                    placeholder={language === 'id' ? 'Nama Pasangan' : "Partner's name"}
                  />
                </div>
              </div>

              {/* Wedding Date */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Calendar size={14} className="label-icon" />
                  {t('settings.weddingDate')}
                </label>
                <input 
                  type="date" 
                  value={profileForm.wedding_date} 
                  onChange={e => setProfileForm({...profileForm, wedding_date: e.target.value})} 
                  className="profile-input" 
                />
              </div>

              {/* Location */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <MapPin size={14} className="label-icon" />
                  {t('settings.location')}
                </label>
                <input 
                  type="text" 
                  value={profileForm.wedding_location} 
                  onChange={e => setProfileForm({...profileForm, wedding_location: e.target.value})} 
                  placeholder={language === 'id' ? 'cth: Bali, Indonesia' : 'e.g., Bali, Indonesia'} 
                  className="profile-input" 
                />
              </div>

              {/* Actions */}
              <div className="profile-modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowProfileModal(false)}
                >
                  {t('vendor.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Sparkles size={16} />
                  <span>{t('budget.save')}</span>
                </button>
              </div>
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
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)', marginBottom: '15px', backgroundColor: 'var(--color-surface-solid)', color: 'var(--color-text)' }}
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

      {/* Restore Backup Modal */}
      {showRestoreModal && restorePreview && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card restore-modal-card">
            <button 
              onClick={() => { setShowRestoreModal(false); setRestorePreview(null); }} 
              style={{ position: 'absolute', right: '16px', top: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
            >
              <X size={20} />
            </button>

            <div className="restore-modal-header">
              <div className="icon-badge-theme">
                <Database size={22} />
              </div>
              <div>
                <h3>{t('settings.restoreModalTitle')}</h3>
                <p>{t('settings.restoreModalSubtitle')}</p>
              </div>
            </div>

            {/* File info */}
            <div className="restore-file-info">
              <div className="info-row">
                <span className="info-label">💍 {t('settings.restoreFileCouple')}:</span>
                <span className="info-value highlight">{restorePreview.couple}</span>
              </div>
              <div className="info-row">
                <span className="info-label">📅 {t('settings.restoreFileDate')}:</span>
                <span className="info-value">
                  {restorePreview.exported_at ? new Date(restorePreview.exported_at).toLocaleString() : '-'}
                </span>
              </div>
            </div>

            {/* Summary statistics */}
            <div className="restore-summary-section">
              <label className="section-label">{t('settings.restoreDataSummary')}</label>
              <div className="restore-chips-grid">
                <div className="restore-chip">
                  <span className="chip-name">Tugas / Jadwal</span>
                  <span className="chip-count">{restorePreview.counts.tasks}</span>
                </div>
                <div className="restore-chip">
                  <span className="chip-name">Pengeluaran</span>
                  <span className="chip-count">{restorePreview.counts.expenses}</span>
                </div>
                <div className="restore-chip">
                  <span className="chip-name">Vendor</span>
                  <span className="chip-count">{restorePreview.counts.vendors}</span>
                </div>
                <div className="restore-chip">
                  <span className="chip-name">Daftar Tamu</span>
                  <span className="chip-count">{restorePreview.counts.guests}</span>
                </div>
              </div>
            </div>

            {/* Mode selection */}
            <div className="restore-mode-selection">
              <label className="section-label">{t('settings.restoreMode')}</label>
              
              <div 
                className={`restore-mode-card ${restoreMode === 'replace' ? 'selected' : ''}`}
                onClick={() => setRestoreMode('replace')}
              >
                <div className={`radio-circle ${restoreMode === 'replace' ? 'checked' : ''}`} />
                <div className="mode-text">
                  <h4>{t('settings.restoreModeReplace')}</h4>
                  <p>{t('settings.restoreModeReplaceDesc')}</p>
                </div>
              </div>

              <div 
                className={`restore-mode-card ${restoreMode === 'merge' ? 'selected' : ''}`}
                onClick={() => setRestoreMode('merge')}
              >
                <div className={`radio-circle ${restoreMode === 'merge' ? 'checked' : ''}`} />
                <div className="mode-text">
                  <h4>{t('settings.restoreModeMerge')}</h4>
                  <p>{t('settings.restoreModeMergeDesc')}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="restore-modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => { setShowRestoreModal(false); setRestorePreview(null); }}
                disabled={isImporting}
              >
                {t('vendor.cancel')}
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={handleConfirmRestore}
                disabled={isImporting}
              >
                {isImporting ? t('settings.restoring') : t('settings.restoreConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Unlink Partner Confirmation Modal */}
      {showUnlinkModal && (
        <div 
          className="modal-overlay" 
          onClick={() => { if (!isUnlinking) { setShowUnlinkModal(false); setUnlinkError(''); } }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(11, 14, 23, 0.65)', 
            backdropFilter: 'blur(10px)', 
            WebkitBackdropFilter: 'blur(10px)', 
            zIndex: 1150, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '16px' 
          }}
        >
          <div className="card unlink-modal-card" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              onClick={() => { if (!isUnlinking) { setShowUnlinkModal(false); setUnlinkError(''); } }} 
              className="welcome-close-btn"
              aria-label="Tutup"
              disabled={isUnlinking}
            >
              <X size={18} />
            </button>

            <div className="unlink-modal-header">
              <div className="unlink-badge-glow">
                <UserMinus size={24} />
              </div>
              <div>
                <h3 className="unlink-modal-title">{t('settings.unlinkModalTitle')}</h3>
                <p className="unlink-modal-subtitle">{t('settings.unlinkModalSubtitle')}</p>
              </div>
            </div>

            {/* Target Partner Identity Card */}
            <div className="unlink-target-partner-box">
              <div className="unlink-partner-avatar">
                {(partnerDisplayName || 'P').charAt(0).toUpperCase()}
              </div>
              <div className="unlink-partner-info">
                <div className="unlink-partner-name">{partnerDisplayName}</div>
                <div className="unlink-partner-meta">
                  <span className={`partner-role-tag ${effectivePartnerRole}`}>
                    {effectivePartnerRole === 'editor' ? t('settings.roleEditor') : t('settings.roleViewer')}
                  </span>
                  <span className="unlink-connected-indicator">
                    <span className="dot-pulse" />
                    <span>{t('settings.partnerConnected')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Impact Details Notice */}
            <div className="unlink-impact-card">
              <div className="unlink-impact-header">
                <ShieldAlert size={16} />
                <span>{t('settings.unlinkNoticeTitle')}</span>
              </div>
              <ul className="unlink-impact-list">
                <li>
                  <span className="impact-bullet">•</span>
                  <span>{t('settings.unlinkNotice1')}</span>
                </li>
                <li>
                  <span className="impact-bullet">•</span>
                  <span>{t('settings.unlinkNotice2')}</span>
                </li>
                <li>
                  <span className="impact-bullet">•</span>
                  <span>{t('settings.unlinkNotice3')}</span>
                </li>
              </ul>
            </div>

            {unlinkError && (
              <div className="unlink-error-box">
                <AlertTriangle size={16} />
                <span>{unlinkError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="unlink-modal-actions">
              <button 
                type="button" 
                className="btn-unlink-cancel" 
                onClick={() => { setShowUnlinkModal(false); setUnlinkError(''); }}
                disabled={isUnlinking}
              >
                {t('vendor.cancel')}
              </button>
              <button 
                type="button" 
                className="btn-unlink-confirm" 
                onClick={handleUnlinkPartner}
                disabled={isUnlinking}
              >
                {isUnlinking ? (
                  <>
                    <span className="unlink-btn-spinner" />
                    <span>{t('settings.unlinking')}</span>
                  </>
                ) : (
                  <>
                    <UserMinus size={16} />
                    <span>{t('settings.unlinkButtonConfirm')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success Toast (Zero native alert popups) */}
      {unlinkSuccessToast && (
        <div className="amara-floating-toast">
          <div className="toast-icon-box">
            <CheckCircle2 size={20} />
          </div>
          <div className="toast-body">
            <div className="toast-title">{t('settings.unlinkSuccess')}</div>
            <div className="toast-sub">
              {language === 'id' 
                ? 'Akses kolaborasi pasangan telah berhasil diputuskan.' 
                : 'Partner collaboration access has been revoked.'}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
