import '../styles/Timeline.css';

const Timeline = () => {
  return (
    <div className="timeline-container">
      <header className="page-header">
        <h1>Our Wedding Timeline</h1>
        <p className="subtitle">124 Days To Go • Bali, Indonesia</p>
      </header>

      <div className="timeline-grid">
        <div className="card overview-card">
          <div className="progress-header">
            <div>
              <h3>Overall Progress</h3>
              <div className="progress-percentage">64%</div>
            </div>
            <div className="tasks-done">
              <span className="label">Tasks Done</span>
              <span className="value">42/65</span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '64%' }}></div>
          </div>
        </div>

        <div className="card event-log-card">
          <h3>Event Log</h3>
          <div className="event-filters">
            <span className="filter active"><span className="dot completed"></span> Completed</span>
            <span className="filter"><span className="dot in-progress"></span> In Progress</span>
            <span className="filter"><span className="dot scheduled"></span> Scheduled</span>
          </div>

          <div className="timeline-list">
            <div className="timeline-item completed">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Venue Deposit Paid</h4>
                <p>April 12, 2024</p>
              </div>
              <span className="status-badge completed">Completed</span>
            </div>
            
            <div className="timeline-item completed">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Catering Selection Finalized</h4>
                <p>April 28, 2024</p>
              </div>
              <span className="status-badge completed">Completed</span>
            </div>

            <div className="timeline-item in-progress">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Moodboard & Decoration Design</h4>
                <p>May 5, 2024</p>
              </div>
              <span className="status-badge in-progress">In Progress</span>
            </div>

            <div className="timeline-item scheduled">
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <h4>Guest List Final Review</h4>
                <p>May 18, 2024</p>
              </div>
              <span className="status-badge scheduled">Scheduled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
