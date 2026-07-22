import { Link } from 'react-router-dom';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/Overview.css';

const Overview = () => {
  const { tasks, budgets, expenses, profile } = useWeddingStore();
  const { t } = useTranslation();

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

  // Countdown Calculation
  let daysUntil = 0;
  let monthsUntil = 0;
  let weeksUntil = 0;
  let daysLeftUntil = 0;
  
  if (profile?.wedding_date) {
    const today = new Date();
    const weddingDate = new Date(profile.wedding_date);
    const diffTime = weddingDate - today;
    
    if (diffTime > 0) {
      daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      monthsUntil = Math.floor(daysUntil / 30);
      weeksUntil = Math.floor((daysUntil % 30) / 7);
      daysLeftUntil = daysUntil % 30 % 7;
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="overview-container">
      <header className="page-header">
        <h1>
          {t('overview.title')}
          {profile?.partner_1_name && profile?.partner_2_name ? `, ${profile.partner_1_name} & ${profile.partner_2_name}` : ''}
        </h1>
        <p className="subtitle">{t('overview.subtitle')}</p>
      </header>
      
      <div className="dashboard-grid">
        {/* Countdown Card */}
        <div className="card countdown-card">
          <div className="countdown-content">
            <h2>{profile?.wedding_date ? `${daysUntil} ${t('overview.days')}` : t('overview.dateNotSet')}</h2>
            <p>{t('overview.until')}</p>
            <div className="countdown-timer">
              <div className="time-box">
                <span className="time-value">{monthsUntil.toString().padStart(2, '0')}</span>
                <span className="time-label">{t('overview.months')}</span>
              </div>
              <div className="time-box">
                <span className="time-value">{weeksUntil.toString().padStart(2, '0')}</span>
                <span className="time-label">{t('overview.weeks')}</span>
              </div>
              <div className="time-box">
                <span className="time-value">{daysLeftUntil.toString().padStart(2, '0')}</span>
                <span className="time-label">{t('overview.days')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Card */}
        <div className="card progress-card">
          <div className="priority-header" style={{ width: '100%', marginBottom: 'var(--spacing-6)' }}>
            <h3 style={{ marginBottom: 0 }}>{t('overview.progressTitle')}</h3>
            <Link to="/timeline" className="btn-text" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('overview.viewAll')}</Link>
          </div>
          <div className="progress-circle">
            <span className="progress-percentage">{tasksProgress}%</span>
            <span className="progress-text">{t('overview.tasksDone')}<br/>{completedTasks}/{totalTasks}</span>
          </div>
        </div>

        {/* Budget Snapshot */}
        <div className="card budget-snapshot-card">
          <div className="priority-header">
            <h3 style={{ marginBottom: 0 }}>{t('overview.budgetTitle')}</h3>
            <Link to="/budget" className="btn-text" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('overview.viewAll')}</Link>
          </div>
          <div className="budget-info">
            <div className="budget-item">
              <span className="budget-label">{t('overview.budgetCollected')}</span>
              <span className="budget-value">{formatCurrency(totalCollected)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">{t('overview.budgetSpent')}</span>
              <span className="budget-value">{formatCurrency(totalSpent)}</span>
            </div>
            <div className="budget-item">
              <span className="budget-label">{t('overview.budgetRemaining')}</span>
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
            <h3>{t('overview.pendingTitle')}</h3>
            <Link to="/activities" className="btn-text" style={{ textDecoration: 'none' }}>{t('overview.viewAll')}</Link>
          </div>
          <ul className="task-list">
            {incompleteTasks.map((task, index) => {
              const priorityObj = index === 0 ? 'High' : index === 1 ? 'Medium' : 'Low';
              return (
              <li className={`task-item ${index === 0 ? 'high-priority' : index === 1 ? 'medium-priority' : 'low-priority'}`} key={task.id}>
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p>{t(`cat.${task.category}`)}</p>
                </div>
                <span className="priority-badge">{t(`priority.${priorityObj}`)}</span>
              </li>
              );
            })}
            {incompleteTasks.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', paddingTop: '10px' }}>{t('overview.noPending')}</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
