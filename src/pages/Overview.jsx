import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Check, Calendar, AlertCircle, User, Users, Wallet, Clock, ArrowRight, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { formatDate } from '../utils/dateFormatter';
import { getPartnerNames, formatTaskPic } from '../utils/partnerHelper';
import TutorialTriggerButton from '../components/TutorialTriggerButton';
import MiniCalendar from '../components/MiniCalendar';
import '../styles/Overview.css';

const Overview = () => {
  const { tasks, budgets, expenses, savings, profile, updateTaskStatus, userRole } = useWeddingStore();
  const isReadOnly = userRole === 'viewer';
  const { t, language } = useTranslation();

  // Tasks Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const remainingTasks = totalTasks - completedTasks;

  const { groomName, brideName } = getPartnerNames(profile);

  // Countdown Calculation
  let daysUntil = 0;
  let monthsUntil = 0;
  let weeksUntil = 0;
  let daysLeftUntil = 0;
  
  if (profile?.wedding_date) {
    const todayCountdown = new Date();
    const weddingDate = new Date(profile.wedding_date);
    const diffTime = weddingDate - todayCountdown;
    
    if (diffTime > 0) {
      daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      monthsUntil = Math.floor(daysUntil / 30);
      weeksUntil = Math.floor((daysUntil % 30) / 7);
      daysLeftUntil = daysUntil % 30 % 7;
    }
  }

  // PIC breakdown stats for couple collaboration
  const picStats = useMemo(() => {
    const cppTasks = tasks.filter(t => t.pic === 'CPP');
    const cpwTasks = tasks.filter(t => t.pic === 'CPW');
    const bersamaTasks = tasks.filter(t => (t.pic || 'Bersama') === 'Bersama');

    const cppDone = cppTasks.filter(t => t.is_completed).length;
    const cpwDone = cpwTasks.filter(t => t.is_completed).length;
    const bersamaDone = bersamaTasks.filter(t => t.is_completed).length;

    return [
      {
        id: 'CPP',
        label: `Tugas ${groomName || 'CPP'}`,
        icon: <User size={14} />,
        total: cppTasks.length,
        done: cppDone,
        pct: cppTasks.length > 0 ? Math.round((cppDone / cppTasks.length) * 100) : 0,
        colorClass: 'pic-cpp'
      },
      {
        id: 'CPW',
        label: `Tugas ${brideName || 'CPW'}`,
        icon: <User size={14} />,
        total: cpwTasks.length,
        done: cpwDone,
        pct: cpwTasks.length > 0 ? Math.round((cpwDone / cpwTasks.length) * 100) : 0,
        colorClass: 'pic-cpw'
      },
      {
        id: 'Bersama',
        label: 'Tugas Bersama',
        icon: <Users size={14} />,
        total: bersamaTasks.length,
        done: bersamaDone,
        pct: bersamaTasks.length > 0 ? Math.round((bersamaDone / bersamaTasks.length) * 100) : 0,
        colorClass: 'pic-bersama'
      }
    ];
  }, [tasks, groomName, brideName]);

  // Helper to compute deadline urgency status
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Nearest upcoming incomplete task with due date for calendar hint
  const nearestUpcomingTask = useMemo(() => {
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const withDueDate = tasks
      .filter(t => !t.is_completed && t.due_date && t.due_date >= todayStr)
      .sort((a, b) => a.due_date.localeCompare(b.due_date));
    return withDueDate.length > 0 ? withDueDate[0] : null;
  }, [tasks, today]);

  // Budget Calculation (Synchronized with Anggaran)
  const validExpenses = useMemo(() => expenses.filter(e => e.type !== 'income'), [expenses]);
  const paymentExpenses = useMemo(() => validExpenses.filter(e => e.plan_id === 'payment'), [validExpenses]);
  const expensesForTotal = paymentExpenses.length > 0 ? paymentExpenses : validExpenses;
  
  const totalSavings = (savings || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalCollected = totalSavings > 0 ? totalSavings : (Number(budgets?.total_fund) || 0);
  const totalSpent = expensesForTotal.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0);
  const remaining = totalCollected - totalSpent;
  const budgetSpentPercentage = totalCollected > 0 ? Math.min((totalSpent / totalCollected) * 100, 100).toFixed(0) : 0;

  // Reality Check: Target Budget & Deficit
  const totalBudget = Number(budgets?.total_fund) || 100000000;
  const budgetDeficit = Math.max(totalBudget - totalCollected, 0);
  const monthsLeft = Math.max(Math.ceil((daysUntil || 60) / 30.44), 1);
  const targetCollectedPct = totalBudget > 0 ? Math.min(Math.round((totalCollected / totalBudget) * 100), 100) : 0;

  // Reality Check: Upcoming / Unpaid Vendor Payments


  // Calendar Selected Date & Agenda Tasks
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const selectedDateTasks = useMemo(() => {
    if (!selectedCalendarDate) return [];
    return tasks.filter(task => task.due_date && (task.due_date === selectedCalendarDate || task.due_date.startsWith(selectedCalendarDate)));
  }, [tasks, selectedCalendarDate]);

  const isSelectedWeddingDay = useMemo(() => {
    return profile?.wedding_date && selectedCalendarDate === profile.wedding_date;
  }, [profile?.wedding_date, selectedCalendarDate]);

  const selectedDateLabel = useMemo(() => {
    if (!selectedCalendarDate) return '';
    try {
      const [y, m, d] = selectedCalendarDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const now = new Date();
      const isToday = now.getFullYear() === y && now.getMonth() === m - 1 && now.getDate() === d;
      
      const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      const locale = language === 'id' ? 'id-ID' : 'en-US';
      const formatted = dateObj.toLocaleDateString(locale, options);
      
      if (isToday) {
        return language === 'id' ? `${formatted} (Hari Ini)` : `${formatted} (Today)`;
      }
      return formatted;
    } catch {
      return selectedCalendarDate;
    }
  }, [selectedCalendarDate, language]);

  const formatCurrency = (amount) => {
    const isNegative = amount < 0;
    const formatted = new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      maximumFractionDigits: 0 
    }).format(Math.abs(amount));
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
      <header className="page-header overview-header has-tutorial-btn">
        <div className="overview-header-profile">
          {profile?.avatar_url && (
            <div className="overview-avatar">
              <img src={profile.avatar_url} alt="Profile" />
            </div>
          )}
          <div className="overview-header-text">
            <h1>
              {t('overview.title')}
              {groomName !== 'CPP' || brideName !== 'CPW' ? `, ${groomName} & ${brideName}` : (profile?.partner_1_name && profile?.partner_2_name ? `, ${profile.partner_1_name} & ${profile.partner_2_name}` : '')}
            </h1>
            <p className="subtitle">{t('overview.subtitle')}</p>
          </div>
        </div>
        <TutorialTriggerButton />
      </header>
      
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-col col-left">
          {/* Countdown Card */}
          <div className="card countdown-card">
            <div className="countdown-content">
              <div className="countdown-text-group">
                <h2>{profile?.wedding_date ? `${daysUntil} ${t('overview.days')}` : t('overview.dateNotSet')}</h2>
                <p>{t('overview.until')}</p>
              </div>
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
            <div className="progress-card-body">
              <div className="progress-circle" style={{ '--progress': `${tasksProgress}%` }}>
                <div className="progress-circle-inner">
                  <span className="progress-percentage">{tasksProgress}%</span>
                  <span className={`progress-status-badge ${totalTasks === 0 ? 'empty' : remainingTasks === 0 ? 'completed' : 'active'}`}>
                    {totalTasks === 0
                      ? t('overview.noTasksYet')
                      : remainingTasks > 0
                        ? t('overview.tasksRemainingCompact', { count: remainingTasks })
                        : t('overview.allTasksDoneCompact')}
                  </span>
                </div>
              </div>

              {/* PIC Collaboration Breakdown */}
              {totalTasks > 0 && (
                <div className="pic-breakdown-container">
                  <div className="pic-breakdown-title">
                    <span>{language === 'id' ? 'Progres Kolaborasi Pasangan' : 'Couple Collaboration Progress'}</span>
                  </div>
                  <div className="pic-breakdown-grid">
                    {picStats.map(stat => (
                      <div key={stat.id} className={`pic-breakdown-item ${stat.colorClass}`}>
                        <div className="pic-breakdown-top">
                          <span className="pic-breakdown-label">
                            <span className="pic-icon">{stat.icon}</span> {stat.label}
                          </span>
                          <span className="pic-breakdown-pct">{stat.pct}%</span>
                        </div>
                        <div className="pic-breakdown-bar">
                          <div 
                            className="pic-breakdown-bar-fill" 
                            style={{ width: `${stat.pct}%` }}
                          />
                        </div>
                        <div className="pic-breakdown-sub">
                          {stat.done} / {stat.total} {language === 'id' ? 'selesai' : 'done'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ringkasan Anggaran (Target & Kurang Langsung) */}
          <div className="card budget-snapshot-card">
            <div className="priority-header" style={{ width: '100%', marginBottom: 'var(--spacing-6)' }}>
              <h3 style={{ margin: 0 }}>{t('overview.budgetTitle')}</h3>
              <Link to="/budget" className="btn-text" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {t('overview.viewAll')}
              </Link>
            </div>

            <div className="budget-info">
              <div className="budget-item">
                <span className="budget-label">{language === 'id' ? 'Target Anggaran' : 'Target Budget'}</span>
                <span className="budget-value">{formatCurrency(totalBudget)}</span>
              </div>
              <div className="budget-item">
                <span className="budget-label">{language === 'id' ? 'Dana Terkumpul' : 'Collected'}</span>
                <span className="budget-value">{formatCurrency(totalCollected)}</span>
              </div>
              <div className="budget-item">
                <span className="budget-label">{language === 'id' ? 'Kekurangan Dana' : 'Deficit'}</span>
                <span className={`budget-value ${budgetDeficit > 0 ? 'budget-deficit-negative' : 'budget-deficit-success'}`}>
                  {budgetDeficit > 0 
                    ? `-${formatCurrency(budgetDeficit)}` 
                    : (language === 'id' ? 'Rp 0 (Tercapai)' : 'Rp 0 (Target Met)')}
                </span>
              </div>
            </div>

            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill budget-amara-progress" 
                style={{ width: `${targetCollectedPct}%` }}
              ></div>
            </div>

            <div className="budget-slide-subtext">
              <span className="budget-subtext-amara">
                {budgetDeficit > 0 
                  ? (language === 'id' ? `Kurang ${formatCurrency(budgetDeficit)} (${targetCollectedPct}% terkumpul)` : `Short ${formatCurrency(budgetDeficit)} (${targetCollectedPct}% collected)`)
                  : (language === 'id' ? 'Target 100% tercapai' : '100% Target Met')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-col col-right">
          {/* Kalender & Agenda Jadwal */}
          <div className="card overview-calendar-card">
            <div className="priority-header" style={{ width: '100%', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} style={{ color: 'var(--color-primary)' }} />
                <h3 style={{ margin: 0 }}>{language === 'id' ? 'Kalender Jadwal' : 'Schedule Calendar'}</h3>
              </div>
              <Link to="/timeline" className="btn-text" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {t('overview.viewAll')}
              </Link>
            </div>

            {/* Embedded MiniCalendar */}
            <div className="overview-mini-calendar-wrapper">
              <MiniCalendar 
                onDateClick={(dateStr) => setSelectedCalendarDate(dateStr)} 
                selectedDate={selectedCalendarDate}
              />
            </div>

            {/* Agenda List for Selected Date */}
            <div className="overview-calendar-agenda">
              <div className="overview-agenda-header">
                <span className="overview-agenda-date-label">
                  {selectedDateLabel}
                </span>
                {selectedDateTasks.length > 0 && (
                  <span className="overview-agenda-count-badge">
                    {selectedDateTasks.length} {language === 'id' ? 'jadwal' : 'tasks'}
                  </span>
                )}
              </div>

              {isSelectedWeddingDay && (
                <div className="overview-wedding-day-banner">
                  <Heart size={16} fill="currentColor" />
                  <span>
                    {language === 'id' ? 'Hari Bahagia Pernikahan Anda & Pasangan!' : 'Your Happy Wedding Day!'}
                  </span>
                </div>
              )}

              {selectedDateTasks.length > 0 ? (
                <ul className="overview-agenda-list">
                  {selectedDateTasks.map((task) => (
                    <li key={task.id} className="overview-agenda-item">
                      <div className="overview-agenda-item-left">
                        <span className={`overview-agenda-priority-dot ${task.priority?.toLowerCase() || 'medium'}`} />
                        <span className="overview-agenda-title">{getDynamicTaskTitle(task.title, language)}</span>
                      </div>
                      <span className="overview-agenda-pic">
                        {task.pic ? formatTaskPic(task.pic, groomName, brideName) : (language === 'id' ? 'Bersama' : 'Together')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : !isSelectedWeddingDay ? (
                <div className="overview-agenda-empty">
                  <span>{language === 'id' ? 'Tidak ada agenda di tanggal ini.' : 'No schedule on this date.'}</span>
                  {nearestUpcomingTask ? (
                    <div className="overview-nearest-task-hint">
                      <span className="nearest-hint-label">
                        {language === 'id' ? 'Agenda Terdekat:' : 'Next Upcoming:'}
                      </span>
                      <button
                        type="button"
                        className="nearest-hint-btn"
                        onClick={() => setSelectedCalendarDate(nearestUpcomingTask.due_date)}
                      >
                        <span className={`overview-agenda-priority-dot ${nearestUpcomingTask.priority?.toLowerCase() || 'medium'}`} />
                        <span className="nearest-hint-title">{getDynamicTaskTitle(nearestUpcomingTask.title, language)}</span>
                        <span className="nearest-hint-date">{formatDate(nearestUpcomingTask.due_date)}</span>
                      </button>
                    </div>
                  ) : (
                    <p className="overview-agenda-hint">
                      {language === 'id' 
                        ? 'Klik tanggal dengan titik untuk melihat agenda terkait.' 
                        : 'Click a dotted date to view tasks.'}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="overview-agenda-footer">
                <Link to="/timeline" className="overview-agenda-link">
                  <span>{language === 'id' ? 'Buka Jadwal Lengkap' : 'Open Full Timeline'}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
