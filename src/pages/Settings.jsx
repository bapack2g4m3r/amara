import { Bell, Lock, Globe, Moon, Ruler, Trash2, Users } from 'lucide-react';
import '../styles/Settings.css';

const Settings = () => {
  return (
    <div className="settings-container">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-grid">
        {/* Profile Card */}
        <div className="card profile-card">
          <div className="profile-info">
            <div className="profile-avatars">
              <div className="avatar-couple"></div>
            </div>
            <div className="profile-details">
              <h2>Julian & Elena</h2>
              <p className="date">August 24, 2025</p>
              <p className="location">📍 Bali, Indonesia</p>
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
    </div>
  );
};

export default Settings;
