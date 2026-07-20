import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Calendar, DollarSign, Users, UserPlus, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import '../styles/Navigation.css';

const Navigation = () => {
  const { signOut } = useAuthStore();

  const navItems = [
    { path: '/overview', icon: <Home size={20} />, label: 'Overview' },
    { path: '/activities', icon: <CheckSquare size={20} />, label: 'Activities' },
    { path: '/timeline', icon: <Calendar size={20} />, label: 'Timeline' },
    { path: '/budget', icon: <DollarSign size={20} />, label: 'Budget' },
    { path: '/vendor', icon: <Users size={20} />, label: 'Vendor' },
    { path: '/guest-list', icon: <UserPlus size={20} />, label: 'Guest List' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
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
          <span>Log Out</span>
        </button>
      </div>
    </nav>
  );
};
export default Navigation;
