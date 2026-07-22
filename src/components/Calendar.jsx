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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  // Adjust so Monday is 0, Sunday is 6 (optional, but commonly 0 is Sunday. Let's stick to standard 0=Sunday)
  // Standard: 0 = Sun, 1 = Mon...
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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

  const handleDrop = async (e, day) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      // Create new date string in YYYY-MM-DD format based on local time
      // using month and year of currentDate
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const newDate = `${year}-${month}-${dayStr}`;
      
      await updateTask(taskId, { due_date: newDate });
    }
  };

  // Generate calendar cells
  const cells = [];
  
  // Empty cells before start of month
  for (let i = 0; i < firstDayOfMonth; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  
  // Days of the month
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    
    // Filter tasks for this day
    const dayTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return task.due_date === dateStr || task.due_date.startsWith(dateStr);
    });
    
    cells.push(
      <div 
        key={`day-${day}`} 
        className={`calendar-day ${isToday ? 'today' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, day)}
      >
        <span className="day-number">{day}</span>
        <div className="calendar-tasks">
          {dayTasks.map(task => (
            <div 
              key={task.id} 
              className={`calendar-task ${task.is_completed ? 'completed' : ''} ${task.priority ? task.priority.toLowerCase() + '-priority' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, task.id)}
              title={getDynamicTaskTitle(task.title, language)}
            >
              {getDynamicTaskTitle(task.title, language)}
            </div>
          ))}
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
    <div className="card calendar-card" style={{ marginBottom: '30px' }}>
      <div className="calendar-header">
        <h3>{currentMonthName} {currentDate.getFullYear()}</h3>
        <div className="calendar-nav">
          <button onClick={prevMonth}><ChevronLeft size={18} /></button>
          <button onClick={() => setCurrentDate(new Date())}>{language === 'id' ? 'Hari Ini' : 'Today'}</button>
          <button onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div className="calendar-grid">
        {currentDayNames.map(dayName => (
          <div key={dayName} className="calendar-day-name">{dayName}</div>
        ))}
        {cells}
      </div>
    </div>
  );
};

export default Calendar;
