import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import { getDynamicTaskTitle } from '../utils/taskTranslations';
import '../styles/Calendar.css';

const Calendar = () => {
  const { tasks, updateTask } = useWeddingStore();
  const { language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day', 'year', 'schedule'

  const prevTime = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
    else if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
    else if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() - 1);
    setCurrentDate(newDate);
  };

  const nextTime = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
    else if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
    else if (viewMode === 'year') newDate.setFullYear(newDate.getFullYear() + 1);
    setCurrentDate(newDate);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthNamesId = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayNamesId = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const currentMonthName = language === 'id' ? monthNamesId[currentDate.getMonth()] : monthNames[currentDate.getMonth()];
  const currentDayNames = language === 'id' ? dayNamesId : dayNames;

  const formatDateStr = (dateObj) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = async (e, dateStr) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      await updateTask(taskId, { due_date: dateStr });
    }
  };

  const renderTask = (task) => (
    <div 
      key={task.id} 
      className={`calendar-task ${task.is_completed ? 'completed' : ''} ${task.priority ? task.priority.toLowerCase() + '-priority' : ''}`}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      title={getDynamicTaskTitle(task.title, language)}
    >
      {getDynamicTaskTitle(task.title, language)}
    </div>
  );

  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const cells = [];
    const today = new Date();
    
    // Empty cells before start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDateStr(cellDate);
      const isToday = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear();
      
      const dayTasks = tasks.filter(task => task.due_date && (task.due_date === dateStr || task.due_date.startsWith(dateStr)));
      
      cells.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, dateStr)}
        >
          <span className="day-number">{day}</span>
          <div className="calendar-tasks">
            {dayTasks.map(renderTask)}
          </div>
        </div>
      );
    }
    
    // Empty cells after end of month to complete grid
    const totalCells = cells.length;
    const remainingCells = 7 - (totalCells % 7);
    if (remainingCells < 7) {
      for (let i = 0; i < remainingCells; i++) {
        cells.push(<div key={`empty-end-${i}`} className="calendar-day empty"></div>);
      }
    }

    return (
      <div className="calendar-grid">
        {currentDayNames.map(dayName => (
          <div key={`mn-${dayName}`} className="calendar-day-name">{dayName}</div>
        ))}
        {cells}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const cells = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDateStr(dayDate);
      const isToday = dayDate.getDate() === today.getDate() && dayDate.getMonth() === today.getMonth() && dayDate.getFullYear() === today.getFullYear();
      const dayTasks = tasks.filter(task => task.due_date && (task.due_date === dateStr || task.due_date.startsWith(dateStr)));
      
      cells.push(
        <div 
          key={`week-day-${i}`} 
          className={`calendar-day day-view-cell ${isToday ? 'today' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, dateStr)}
        >
          <span className="day-number">{dayDate.getDate()}</span>
          <div className="calendar-tasks">
            {dayTasks.map(renderTask)}
          </div>
        </div>
      );
    }
    
    return (
      <div className="calendar-grid">
        {currentDayNames.map((dayName, index) => {
          const d = new Date(startOfWeek);
          d.setDate(startOfWeek.getDate() + index);
          return (
            <div key={`wn-${dayName}`} className={`calendar-day-name ${d.getDate() === today.getDate() && d.getMonth() === today.getMonth() ? 'today' : ''}`} style={{ color: d.getDate() === today.getDate() && d.getMonth() === today.getMonth() ? 'var(--color-primary)' : '' }}>
              {dayName} {d.getDate()}
            </div>
          );
        })}
        {cells}
      </div>
    );
  };

  const renderDayView = () => {
    const dateStr = formatDateStr(currentDate);
    const today = new Date();
    const isToday = currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    const dayTasks = tasks.filter(task => task.due_date && (task.due_date === dateStr || task.due_date.startsWith(dateStr)));
    
    return (
      <div className="calendar-grid day-view">
        <div className={`calendar-day-name ${isToday ? 'today' : ''}`} style={{ color: isToday ? 'var(--color-primary)' : '', fontSize: '1rem', padding: '15px 0' }}>
          {currentDayNames[currentDate.getDay()]}, {currentDate.getDate()} {currentMonthName}
        </div>
        <div 
          className={`calendar-day day-view-cell ${isToday ? 'today' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, dateStr)}
        >
          <div className="calendar-tasks" style={{ padding: '10px' }}>
            {dayTasks.map(renderTask)}
            {dayTasks.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '20px' }}>{language === 'id' ? 'Tidak ada acara' : 'No events'}</p>}
          </div>
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const year = currentDate.getFullYear();
    const today = new Date();
    const months = [];
    
    const mNames = language === 'id' ? monthNamesId : monthNames;
    const dNames = language === 'id' ? ['M','S','S','R','K','J','S'] : ['S','M','T','W','T','F','S'];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      
      const cells = [];
      for (let i = 0; i < firstDayOfMonth; i++) cells.push(<div key={`y-e-${month}-${i}`} className="mini-day empty"></div>);
      
      for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        const dateStr = formatDateStr(cellDate);
        const isToday = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear();
        const hasTask = tasks.some(task => task.due_date && (task.due_date === dateStr || task.due_date.startsWith(dateStr)));
        
        cells.push(
          <div 
            key={`y-d-${month}-${day}`} 
            className={`mini-day ${isToday ? 'today' : ''} ${hasTask ? 'has-task' : ''}`}
            onClick={() => {
              setCurrentDate(cellDate);
              setViewMode('day');
            }}
          >
            {day}
          </div>
        );
      }
      
      months.push(
        <div key={`month-${month}`} className="mini-month">
          <h4 onClick={() => { setCurrentDate(new Date(year, month, 1)); setViewMode('month'); }}>{mNames[month]}</h4>
          <div className="mini-month-grid">
            {dNames.map((d, i) => <div key={`mdn-${month}-${i}`} className="mini-day-name">{d}</div>)}
            {cells}
          </div>
        </div>
      );
    }
    
    return <div className="year-grid">{months}</div>;
  };

  const renderScheduleView = () => {
    // Group tasks by date from today onwards, or just all tasks with dates
    const scheduledTasks = tasks.filter(t => t.due_date).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    if (scheduledTasks.length === 0) {
      return <p style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>{language === 'id' ? 'Tidak ada jadwal.' : 'No schedule.'}</p>;
    }
    
    const groups = {};
    scheduledTasks.forEach(task => {
      const d = task.due_date;
      if (!groups[d]) groups[d] = [];
      groups[d].push(task);
    });

    const today = new Date();
    const todayStr = formatDateStr(today);

    return (
      <div className="schedule-view">
        {Object.entries(groups).map(([dateStr, dayTasks]) => {
          const dObj = new Date(dateStr);
          const isToday = dateStr === todayStr;
          const mNames = language === 'id' ? monthNamesId : monthNames;
          return (
            <div key={dateStr} className={`schedule-day-group ${isToday ? 'today' : ''}`}>
              <div className="schedule-date-col">
                <span className="schedule-day-name">{currentDayNames[dObj.getDay()]}</span>
                <span className="schedule-day-num">{dObj.getDate()}</span>
                <span className="schedule-day-name" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{mNames[dObj.getMonth()]}</span>
              </div>
              <div className="schedule-tasks-col">
                {dayTasks.map(task => (
                  <div key={task.id} className="schedule-task" draggable onDragStart={(e) => handleDragStart(e, task.id)}>
                    <div className={`schedule-task-dot ${task.priority ? task.priority.toLowerCase() : 'medium'}`}></div>
                    <div style={{ textDecoration: task.is_completed ? 'line-through' : 'none', opacity: task.is_completed ? 0.6 : 1 }}>
                      {getDynamicTaskTitle(task.title, language)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (viewMode) {
      case 'week': return renderWeekView();
      case 'day': return renderDayView();
      case 'year': return renderYearView();
      case 'schedule': return renderScheduleView();
      case 'month':
      default: return renderMonthView();
    }
  };

  let headerTitle = `${currentMonthName} ${currentDate.getFullYear()}`;
  if (viewMode === 'year') {
    headerTitle = `${currentDate.getFullYear()}`;
  } else if (viewMode === 'week') {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
      headerTitle = `${currentMonthName} ${currentDate.getFullYear()}`;
    } else {
      const mNames = language === 'id' ? monthNamesId : monthNames;
      headerTitle = `${mNames[startOfWeek.getMonth()]} - ${mNames[endOfWeek.getMonth()]} ${currentDate.getFullYear()}`;
    }
  }

  return (
    <div className="card calendar-card" style={{ marginBottom: '30px' }}>
      <div className="calendar-header">
        <h3>{headerTitle}</h3>
        
        <div className="calendar-nav">
          <div className="view-mode-selector">
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
              <option value="day">{language === 'id' ? 'Hari' : 'Day'}</option>
              <option value="week">{language === 'id' ? 'Minggu' : 'Week'}</option>
              <option value="month">{language === 'id' ? 'Bulan' : 'Month'}</option>
              <option value="year">{language === 'id' ? 'Tahun' : 'Year'}</option>
              <option value="schedule">{language === 'id' ? 'Jadwal' : 'Schedule'}</option>
            </select>
          </div>
          
          <div className="calendar-nav-buttons">
            <button onClick={prevTime}><ChevronLeft size={18} /></button>
            <button className="btn-today" onClick={() => setCurrentDate(new Date())}>{language === 'id' ? 'Hari Ini' : 'Today'}</button>
            <button onClick={nextTime}><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export default Calendar;
