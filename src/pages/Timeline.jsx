import { useState } from 'react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { Plus, Check, Trash2, Edit2, X } from 'lucide-react';
import Calendar from '../components/Calendar';
import '../styles/Timeline.css';

const Timeline = () => {
  const { profile, tasks, expenses, addTask, updateTaskStatus, updateTask, deleteTask } = useWeddingStore();
  const { t, language } = useTranslation();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');

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

  // Combine and sort events
  const taskEvents = tasks.map(t => ({ ...t, eventType: 'task', date: t.due_date }));
  const expenseEvents = expenses.filter(e => e.deadline).map(e => ({ ...e, eventType: 'expense', date: e.deadline }));
  
  const allEvents = [...taskEvents, ...expenseEvents].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 9999999999999;
    const dateB = b.date ? new Date(b.date).getTime() : 9999999999999;
    return dateA - dateB;
  });

  const getTaskStatus = (evt) => {
    if (evt.eventType === 'expense') {
      const isPaid = Number(evt.paid_amount) >= Number(evt.actual_amount || evt.planned_amount) && Number(evt.actual_amount || evt.planned_amount) > 0;
      if (isPaid) return 'completed';
      const today = new Date();
      if (evt.date && new Date(evt.date) < today) return 'in-progress';
      return 'scheduled';
    } else {
      if (evt.is_completed) return 'completed';
      const today = new Date();
      if (evt.date && new Date(evt.date) < today) return 'in-progress';
      return 'scheduled';
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await addTask({
      title: newTaskTitle,
      due_date: newTaskDate || null,
      category: 'Others',
      priority: 'Medium',
      is_completed: false
    });
    setNewTaskTitle('');
    setNewTaskDate('');
    setShowAddModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('overview.dateNotSet');
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="timeline-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{t('timeline.title')}</h1>
          <p className="subtitle">{daysUntilText} • {locationText}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> {language === 'id' ? 'Tambah Acara' : 'Add Event'}
        </button>
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
        
        <Calendar />

        <div className="card event-log-card">
          <h3>{t('timeline.eventLog')}</h3>
          <div className="event-filters">
            <span className="filter"><span className="dot completed"></span> {t('timeline.completed')}</span>
            <span className="filter"><span className="dot in-progress"></span> {t('timeline.inProgress')}</span>
            <span className="filter"><span className="dot scheduled"></span> {t('timeline.scheduled')}</span>
          </div>

          <div className="timeline-list">
            <div className="timeline-track"></div>
            {allEvents.map(evt => {
              const status = getTaskStatus(evt);
              const statusText = status === 'completed' ? t('timeline.completed') : status === 'in-progress' ? t('timeline.inProgress') : t('timeline.scheduled');
              
              if (evt.eventType === 'expense') {
                return (
                  <div key={`exp-${evt.id}`} className={`timeline-item ${status}`}>
                    <div className="timeline-dot payment-dot"></div>
                    <div className="timeline-content payment-content">
                      <div className="timeline-content-header">
                        <h4>💸 {evt.title} Payment</h4>
                        <span className={`status-badge ${status}`}>{statusText}</span>
                      </div>
                      <p>{formatDate(evt.date)}</p>
                    </div>
                  </div>
                );
              }

              return (
                <div 
                  key={`task-${evt.id}`} 
                  className={`timeline-item ${status}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('taskId', evt.id)}
                  style={{ cursor: 'grab' }}
                >
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <div className="timeline-content-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button 
                          className={`btn-check ${evt.is_completed ? 'checked' : ''}`}
                          onClick={() => updateTaskStatus(evt.id, !evt.is_completed)}
                          title="Toggle Complete"
                        >
                          <Check size={14} />
                        </button>
                        <h4 style={{ textDecoration: evt.is_completed ? 'line-through' : 'none' }}>
                          {getDynamicTaskTitle(evt.title, language)}
                        </h4>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`status-badge ${status}`}>{statusText}</span>
                        <button className="btn-icon-danger" onClick={() => {
                          if (window.confirm(language === 'id' ? 'Hapus tugas ini?' : 'Delete this task?')) {
                            deleteTask(evt.id);
                          }
                        }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <p style={{ marginLeft: '34px' }}>{formatDate(evt.date)}</p>
                  </div>
                </div>
              );
            })}
            
            {allEvents.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', paddingTop: '20px', textAlign: 'center' }}>{t('timeline.noTasks')}</p>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card" style={{ width: '90%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', right: '15px', top: '15px', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{language === 'id' ? 'Tambah Acara Baru' : 'Add New Event'}</h3>
            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{language === 'id' ? 'Nama Tugas' : 'Task Name'}</label>
                <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required placeholder={language === 'id' ? 'Mitting vendor, bayar DP, dll' : 'Meeting vendor, pay DP, etc'} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px' }}>{language === 'id' ? 'Tanggal' : 'Date'}</label>
                <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid var(--color-border)' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '12px' }}>{language === 'id' ? 'Simpan' : 'Save'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
