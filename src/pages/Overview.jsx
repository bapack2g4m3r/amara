import '../styles/Overview.css';

const Overview = () => {
  return (
    <div className="overview-container">
      <header className="page-header">
        <h1>Planning your big day</h1>
        <p className="subtitle">Here's where you stand right now.</p>
      </header>
      
      <div className="dashboard-grid">
        {/* Countdown Card */}
        <div className="card countdown-card">
          <div className="countdown-content">
            <h2>124 Days</h2>
            <p>until your perfect wedding.</p>
            <div className="countdown-timer">
              <div className="time-box">
                <span className="time-value">04</span>
                <span className="time-label">Months</span>
              </div>
              <div className="time-box">
                <span className="time-value">12</span>
                <span className="time-label">Weeks</span>
              </div>
              <div className="time-box">
                <span className="time-value">18</span>
                <span className="time-label">Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="card progress-card">
          <h3>Overall Progress</h3>
          <div className="progress-circle">
            <span className="progress-percentage">64%</span>
            <span className="progress-text">Tasks Done<br/>42/65</span>
          </div>
        </div>

        {/* Budget Snapshot */}
        <div className="card budget-snapshot-card">
          <h3>Budget Snapshot</h3>
          <div className="budget-info">
            <div className="budget-item">
              <span className="budget-label">Total Fund</span>
              <span className="budget-value">Rp 150.000k</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Spent</span>
              <span className="budget-value">Rp 100.000k</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Remaining</span>
              <span className="budget-value">Rp 50.000k</span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '66%' }}></div>
          </div>
        </div>

        {/* Top Priority / Upcoming Tasks */}
        <div className="card priority-card">
          <div className="priority-header">
            <h3>Top Priority</h3>
            <button className="btn-text">View All</button>
          </div>
          <ul className="task-list">
            <li className="task-item high-priority">
              <div className="task-info">
                <h4>Finalize vendor catering menu</h4>
                <p>Due in 2 days</p>
              </div>
              <span className="priority-badge">High</span>
            </li>
            <li className="task-item medium-priority">
              <div className="task-info">
                <h4>Confirm floral design & color palette</h4>
                <p>Due in 5 days</p>
              </div>
              <span className="priority-badge">Medium</span>
            </li>
            <li className="task-item low-priority">
              <div className="task-info">
                <h4>Final dress fitting</h4>
                <p>Due in 10 days</p>
              </div>
              <span className="priority-badge">Low</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
