import { useState } from 'react';
import { Heart, MapPin, Calendar, User, Camera, Sparkles, X } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';
import useWeddingStore from '../store/useWeddingStore';
import useAuthStore from '../store/useAuthStore';
import '../styles/WelcomeModal.css';

const WelcomeModal = ({ onComplete }) => {
  const { t, language } = useTranslation();
  const { updateProfile, myProfile } = useWeddingStore();
  const { user } = useAuthStore();

  if (myProfile?.wedding_owner_id) {
    return null;
  }
  
  const [form, setForm] = useState({
    partner_1_name: '',
    partner_2_name: '',
    wedding_date: '',
    wedding_location: '',
    avatar_url: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 200;
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setForm({ ...form, avatar_url: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const profileData = {};
    if (form.partner_1_name.trim()) profileData.partner_1_name = form.partner_1_name.trim();
    if (form.partner_2_name.trim()) profileData.partner_2_name = form.partner_2_name.trim();
    if (form.wedding_date) profileData.wedding_date = form.wedding_date;
    if (form.wedding_location.trim()) profileData.wedding_location = form.wedding_location.trim();
    if (form.avatar_url) profileData.avatar_url = form.avatar_url;

    if (Object.keys(profileData).length > 0) {
      await updateProfile(profileData);
    }

    if (user?.id) {
      localStorage.setItem(`amara_onboarding_done_${user.id}`, 'true');
    }
    sessionStorage.setItem('amara_onboarding_session_done', 'true');
    onComplete();
  };

  const handleSkip = () => {
    if (user?.id) {
      localStorage.setItem(`amara_onboarding_done_${user.id}`, 'true');
    }
    sessionStorage.setItem('amara_onboarding_session_done', 'true');
    onComplete();
  };

  return (
    <div className="welcome-overlay" onClick={handleSkip}>
      <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          type="button" 
          className="welcome-close-btn" 
          onClick={handleSkip}
          aria-label="Tutup"
        >
          <X size={18} />
        </button>

        {/* Elegant Header */}
        <div className="welcome-header">
          <div className="welcome-badge-glow">
            <Sparkles size={22} className="welcome-badge-icon" />
          </div>
          <h2 className="welcome-title">
            {language === 'id' ? 'Selamat Datang di Amara' : 'Welcome to Amara'}
          </h2>
          <p className="welcome-subtitle">
            {language === 'id' 
              ? 'Lengkapi profil pernikahan Anda untuk pengalaman perencanaan yang lebih personal.'
              : 'Complete your wedding profile to personalize your planning journey.'}
          </p>
        </div>

        {/* Form Body */}
        <div className="welcome-body">
          <form className="welcome-form" onSubmit={handleSave}>
            {/* Avatar Section */}
            <div className="welcome-avatar-section">
              <div className="welcome-avatar-circle">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Avatar" />
                ) : (
                  <Heart size={28} className="welcome-avatar-heart" />
                )}
              </div>
              <input 
                type="file" 
                id="welcomeAvatarUpload" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }} 
              />
              <label htmlFor="welcomeAvatarUpload" className="welcome-upload-label">
                <Camera size={13} />
                <span>{language === 'id' ? 'Unggah Foto' : 'Upload Photo'}</span>
              </label>
            </div>

            {/* Names Row */}
            <div className="welcome-form-row">
              <div className="welcome-field">
                <label>
                  <User size={14} className="field-icon" />
                  {t('settings.yourName')}
                </label>
                <input 
                  type="text" 
                  value={form.partner_1_name} 
                  onChange={e => setForm({...form, partner_1_name: e.target.value})} 
                  placeholder={language === 'id' ? 'Nama Anda' : 'Your name'}
                />
              </div>
              <div className="welcome-field">
                <label>
                  <Heart size={14} className="field-icon" />
                  {t('settings.partnerName')}
                </label>
                <input 
                  type="text" 
                  value={form.partner_2_name} 
                  onChange={e => setForm({...form, partner_2_name: e.target.value})} 
                  placeholder={language === 'id' ? 'Nama Pasangan' : "Partner's name"}
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div className="welcome-field">
              <label>
                <Calendar size={14} className="field-icon" />
                {t('settings.weddingDate')}
              </label>
              <input 
                type="date" 
                value={form.wedding_date} 
                onChange={e => setForm({...form, wedding_date: e.target.value})}
              />
            </div>

            {/* Location */}
            <div className="welcome-field">
              <label>
                <MapPin size={14} className="field-icon" />
                {t('settings.location')}
              </label>
              <input 
                type="text" 
                value={form.wedding_location} 
                onChange={e => setForm({...form, wedding_location: e.target.value})} 
                placeholder={language === 'id' ? 'cth: Bali, Indonesia' : 'e.g., Bali, Indonesia'}
              />
            </div>

            {/* Footer Buttons */}
            <div className="welcome-footer">
              <button type="submit" className="welcome-btn-save">
                <Sparkles size={16} />
                <span>{language === 'id' ? 'Simpan & Mulai' : 'Save & Start'}</span>
              </button>
              <button type="button" className="welcome-btn-skip" onClick={handleSkip}>
                {language === 'id' ? 'Lewati untuk sekarang' : 'Skip for now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
