import { useState, useMemo } from 'react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import { formatDate } from '../utils/dateFormatter';
import { getPartnerNames, formatTaskPic } from '../utils/partnerHelper';
import ConfirmModal from '../components/ConfirmModal';
import { Check, Trash2, Edit2, X, Calendar as CalendarIcon, Clock, Heart, CheckCircle2, AlertCircle } from 'lucide-react';
import MiniCalendar from '../components/MiniCalendar';
import TutorialTriggerButton from '../components/TutorialTriggerButton';
import '../styles/Timeline.css';

const Timeline = () => {
  const { profile, tasks, userRole, updateTaskStatus, updateTask, deleteTask } = useWeddingStore();
  const isReadOnly = userRole === 'viewer';
  const { groomName, brideName } = getPartnerNames(profile);
  const { t, language } = useTranslation();
  
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [toastData, setToastData] = useState(null);

  const showToast = (message, actionText = null, onAction = null) => {
    setToastData({ message, actionText, onAction });
    setTimeout(() => {
      setToastData(null);
    }, 4500);
  };

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



  const getTaskStatus = (evt) => {
    if (evt.is_completed) return 'completed';
    const today = new Date();
    if (evt.date && new Date(evt.date) < today) return 'in-progress';
    return 'scheduled';
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
        title: t('timeline.weddingDay'),
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
    setTaskError(null);
    setIsSavingTask(false);
    setEditingTask(task.id);
    setEditForm({
      title: getDynamicTaskTitle(task.title, language),
      due_date: task.due_date || '',
      priority: task.priority || 'Medium',
      pic: task.pic || 'Bersama'
    });
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!editingTask || isSavingTask) return;
    setIsSavingTask(true);
    setTaskError(null);

    const targetDate = editForm.due_date;
    try {
      await updateTask(editingTask, {
        title: editForm.title.trim(),
        due_date: targetDate || null,
        priority: editForm.priority,
        pic: editForm.pic || 'Bersama'
      });

      setEditingTask(null);

      if (targetDate) {
        const monthNames = language === 'id' 
          ? ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
          : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        
        const dateParts = targetDate.split('-');
        let monthYear = targetDate;
        if (dateParts.length >= 2) {
          const year = dateParts[0];
          const monthIndex = parseInt(dateParts[1], 10) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            monthYear = `${monthNames[monthIndex]} ${year}`;
          }
        }

        showToast(
          `Tugas berhasil dijadwalkan ke ${monthYear}`,
          language === 'id' ? 'Lihat' : 'View',
          () => handleDateClick(targetDate)
        );
      } else {
        showToast(language === 'id' ? 'Jadwal tugas berhasil diperbarui' : 'Task schedule updated');
      }
    } catch (err) {
      console.error(err);
      setTaskError(err?.message || (language === 'id' ? 'Gagal memperbarui jadwal. Silakan coba lagi.' : 'Failed to update schedule. Please try again.'));
    } finally {
      setIsSavingTask(false);
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
      {/* Toast Notification */}
      {toastData && (
        <div className="amara-toast seserahan-toast">
          <CheckCircle2 size={16} />
          <span>{toastData.message}</span>
          {toastData.actionText && toastData.onAction && (
            <button
              type="button"
              className="toast-action-btn"
              onClick={() => {
                toastData.onAction();
                setToastData(null);
              }}
            >
              {toastData.actionText}
            </button>
          )}
        </div>
      )}

      <header className="page-header has-tutorial-btn">
        <div>
          <h1>{t('timeline.title')}</h1>
          <p className="subtitle" style={{ marginTop: '4px' }}>{daysUntilText} • {t('timeline.subtitle')}</p>
        </div>
        <TutorialTriggerButton />
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
          <div className="progress-bar-fill" style={{ width: `${tasksProgress}%`, height: '100%', background: 'var(--gradient-primary)', transition: 'width 0.5s ease-out' }}></div>
        </div>
      </div>

      <div className="timeline-split-layout">
        {/* Left Column: Main Timeline Log */}
        <div className="timeline-main-col">
          <div className="card event-log-card">
            <h3>Timeline</h3>
            <div className="event-filters">
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
                            <div className="timeline-dot-wrapper wedding-dot-wrapper">
                              <div className="wedding-heart-badge">
                                <Heart size={16} fill="white" color="white" />
                              </div>
                            </div>
                            <div className="timeline-content wedding-content" style={{ background: 'var(--color-primary)', border: 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                                <h4 className="wedding-title">
                                  {evt.title}
                                </h4>
                                <span style={{ fontSize: '0.78rem', background: 'white', color: 'var(--color-primary)', padding: '3px 10px', borderRadius: '12px', fontWeight: 'bold', letterSpacing: '0.02em', flexShrink: 0 }}>
                                  {language === 'id' ? 'Hari H' : 'D-Day'}
                                </span>
                              </div>
                              <p style={{ marginTop: '6px', fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.9)', display: 'flex', alignItems: 'center', gap: '4px', margin: '6px 0 0 0' }}>
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
                          <div className="timeline-dot-wrapper">
                            <div className={`timeline-heart-dot ${evt.is_completed ? 'completed' : status}`}>
                              <Heart 
                                size={14} 
                                fill={evt.is_completed ? "var(--color-success)" : "none"} 
                                strokeWidth={2.4}
                              />
                            </div>
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-content-header">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                <button 
                                  className={`btn-check ${evt.is_completed ? 'checked' : ''}`}
                                  onClick={() => !isReadOnly && updateTaskStatus(evt.id, !evt.is_completed)}
                                  disabled={isReadOnly}
                                  title={isReadOnly ? (language === 'id' ? 'Akses Lihat Saja' : 'View Only Access') : 'Toggle Complete'}
                                  style={isReadOnly ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                                >
                                  {evt.is_completed && <Check size={14} color="white" />}
                                </button>
                                <h4 style={{ textDecoration: evt.is_completed ? 'line-through' : 'none' }}>
                                  {getDynamicTaskTitle(evt.title, language)}
                                </h4>
                              </div>
                              {!isReadOnly && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                                  <button className="btn-icon" onClick={() => handleEditClick(evt)} title={language === 'id' ? "Edit tugas" : "Edit task"}><Edit2 size={16} /></button>
                                  <button className="btn-icon-danger" onClick={() => setDeletingTask(evt)} title={language === 'id' ? "Hapus tugas" : "Delete task"}><Trash2 size={16} /></button>
                                </div>
                              )}
                            </div>
                            <div className={`timeline-content-meta ${isReadOnly ? 'read-only' : ''}`}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} /> {formatDate(evt.date)}
                              </span>
                              {evt.pic && (
                                <span className={`task-pic-badge pic-${(evt.pic || 'Bersama').toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                                  {formatTaskPic(evt.pic, profile)}
                                </span>
                              )}
                            </div>
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
            <h3>{t('timeline.unscheduledTitle')}</h3>
            <p className="sidebar-desc">
              {t('timeline.unscheduledDesc')}
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
                    <button 
                      className={`btn-check small ${task.is_completed ? 'checked' : ''}`}
                      onClick={() => !isReadOnly && updateTaskStatus(task.id, !task.is_completed)}
                      disabled={isReadOnly}
                      style={isReadOnly ? { cursor: 'not-allowed', opacity: 0.6, marginTop: '2px' } : { marginTop: '2px' }}
                    >
                      {task.is_completed && <Check size={10} color="white" />}
                    </button>

                    <div className="unscheduled-item-info">
                      <span className="unscheduled-item-title" style={{ textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                        {getDynamicTaskTitle(task.title, language)}
                      </span>
                      {task.pic && (
                        <div className="unscheduled-item-meta">
                          <span className={`task-pic-badge pic-${(task.pic || 'Bersama').toLowerCase()}`}>
                            {formatTaskPic(task.pic, profile)}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isReadOnly && (
                      <div className="unscheduled-item-actions">
                        <button 
                          className="btn-icon small" 
                          onClick={() => handleEditClick(task)}
                          title={language === 'id' ? "Edit tugas" : "Edit task"}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-icon-danger small" 
                          onClick={() => setDeletingTask(task)} 
                          title={language === 'id' ? "Hapus tugas" : "Delete task"}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mini Calendar */}
          <MiniCalendar onDateClick={handleDateClick} />


        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="card modal-card">
            <button
              onClick={() => {
                if (!isSavingTask) {
                  setEditingTask(null);
                  setTaskError(null);
                }
              }}
              className="modal-close"
              disabled={isSavingTask}
            >
              <X size={20}/>
            </button>
            <h3 style={{ marginBottom: '20px' }}>{language === 'id' ? 'Edit Jadwal' : 'Edit Schedule'}</h3>

            {taskError && (
              <div className="form-error-banner" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertCircle size={16} />
                <span>{taskError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateTask} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label className="form-label">{language === 'id' ? 'Nama Tugas' : 'Task Name'}</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  required
                  className="form-input"
                  autoFocus
                  disabled={isSavingTask}
                />
              </div>
              <div>
                <label className="form-label">{language === 'id' ? 'Tanggal' : 'Date'}</label>
                <input
                  type="date"
                  value={editForm.due_date}
                  onChange={e => setEditForm({...editForm, due_date: e.target.value})}
                  className="form-input"
                  disabled={isSavingTask}
                />
              </div>
              <div>
                <label className="form-label">{language === 'id' ? 'PIC Tugas' : 'Task PIC'}</label>
                <select 
                  value={editForm.pic || 'Bersama'} 
                  onChange={e => setEditForm({...editForm, pic: e.target.value})} 
                  className="form-select"
                  disabled={isSavingTask}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface-solid)', color: 'var(--color-text)', fontSize: '0.95rem' }}
                >
                  <option value="Bersama">{language === 'id' ? 'Tugas Bersama' : 'Joint Task'}</option>
                  <option value="CPP">{language === 'id' ? `Tugas ${groomName}` : `${groomName}'s Task`}</option>
                  <option value="CPW">{language === 'id' ? `Tugas ${brideName}` : `${brideName}'s Task`}</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSavingTask}
                style={{ marginTop: '10px', padding: '12px' }}
              >
                {isSavingTask ? (language === 'id' ? 'Menyimpan...' : 'Saving...') : (language === 'id' ? 'Simpan' : 'Save')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Task Deletion */}
      <ConfirmModal
        isOpen={!!deletingTask}
        onClose={() => {
          if (!isDeleting) setDeletingTask(null);
        }}
        onConfirm={async () => {
          if (!deletingTask) return;
          try {
            setIsDeleting(true);
            await deleteTask(deletingTask.id);
            setDeletingTask(null);
          } finally {
            setIsDeleting(false);
          }
        }}
        isLoading={isDeleting}
        title={language === 'id' ? 'Hapus tugas ini?' : 'Delete this task?'}
        message={language === 'id' ? 'Tugas yang dihapus tidak dapat dikembalikan.' : 'Deleted tasks cannot be recovered.'}
        itemName={deletingTask ? getDynamicTaskTitle(deletingTask.title, language) : ''}
        confirmText={language === 'id' ? 'Hapus' : 'Delete'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};

export default Timeline;
