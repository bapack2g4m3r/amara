import '../styles/Budget.css';
import { Plus, ChevronRight, Download } from 'lucide-react';

const Budget = () => {
  return (
    <div className="budget-container">
      <header className="page-header">
        <h1>Budget Manager</h1>
        <p className="subtitle">Track your wedding expenses easily</p>
      </header>

      <div className="budget-grid">
        {/* Main Budget Card */}
        <div className="card total-budget-card">
          <div className="budget-header">
            <h3>TOTAL WEDDING FUND</h3>
            <button className="btn-icon-light"><Download size={16} /></button>
          </div>
          <div className="total-amount">
            <h2>Rp 150.000k</h2>
            <div className="split-amount">
              <span>Rp 200.000k<br/>Target</span>
            </div>
          </div>
          <div className="progress-bar-bg-light">
            <div className="progress-bar-fill-light" style={{ width: '75%' }}></div>
          </div>
          <div className="budget-stats">
            <span>75% Collected</span>
            <span>Rp 50.000k Left</span>
          </div>
          <div className="budget-actions">
            <button className="btn-primary btn-full"><Plus size={16}/> ADD FUND</button>
            <button className="btn-secondary btn-full">DETAILS</button>
          </div>
        </div>

        {/* Honeymoon Fund Card */}
        <div className="card honeymoon-card">
          <div className="card-top">
            <h3>Honeymoon Fund</h3>
            <span className="badge">PREMIUM</span>
          </div>
          <p className="card-desc">Saving for Maldives getaway</p>
          <div className="amount-display">
            <h2>Rp 45.000k</h2>
          </div>
          <div className="progress-bar-bg-dark">
            <div className="progress-bar-fill-dark" style={{ width: '40%' }}></div>
          </div>
          <p className="progress-text">40% of target Rp 112.000k</p>
          <button className="btn-primary-outline btn-full">CONTRIBUTE</button>
        </div>

        {/* Budget Allocation */}
        <div className="card allocation-card">
          <div className="section-header">
            <h3>Budget Allocation</h3>
            <button className="btn-text">View All</button>
          </div>
          <ul className="allocation-list">
            <li className="allocation-item">
              <div className="icon-box bg-purple"><span className="icon">📍</span></div>
              <div className="item-details">
                <h4>Venue & Rentals</h4>
                <p>30% deposit paid</p>
              </div>
              <div className="item-amounts">
                <span className="spent">Rp 65.000k</span>
                <span className="total">/ Rp 100.000k</span>
              </div>
            </li>
            <li className="allocation-item">
              <div className="icon-box bg-orange"><span className="icon">🍴</span></div>
              <div className="item-details">
                <h4>Catering Services</h4>
                <p>50% deposit paid</p>
              </div>
              <div className="item-amounts">
                <span className="spent">Rp 40.000k</span>
                <span className="total">/ Rp 80.000k</span>
              </div>
            </li>
            <li className="allocation-item">
              <div className="icon-box bg-red"><span className="icon">🌸</span></div>
              <div className="item-details">
                <h4>Decoration & Florist</h4>
                <p>Fully Paid</p>
              </div>
              <div className="item-amounts">
                <span className="spent highlight-red">Rp 25.000k</span>
                <span className="total">Target Met</span>
              </div>
            </li>
          </ul>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity-card">
          <div className="section-header">
            <h3>Recent Activity</h3>
            <button className="btn-text">View All</button>
          </div>
          <ul className="activity-list">
            <li className="activity-item">
              <div className="icon-box-small"><span className="icon">💳</span></div>
              <div className="activity-details">
                <h4>Venue Deposit</h4>
                <p>Yesterday, 2:30 PM</p>
              </div>
              <div className="activity-amount negative">- Rp 15.000k</div>
            </li>
            <li className="activity-item">
              <div className="icon-box-small"><span className="icon">💸</span></div>
              <div className="activity-details">
                <h4>Transfer from Dad</h4>
                <p>2 days ago</p>
              </div>
              <div className="activity-amount positive">+ Rp 50.000k</div>
            </li>
            <li className="activity-item">
              <div className="icon-box-small"><span className="icon">💌</span></div>
              <div className="activity-details">
                <h4>Invitations Print</h4>
                <p>Aug 14, 2024</p>
              </div>
              <div className="activity-amount negative">- Rp 2.500k</div>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Budget;
