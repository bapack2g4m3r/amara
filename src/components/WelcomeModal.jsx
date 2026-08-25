import { useState } from 'react';
import { Heart, MapPin, Calendar } from 'lucide-react';
import { useTranslation } from '../store/useLanguageStore';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/WelcomeModal.css';

const WelcomeModal = ({ onComplete }) => {
  const { t, language } = useTranslation();
  const { updateProfile } = useWeddingStore();
  
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

    localStorage.setItem('amara_onboarding_done', 'true');
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('amara_onboarding_done', 'true');
    onComplete();
  };

  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        {/* Gradient Header */}
        <div className="welcome-header">
          <span className="welcome-emoji">💍</span>
          <h2>{language === 'id' ? 'Selamat Datang di Amara!' : 'Welcome to Amara!'}</h2>
          <p>
            {language === 'id' 
              ? 'Yuk kenalan dulu! Lengkapi profil pernikahanmu agar pengalaman lebih personal.'
              : "Let's get to know you! Complete your wedding profile for a more personal experience."}
          </p>
        </div>

        {/* Form Body */}
        <div className="welcome-body">
          <form className="welcome-form" onSubmit={handleSave}>
            {/* Avatar */}
            <div className="welcome-avatar-section">
              <div className="welcome-avatar-circle">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="Avatar" />
                ) : (
                  <Heart size={30} color="var(--color-primary)" />
                )}
              </div>
              <input type="file" id="welcomeAvatarUpload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              <label htmlFor="welcomeAvatarUpload" className="welcome-upload-label">
                {language === 'id' ? '📷 Unggah Foto' : '📷 Upload Photo'}
              </label>
            </div>

            {/* Names Row */}
            <div className="welcome-form-row">
              <div className="welcome-field">
                <label><span className="field-icon">👤</span>{t('settings.yourName')}</label>
                <input 
                  type="text" 
                  value={form.partner_1_name} 
                  onChange={e => setForm({...form, partner_1_name: e.target.value})} 
                  placeholder={language === 'id' ? 'Nama kamu' : 'Your name'}
                />
              </div>
              <div className="welcome-field">
                <label><span className="field-icon">💕</span>{t('settings.partnerName')}</label>
                <input 
                  type="text" 
                  value={form.partner_2_name} 
                  onChange={e => setForm({...form, partner_2_name: e.target.value})} 
                  placeholder={language === 'id' ? 'Nama pasangan' : "Partner's name"}
                />
              </div>
            </div>

            {/* Wedding Date */}
            <div className="welcome-field">
              <label><Calendar size={14} className="field-icon" />{t('settings.weddingDate')}</label>
              <input 
                type="date" 
                value={form.wedding_date} 
                onChange={e => setForm({...form, wedding_date: e.target.value})}
              />
            </div>

            {/* Location */}
            <div className="welcome-field">
              <label><MapPin size={14} className="field-icon" />{t('settings.location')}</label>
              <input 
                type="text" 
                value={form.wedding_location} 
                onChange={e => setForm({...form, wedding_location: e.target.value})} 
                placeholder={language === 'id' ? 'cth: Bali, Indonesia' : 'e.g., Bali, Indonesia'}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="welcome-footer">
          <button className="welcome-btn-save" onClick={handleSave}>
            {language === 'id' ? '✨ Simpan & Mulai' : '✨ Save & Start'}
          </button>
          <button className="welcome-btn-skip" onClick={handleSkip}>
            {language === 'id' ? 'Lewati untuk sekarang' : 'Skip for now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
