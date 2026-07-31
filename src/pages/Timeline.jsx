import { useState, useMemo } from 'react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { Check, Trash2, Edit2, X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import MiniCalendar from '../components/MiniCalendar';
import '../styles/Timeline.css';

const Timeline = () => {
  const { profile, tasks, expenses, updateTaskStatus, updateTask, deleteTask } = useWeddingStore();
  const { t, language } = useTranslation();
  
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', due_date: '', priority: 'Medium' });

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

  const monthNames = language === 'id' 
    ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

  // Group scheduled events by Month-Year
  const scheduledTasks = useMemo(() => {
    const sorted = tasks.filter(t => t.due_date).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    const groups = {};
    
    sorted.forEach(task => {
      const d = new Date(task.due_date);
      const monthYear = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const groupKey = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
      
      if (!groups[groupKey]) {
        groups[groupKey] = { title: monthYear, tasks: [], dateObj: new Date(d.getFullYear(), d.getMonth(), 1) };
      }
      groups[groupKey].tasks.push({ ...task, eventType: 'task', date: task.due_date });
    });

    return Object.values(groups).sort((a, b) => a.dateObj - b.dateObj);
  }, [tasks, language]);

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

  // Drag and drop logic
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDropOnMonth = async (e, dateObj) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      // Assign the 1st of that month
      const newDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-01`;
      await updateTask(taskId, { due_date: newDate });
    }
  };

  const handleDropOnTask = async (e, targetTask) => {
    e.preventDefault();
    e.stopPropagation(); // prevent month drop
    e.currentTarget.classList.remove('drag-over');
    const draggedId = e.dataTransfer.getData('taskId');
    if (draggedId && draggedId !== targetTask.id) {
      const draggedTask = tasks.find(t => t.id === draggedId);
      if (draggedTask) {
        // Swap dates
        const tempDate = targetTask.due_date;
        await updateTask(targetTask.id, { due_date: draggedTask.due_date });
        await updateTask(draggedId, { due_date: tempDate });
      }
    }
  };

  const handleDropUnscheduled = async (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await updateTask(taskId, { due_date: null });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  return (
    <div className="timeline-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>{t('timeline.title')}</h1>
          <p className="subtitle">{daysUntilText} • {locationText}</p>
        </div>
      </header>

      <div className="timeline-split-layout">
        {/* Left Column: Main Timeline Log */}
        <div className="timeline-main-col">
          <div className="card event-log-card">
            <h3>Timeline / Log</h3>
            <div className="event-filters" style={{ marginBottom: '20px' }}>
              <span className="filter"><span className="dot completed"></span> Selesai</span>
              <span className="filter"><span className="dot scheduled"></span> Terjadwal</span>
            </div>

            <div className="timeline-list">
              <div className="timeline-track"></div>
              
              {scheduledTasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  {language === 'id' ? 'Belum ada jadwal. Tarik tugas ke sini!' : 'No schedules yet. Drag tasks here!'}
                </p>
              ) : (
                scheduledTasks.map((group, gIndex) => (
                  <div 
                    key={`group-${gIndex}`} 
                    className="timeline-month-group"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDropOnMonth(e, group.dateObj)}
                  >
                    <div className="month-divider">
                      <span className="month-badge">{group.title}</span>
                    </div>
                    
                    {group.tasks.map(evt => {
                      const status = getTaskStatus(evt);
                      return (
                        <div 
                          key={`task-${evt.id}`} 
                          className={`timeline-item ${status}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, evt.id)}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropOnTask(e, evt)}
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
          <div 
            className="card unscheduled-card"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropUnscheduled}
          >
            <h3>{language === 'id' ? 'Belum Terjadwal' : 'Unscheduled'}</h3>
            <p className="sidebar-desc">
              {language === 'id' ? 'Tarik & lepas ke timeline utama.' : 'Drag & drop to the main timeline.'}
            </p>
            
            <div className="unscheduled-list">
              {unscheduledTasks.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>Kosong</p>
              ) : (
                unscheduledTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="unscheduled-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <button 
                        className={`btn-check small ${task.is_completed ? 'checked' : ''}`}
                        onClick={() => updateTaskStatus(task.id, !task.is_completed)}
                      >
                        <Check size={12} />
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
          <MiniCalendar />

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
