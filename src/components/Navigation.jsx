import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Calendar, DollarSign, Users, UserPlus, Settings, LogOut, MoreHorizontal, X } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Navigation.css';

const Navigation = () => {
  const { signOut } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  // Close more menu when route changes
  useEffect(() => {
    setShowMore(false);
  }, [location]);

  const mainNavItems = [
    { path: '/overview', icon: <Home size={20} />, label: t('nav.overview') },
    { path: '/activities', icon: <CheckSquare size={20} />, label: t('nav.activities') },
    { path: '/timeline', icon: <Calendar size={20} />, label: t('nav.timeline') },
    { path: '/budget', icon: <DollarSign size={20} />, label: t('nav.budget') },
  ];

  const moreNavItems = [
    { path: '/vendor', icon: <Users size={20} />, label: t('nav.vendor') },
    { path: '/guest-list', icon: <UserPlus size={20} />, label: t('nav.guestList') },
    { path: '/settings', icon: <Settings size={20} />, label: t('nav.settings') },
  ];

  const isMoreActive = moreNavItems.some(item => location.pathname === item.path);

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <nav className="navigation desktop-nav">
        <img src="/amara-logo-full.png" alt="Amara Logo" className="nav-logo" />
        <ul className="nav-list">
          {[...mainNavItems, ...moreNavItems].map((item) => (
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
            className="btn-logout" 
            onClick={signOut} 
          >
            <LogOut size={20} />
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="navigation mobile-nav">
        <ul className="nav-list">
          {mainNavItems.map((item) => (
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
          <li className="nav-item">
            <button 
              className={`nav-link ${isMoreActive ? 'active' : ''} ${showMore ? 'open' : ''}`}
              onClick={() => setShowMore(!showMore)}
            >
              <MoreHorizontal size={20} />
              <span>{t('nav.more') || 'Lainnya'}</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Mobile More Bottom Sheet Menu */}
      {showMore && (
        <div className="more-menu-overlay" onClick={() => setShowMore(false)}>
          <div className="more-menu-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="more-menu-header">
              <h4>{t('nav.more') || 'Lainnya'}</h4>
              <button className="btn-close-more" onClick={() => setShowMore(false)}>
                <X size={20} />
              </button>
            </div>
            <ul className="more-menu-list">
              {moreNavItems.map((item) => (
                <li key={item.path} className="more-menu-item">
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => isActive ? 'more-menu-link active' : 'more-menu-link'}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
              <li className="more-menu-item">
                <button 
                  className="more-menu-link btn-logout-mobile" 
                  onClick={signOut} 
                >
                  <LogOut size={20} />
                  <span>{t('nav.logout')}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
