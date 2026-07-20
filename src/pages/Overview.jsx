import { Link } from 'react-router-dom';
import useWeddingStore from '../store/useWeddingStore';
import '../styles/Overview.css';

const Overview = () => {
  const { tasks, budgets, expenses } = useWeddingStore();

  // Tasks Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const incompleteTasks = tasks.filter(t => !t.is_completed).slice(0, 3);

  // Budget Calculation
  const targetAmount = budgets?.total_fund || 0;
  const incomes = expenses.filter(e => e.type === 'income');
  const outgoings = expenses.filter(e => e.type === 'expense');
  
  const totalCollected = incomes.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalSpent = outgoings.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const remaining = totalCollected - totalSpent;
  const budgetSpentPercentage = totalCollected > 0 ? Math.min((totalSpent / totalCollected) * 100, 100).toFixed(0) : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

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
            <span className="progress-percentage">{tasksProgress}%</span>
            <span className="progress-text">Tasks Done<br/>{completedTasks}/{totalTasks}</span>
          </div>
        </div>

        {/* Budget Snapshot */}
        <div className="card budget-snapshot-card">
          <h3>Budget Snapshot</h3>
          <div className="budget-info">
            <div className="budget-item">
              <span className="budget-label">Collected Fund</span>
              <span className="budget-value">{formatCurrency(totalCollected)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Spent</span>
              <span className="budget-value">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">Remaining</span>
              <span className="budget-value">{formatCurrency(remaining)}</span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${budgetSpentPercentage}%` }}></div>
          </div>
        </div>

        {/* Top Priority / Upcoming Tasks */}
        <div className="card priority-card">
          <div className="priority-header">
            <h3>Pending Tasks</h3>
            <Link to="/activities" className="btn-text" style={{ textDecoration: 'none' }}>View All</Link>
          </div>
          <ul className="task-list">
            {incompleteTasks.map((task, index) => (
              <li className={`task-item ${index === 0 ? 'high-priority' : index === 1 ? 'medium-priority' : 'low-priority'}`} key={task.id}>
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{task.category}</p>
                </div>
                <span className="priority-badge">{index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low'}</span>
              </li>
            ))}
            {incompleteTasks.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', paddingTop: '10px' }}>No pending tasks! You're all caught up.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
