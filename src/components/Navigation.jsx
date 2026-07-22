import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Calendar, DollarSign, Users, UserPlus, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Navigation.css';

const Navigation = () => {
  const { signOut } = useAuthStore();
  const { t } = useTranslation();

  const navItems = [
    { path: '/overview', icon: <Home size={20} />, label: t('nav.overview') },
    { path: '/activities', icon: <CheckSquare size={20} />, label: t('nav.activities') },
    { path: '/timeline', icon: <Calendar size={20} />, label: t('nav.timeline') },
    { path: '/budget', icon: <DollarSign size={20} />, label: t('nav.budget') },
    { path: '/vendor', icon: <Users size={20} />, label: t('nav.vendor') },
    { path: '/guest-list', icon: <UserPlus size={20} />, label: t('nav.guestList') },
    { path: '/settings', icon: <Settings size={20} />, label: t('nav.settings') },
  ];

  return (
    <nav className="navigation">
      <div className="nav-logo">Amara</div>
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink 
              to={item.path} 
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-footer">
        <button 
          className="nav-item btn-logout" 
          onClick={signOut} 
        >
          <LogOut size={20} />
          <span>{t('nav.logout')}</span>
        </button>
      </div>
    </nav>
  );
};
export default Navigation;
