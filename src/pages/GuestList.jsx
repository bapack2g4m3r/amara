import { Plus, Search, Users, Star, Clock, CheckCircle2 } from 'lucide-react';
import '../styles/GuestList.css';

const GuestList = () => {
  return (
    <div className="guest-list-container">
      <header className="page-header">
        <h1>Guest List Manager</h1>
        <p className="subtitle">Manage your loved ones and track their attendance effortlessly.</p>
      </header>

      <button className="btn-primary btn-add-guest"><Plus size={18} /> ADD NEW GUEST</button>

      <div className="guest-stats-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-purple"><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Guests</span>
            <span className="stat-value">184</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-red"><Star size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">VIP</span>
            <span className="stat-value">42</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-orange"><Clock size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Pending</span>
            <span className="stat-value">56</span>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-green"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Confirmed</span>
            <span className="stat-value">128</span>
          </div>
        </div>
      </div>

      <div className="search-filter-section">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search by name or category..." className="search-input" />
        </div>
        <div className="filter-pills">
          <span className="pill active">All Guests</span>
          <span className="pill">VIP</span>
          <span className="pill">Family</span>
          <span className="pill">Friends</span>
        </div>
      </div>

      <div className="guest-table-container">
        <table className="guest-table">
          <thead>
            <tr>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th className="text-right">PAX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="guest-user-info">
                  <div className="avatar">JD</div>
                  <div className="user-details">
                    <span className="user-name">Julianne & David Smith</span>
                    <span className="user-email">jsmith@example.com</span>
                  </div>
                </div>
              </td>
              <td><span className="badge-category">Friends</span></td>
              <td className="text-right">2</td>
            </tr>
            <tr>
              <td>
                <div className="guest-user-info">
                  <div className="avatar bg-yellow">MR</div>
                  <div className="user-details">
                    <span className="user-name">Marcus Rodriguez</span>
                    <span className="user-email">m.rod@webmail.com</span>
                  </div>
                </div>
              </td>
              <td><span className="badge-category vip">VIP Family</span></td>
              <td className="text-right">1</td>
            </tr>
            <tr>
              <td>
                <div className="guest-user-info">
                  <div className="avatar bg-blue">AF</div>
                  <div className="user-details">
                    <span className="user-name">Anderson Family</span>
                    <span className="user-email">sarah.anderson@home.com</span>
                  </div>
                </div>
              </td>
              <td><span className="badge-category">Family</span></td>
              <td className="text-right">4</td>
            </tr>
            <tr>
              <td>
                <div className="guest-user-info">
                  <div className="avatar bg-green">LB</div>
                  <div className="user-details">
                    <span className="user-name">Linda Bennett</span>
                    <span className="user-email">lbennett@corp.com</span>
                  </div>
                </div>
              </td>
              <td><span className="badge-category">Corporate</span></td>
              <td className="text-right">1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GuestList;
