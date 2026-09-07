import { Link } from 'react-router-dom';
import { Check, Calendar, AlertCircle } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { formatDate } from '../utils/dateFormatter';
import '../styles/Overview.css';

const Overview = () => {
  const { tasks, budgets, expenses, profile, updateTaskStatus } = useWeddingStore();
  const { t, language } = useTranslation();

  // Tasks Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const remainingTasks = totalTasks - completedTasks;

  // Helper to compute deadline urgency status
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTaskUrgency = (dueDateStr) => {
    if (!dueDateStr) return { status: 'none', daysDiff: null };
    const [y, m, d] = dueDateStr.split('-').map(Number);
    const dueDate = new Date(y, m - 1, d);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { status: 'overdue', daysDiff: Math.abs(diffDays) };
    if (diffDays === 0) return { status: 'today', daysDiff: 0 };
    if (diffDays <= 7) return { status: 'soon', daysDiff: diffDays };
    return { status: 'upcoming', daysDiff: diffDays };
  };

  // Sort incomplete tasks by urgency: Overdue first -> nearest due date -> High priority
  const priorityRank = { 'High': 1, 'Medium': 2, 'Low': 3 };
  const incompleteTasks = tasks
    .filter(t => !t.is_completed)
    .sort((a, b) => {
      // Both have due dates
      if (a.due_date && b.due_date) {
        if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
      }
      // One has due date, the other doesn't (due date takes precedence)
      if (a.due_date && !b.due_date) return -1;
      if (!a.due_date && b.due_date) return 1;

      // Same due date or both no due date: compare priority
      const pA = priorityRank[a.priority] || 2;
      const pB = priorityRank[b.priority] || 2;
      return pA - pB;
    })
    .slice(0, 4); // Display up to 4 urgent items for better coverage

  // Budget Calculation
  const validExpenses = expenses.filter(e => e.type !== 'income');
  
  const totalCollected = budgets?.total_fund || 0;
  const totalSpent = validExpenses.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
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
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(Math.abs(amount));
    // Non-breaking space between currency symbol and digits so it never wraps
    const clean = formatted.replace(/\s+/g, '\u00A0');
    return isNegative ? `-${clean}` : clean;
  };

  const getCategoryName = (category) => {
    const key = `cat.${category}`;
    const translated = t(key);
    return translated !== key ? translated : category;
  };

  return (
    <div className="overview-container">
      <header className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {profile?.avatar_url && (
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '3px solid white', boxShadow: 'var(--shadow)', flexShrink: 0 }}>
            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div>
          <h1>
            {t('overview.title')}
            {profile?.partner_1_name && profile?.partner_2_name ? `, ${profile.partner_1_name} & ${profile.partner_2_name}` : ''}
          </h1>
          <p className="subtitle">{t('overview.subtitle')}</p>
        </div>
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
            <span className="progress-text">
              {remainingTasks > 0
                ? (language === 'id' ? `${remainingTasks} tugas tersisa` : `${remainingTasks} tasks remaining`)
                : (language === 'id' ? 'Semua tugas selesai!' : 'All tasks completed!')}
            </span>
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
              <span className={`budget-value ${remaining < 0 ? 'budget-negative' : ''}`}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${budgetSpentPercentage}%` }}></div>
          </div>
        </div>

        {/* Top Priority / Upcoming Tasks (Synced with Activities) */}
        <div className="card priority-card">
          <div className="priority-header">
            <h3>{t('overview.pendingTitle')}</h3>
            <Link to="/timeline" className="btn-text" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('overview.viewAll')}</Link>
          </div>
          <ul className="task-list">
            {incompleteTasks.map((task) => {
              const priority = task.priority || 'Medium';
              const urgency = getTaskUrgency(task.due_date);

              return (
                <li className={`task-item ${priority.toLowerCase()}-priority ${urgency.status === 'overdue' ? 'is-overdue' : ''}`} key={task.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <button 
                      type="button"
                      className={`btn-check small ${task.is_completed ? 'checked' : ''}`}
                      onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                      title={task.is_completed ? (language === 'id' ? "Tandai belum selesai" : "Mark incomplete") : (language === 'id' ? "Tandai selesai" : "Mark completed")}
                    >
                      {task.is_completed && <Check size={12} color="white" />}
                    </button>
                    <div className="task-info" style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={getDynamicTaskTitle(task.title, language)}>
                        {getDynamicTaskTitle(task.title, language)}
                      </h4>
                      <div className="task-meta-row">
                        <span className="task-category-tag">{getCategoryName(task.category)}</span>
                        {task.due_date ? (
                          <span className={`task-date-tag ${urgency.status}`}>
                            {urgency.status === 'overdue' && <AlertCircle size={11} />}
                            {formatDate(task.due_date)}
                            {urgency.status === 'overdue' && (
                              <span className="urgency-label">
                                ({t('overview.overdue').replace('{days}', urgency.daysDiff)})
                              </span>
                            )}
                            {urgency.status === 'today' && (
                              <span className="urgency-label">({t('overview.overdueToday')})</span>
                            )}
                            {urgency.status === 'soon' && urgency.daysDiff > 0 && (
                              <span className="urgency-label">
                                ({t('overview.dueInDays').replace('{days}', urgency.daysDiff)})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="task-date-tag none">{t('overview.noDueDate')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="priority-badge">{t(`priority.${priority}`)}</span>
                </li>
              );
            })}
            {incompleteTasks.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', paddingTop: '10px', textAlign: 'center' }}>{t('overview.noPending')}</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Overview;
