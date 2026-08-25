import { useState, useMemo } from 'react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { Check, Trash2, Edit2, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import MiniCalendar from '../components/MiniCalendar';
import '../styles/Timeline.css';

const Timeline = () => {
  const { profile, tasks, updateTaskStatus, updateTask, deleteTask } = useWeddingStore();
  const { t, language } = useTranslation();
  
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', due_date: '', priority: 'Medium' });

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

  // Sync to Gcal (Dummy for now, generates ics)
  const handleSyncGCal = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Amara Wedding//EN\n";
    tasks.filter(t => t.due_date).forEach(task => {
      const dateStr = task.due_date.replace(/-/g, '');
      icsContent += `BEGIN:VEVENT\nDTSTART;VALUE=DATE:${dateStr}\nSUMMARY:${getDynamicTaskTitle(task.title, 'en')}\nEND:VEVENT\n`;
    });
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'wedding_schedule.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTaskStatus = (evt) => {
    if (evt.is_completed) return 'completed';
    const today = new Date();
    if (evt.date && new Date(evt.date) < today) return 'in-progress';
    return 'scheduled';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Group scheduled events by Month-Year, including Wedding Day automatically
  const scheduledTasks = useMemo(() => {
    const monthNames = language === 'id' 
      ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
      : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const items = tasks.filter(t => t.due_date).map(t => ({ ...t, eventType: 'task', date: t.due_date }));
    
    if (profile?.wedding_date) {
      items.push({
        id: 'wedding-day-special-event',
        title: language === 'id' ? 'Hari Pernikahan 💍' : 'Wedding Day 💍',
        category: 'wedding-day',
        due_date: profile.wedding_date,
        date: profile.wedding_date,
        is_completed: false,
        eventType: 'wedding-day',
        priority: 'High'
      });
    }

    const sorted = items.sort((a, b) => new Date(a.date) - new Date(b.date));
    const groups = {};
    
    sorted.forEach(item => {
      const d = new Date(item.date);
      const monthYear = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const groupKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = { groupKey, title: monthYear, tasks: [], dateObj: new Date(d.getFullYear(), d.getMonth(), 1) };
      }
      groups[groupKey].tasks.push(item);
    });

    return Object.values(groups).sort((a, b) => a.dateObj - b.dateObj);
  }, [tasks, profile?.wedding_date, language]);

  const unscheduledTasks = tasks.filter(t => !t.due_date);

  const handleEditClick = (task) => {
    setEditingTask(task.id);
    setEditForm({
      title: getDynamicTaskTitle(task.title, language),
      due_date: task.due_date || '',
      priority: task.priority || 'Medium'
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (editingTask) {
      await updateTask(editingTask, {
        title: editForm.title,
        due_date: editForm.due_date || null,
        priority: editForm.priority
      });
      setEditingTask(null);
    }
  };

  const handleDateClick = (dateStr) => {
    // 1. Try to find a task on this exact date
    const exactTaskEl = document.querySelector(`[data-task-date="${dateStr}"]`);
    if (exactTaskEl) {
      exactTaskEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      exactTaskEl.classList.add('highlight-flash');
      setTimeout(() => {
        exactTaskEl.classList.remove('highlight-flash');
      }, 2000);
      return;
    }

    // 2. If no exact task, find the month group
    const clickedDate = new Date(dateStr);
    const groupKey = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth()).padStart(2, '0')}`;
    const monthGroupEl = document.getElementById(`timeline-group-${groupKey}`);
    if (monthGroupEl) {
      monthGroupEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      monthGroupEl.classList.add('highlight-flash');
      setTimeout(() => {
        monthGroupEl.classList.remove('highlight-flash');
      }, 2000);
    }
  };

  return (
    <div className="timeline-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{t('timeline.title')}</h1>
          <p className="subtitle">{daysUntilText} • {locationText}</p>
        </div>
      </header>

      <div className="card overview-card" style={{ marginBottom: '25px', padding: '20px' }}>
        <div className="progress-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: 'var(--color-text-muted)' }}>{t('timeline.progress')}</h3>
            <div className="progress-percentage" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{tasksProgress}%</div>
          </div>
          <div className="tasks-done" style={{ textAlign: 'right' }}>
            <span className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '5px' }}>{t('timeline.tasksDone')}</span>
            <span className="value" style={{ fontWeight: 600, fontSize: '1.1rem' }}>{completedTasks}/{totalTasks}</span>
          </div>
        </div>
        <div className="progress-bar-bg" style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-border)', borderRadius: '5px', overflow: 'hidden' }}>
          <div className="progress-bar-fill" style={{ width: `${tasksProgress}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.5s ease-out' }}></div>
        </div>
      </div>

      <div className="timeline-split-layout">
        {/* Left Column: Main Timeline Log */}
        <div className="timeline-main-col">
          <div className="card event-log-card">
            <h3>Timeline / Log</h3>
            <div className="event-filters" style={{ marginBottom: '20px' }}>
              <span className="filter"><span className="dot completed"></span> {language === 'id' ? 'Selesai' : 'Completed'}</span>
              <span className="filter"><span className="dot scheduled"></span> {language === 'id' ? 'Terjadwal' : 'Scheduled'}</span>
            </div>

            <div className="timeline-list">
              <div className="timeline-track"></div>
              
              {scheduledTasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  {language === 'id' ? 'Belum ada jadwal. Klik edit pada tugas untuk menambahkan tanggal!' : 'No schedules yet. Click edit on tasks to set a date!'}
                </p>
              ) : (
                scheduledTasks.map((group, gIndex) => (
                  <div 
                    key={`group-${gIndex}`} 
                    id={`timeline-group-${group.groupKey}`}
                    className="timeline-month-group"
                  >
                    <div className="month-divider">
                      <span className="month-badge">{group.title}</span>
                    </div>
                    
                    {group.tasks.map(evt => {
                      const status = getTaskStatus(evt);
                      
                      if (evt.eventType === 'wedding-day') {
                        return (
                          <div 
                            key={evt.id} 
                            id={`timeline-task-${evt.id}`}
                            data-task-date={evt.date}
                            className="timeline-item wedding-day-item"
                          >
                            <div className="timeline-dot wedding-dot" style={{ backgroundColor: 'var(--color-primary)', border: '2px solid white', boxShadow: '0 0 8px var(--color-primary)' }}></div>
                            <div className="timeline-content wedding-content" style={{ background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #FFF5F7 100%)', borderColor: 'var(--color-primary)', borderStyle: 'solid', borderWidth: '1px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontSize: '1.2rem' }}>🎉</span>
                                  <h4 style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {evt.title}
                                  </h4>
                                </div>
                                <span style={{ fontSize: '0.8rem', background: 'var(--color-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                                  {language === 'id' ? 'Hari H' : 'D-Day'}
                                </span>
                              </div>
                              <p style={{ marginLeft: '30px', marginTop: '5px', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {formatDate(evt.date)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <div 
                          key={`task-${evt.id}`} 
                          id={`timeline-task-${evt.id}`}
                          data-task-date={evt.date}
                          className={`timeline-item ${status}`}
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
                                  {evt.is_completed && <Check size={14} color="white" />}
                                </button>
                                <h4 style={{ textDecoration: evt.is_completed ? 'line-through' : 'none' }}>
                                  {getDynamicTaskTitle(evt.title, language)}
                                </h4>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <button className="btn-icon" onClick={() => handleEditClick(evt)}><Edit2 size={16} /></button>
                                <button className="btn-icon-danger" onClick={() => {
                                  if (window.confirm('Delete this task?')) deleteTask(evt.id);
                                }}><Trash2 size={16} /></button>
                              </div>
                            </div>
                            <p style={{ marginLeft: '34px', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {formatDate(evt.date)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="timeline-sidebar-col">
          {/* Unscheduled Tasks */}
          <div className="card unscheduled-card">
            <h3>{language === 'id' ? 'Belum Terjadwal' : 'Unscheduled'}</h3>
            <p className="sidebar-desc">
              {language === 'id' ? 'Klik edit untuk mengatur tanggal tugas.' : 'Click edit to set the task date.'}
            </p>
            
            <div className="unscheduled-list">
              {unscheduledTasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>{language === 'id' ? 'Kosong' : 'Empty'}</p>
              ) : (
                unscheduledTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="unscheduled-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <button 
                        className={`btn-check small ${task.is_completed ? 'checked' : ''}`}
                        onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                      >
                        {task.is_completed && <Check size={10} color="white" />}
                      </button>
                      <span style={{ textDecoration: task.is_completed ? 'line-through' : 'none', fontSize: '0.9rem', fontWeight: 500 }}>
                        {getDynamicTaskTitle(task.title, language)}
                      </span>
                    </div>
                    <button className="btn-icon small" onClick={() => handleEditClick(task)}><Edit2 size={14} /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mini Calendar */}
          <MiniCalendar onDateClick={handleDateClick} />

          {/* Google Calendar Sync */}
          <button className="btn-secondary btn-full" onClick={handleSyncGCal} style={{ marginTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CalendarIcon size={18} /> {language === 'id' ? 'Sync ke Google Calendar' : 'Sync to Google Calendar'}
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <button onClick={() => setEditingTask(null)} className="modal-close"><X size={20}/></button>
            <h3 style={{ marginBottom: '20px' }}>{language === 'id' ? 'Edit Jadwal' : 'Edit Schedule'}</h3>
            <form onSubmit={handleUpdateTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">{language === 'id' ? 'Nama Tugas' : 'Task Name'}</label>
                <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="form-input" />
              </div>
              <div>
                <label className="form-label">{language === 'id' ? 'Tanggal' : 'Date'}</label>
                <input type="date" value={editForm.due_date} onChange={e => setEditForm({...editForm, due_date: e.target.value})} className="form-input" />
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
