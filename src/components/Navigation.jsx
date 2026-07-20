import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Calendar, DollarSign, Users, UserPlus, Settings } from 'lucide-react';
import '../styles/Navigation.css';

const Navigation = () => {
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
    </nav>
  );
};
export default Navigation;
