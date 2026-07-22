import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import '../styles/Timeline.css';

const Timeline = () => {
  const { profile, tasks } = useWeddingStore();
  const { t, language } = useTranslation();

  // Tasks Calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_completed).length;
  const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Countdown Calculation
  let daysUntilText = t('overview.dateNotSet');
  if (profile?.wedding_date) {
    const today = new Date();
    const weddingDate = new Date(profile.wedding_date);
    const diffTime = weddingDate - today;
    if (diffTime > 0) {
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysUntilText = `${daysUntil} ${t('timeline.daysToGo')}`;
    } else if (diffTime < 0) {
      daysUntilText = t('timeline.justMarried');
    }
  }

  // Location
  const locationText = profile?.wedding_location || t('timeline.locationNotSet');

  // Sort tasks by due date
  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = a.due_date ? new Date(a.due_date).getTime() : 9999999999999;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : 9999999999999;
    return dateA - dateB;
  });

  const getTaskStatus = (task) => {
    if (task.is_completed) return 'completed';
    const today = new Date();
    if (task.due_date && new Date(task.due_date) < today) return 'in-progress'; // overdue / working on it
    return 'scheduled';
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('overview.dateNotSet');
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="timeline-container">
      <header className="page-header">
        <h1>{t('timeline.title')}</h1>
        <p className="subtitle">{daysUntilText} • {locationText}</p>
      </header>

      <div className="timeline-grid">
        <div className="card overview-card">
          <div className="progress-header">
            <div>
              <h3>{t('timeline.progress')}</h3>
              <div className="progress-percentage">{tasksProgress}%</div>
            </div>
            <div className="tasks-done">
              <span className="label">{t('timeline.tasksDone')}</span>
              <span className="value">{completedTasks}/{totalTasks}</span>
            </div>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${tasksProgress}%` }}></div>
          </div>
        </div>

        <div className="card event-log-card">
          <h3>{t('timeline.eventLog')}</h3>
          <div className="event-filters">
            <span className="filter"><span className="dot completed"></span> {t('timeline.completed')}</span>
            <span className="filter"><span className="dot in-progress"></span> {t('timeline.inProgress')}</span>
            <span className="filter"><span className="dot scheduled"></span> {t('timeline.scheduled')}</span>
          </div>

          <div className="timeline-list">
            {sortedTasks.map(task => {
              const status = getTaskStatus(task);
              const statusText = status === 'completed' ? t('timeline.completed') : status === 'in-progress' ? t('timeline.inProgress') : t('timeline.scheduled');
              return (
                <div key={task.id} className={`timeline-item ${status}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{getDynamicTaskTitle(task.title, language)}</h4>
                    <p>{formatDate(task.due_date)}</p>
                  </div>
                  <span className={`status-badge ${status}`}>
                    {statusText}
                  </span>
                </div>
              );
            })}
            
            {sortedTasks.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', paddingTop: '20px' }}>{t('timeline.noTasks')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
