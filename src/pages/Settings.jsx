import { useState } from 'react';
import { Bell, Lock, Globe, Moon, Ruler, Trash2, Users, Edit3, X } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Settings.css';

const Settings = () => {
  const { profile, updateProfile } = useWeddingStore();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    partner_1_name: profile?.partner_1_name || 'Partner 1',
    partner_2_name: profile?.partner_2_name || 'Partner 2',
    wedding_date: profile?.wedding_date || '',
    wedding_location: profile?.wedding_location || ''
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await updateProfile(profileForm);
    setShowProfileModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="settings-container">
      <header className="page-header">
        <h1>Settings</h1>
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
                wedding_location: profile?.wedding_location || ''
              });
              setShowProfileModal(true);
            }} 
            style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
          >
            <Edit3 size={18} />
          </button>
          
          <div className="profile-info">
            <div className="profile-avatars">
              <div className="avatar-couple"></div>
            </div>
            <div className="profile-details">
              <h2>{profile?.partner_1_name || 'Partner 1'} & {profile?.partner_2_name || 'Partner 2'}</h2>
              <p className="date">{formatDate(profile?.wedding_date)}</p>
              <p className="location">📍 {profile?.wedding_location || 'Location not set'}</p>
            </div>
          </div>
          <button className="btn-primary btn-full">VIEW PUBLIC SITE</button>
        </div>

        {/* Account Settings */}
        <div className="card account-settings-card">
          <h3>Account Settings</h3>
          <ul className="settings-list">
            <li className="settings-item">
              <div className="icon-box-small"><Bell size={18} /></div>
              <div className="item-text">
                <h4>Notifications</h4>
                <p>Push, Email & Alerts</p>
              </div>
              <span className="arrow-right">›</span>
            </li>
            <li className="settings-item">
              <div className="icon-box-small"><Lock size={18} /></div>
              <div className="item-text">
                <h4>Privacy</h4>
                <p>Manage visibility & data</p>
              </div>
              <span className="arrow-right">›</span>
            </li>
            <li className="settings-item">
              <div className="icon-box-small"><Globe size={18} /></div>
              <div className="item-text">
                <h4>Language</h4>
                <p>English (United States)</p>
              </div>
              <span className="arrow-right">›</span>
            </li>
          </ul>
        </div>

        {/* Collaboration */}
        <div className="card collaboration-card">
          <div className="card-top">
            <h3>Invite Partner</h3>
            <Users size={20} className="icon-white" />
          </div>
          <p className="card-desc">Plan your big day together. Share tasks, budgets, and guest lists in real-time.</p>
          <button className="btn-primary-outline btn-full">SEND INVITE LINK</button>
        </div>

        {/* App Preferences */}
        <div className="card preferences-card">
          <h3>App Preferences</h3>
          <ul className="settings-list">
            <li className="settings-item">
              <div className="icon-box-small"><Moon size={18} /></div>
              <div className="item-text">
                <h4>Dark Mode</h4>
                <p>Switch to dark interface</p>
              </div>
              <div className="toggle-switch"></div>
            </li>
            <li className="settings-item">
              <div className="icon-box-small"><Ruler size={18} /></div>
              <div className="item-text">
                <h4>Measurement Units</h4>
                <p>Imperial (ft, in)</p>
              </div>
              <button className="btn-text">CHANGE</button>
            </li>
          </ul>
        </div>

        {/* Account Management */}
        <div className="card danger-zone-card">
          <h3>Account Management</h3>
          <p>Permanently delete your account and all wedding data.</p>
          <button className="btn-danger-outline"><Trash2 size={16} /> DELETE ACCOUNT</button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setShowProfileModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Your Name</label>
                  <input type="text" value={profileForm.partner_1_name} onChange={e => setProfileForm({...profileForm, partner_1_name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Partner's Name</label>
                  <input type="text" value={profileForm.partner_2_name} onChange={e => setProfileForm({...profileForm, partner_2_name: e.target.value})} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Wedding Date</label>
                <input type="date" value={profileForm.wedding_date} onChange={e => setProfileForm({...profileForm, wedding_date: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>Location</label>
                <input type="text" value={profileForm.wedding_location} onChange={e => setProfileForm({...profileForm, wedding_location: e.target.value})} placeholder="e.g., Bali, Indonesia" style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
