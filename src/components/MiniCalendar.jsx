import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useWeddingStore from '../store/useWeddingStore';
import { useTranslation } from '../store/useLanguageStore';
import '../styles/MiniCalendar.css';

const MiniCalendar = ({ onDateClick }) => {
  const { tasks, profile } = useWeddingStore();
  const { language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const dayNames = ["S", "M", "T", "W", "T", "F", "S"];
  const dayNamesId = ["M", "S", "S", "R", "K", "J", "S"];

  const currentMonthName = language === 'id' ? monthNamesId[currentDate.getMonth()] : monthNames[currentDate.getMonth()];
  const currentDayNames = language === 'id' ? dayNamesId : dayNames;

  const formatDateStr = (dateObj) => {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  };

  const renderMonthView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    const cells = [];
    const today = new Date();
    
    // Empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(<div key={`empty-${i}`} className="mini-calendar-day empty"></div>);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDateStr(cellDate);
      const isToday = cellDate.getDate() === today.getDate() && cellDate.getMonth() === today.getMonth() && cellDate.getFullYear() === today.getFullYear();
      
      const hasTask = tasks.some(task => task.due_date && (task.due_date === dateStr || task.due_date.startsWith(dateStr)));
      const isWeddingDay = profile?.wedding_date && dateStr === profile.wedding_date;
      
      cells.push(
        <div 
          key={`day-${day}`} 
          className={`mini-calendar-day ${isToday ? 'today' : ''} ${isWeddingDay ? 'wedding-day' : ''}`}
          onClick={() => onDateClick && onDateClick(dateStr)}
          title={isWeddingDay ? (language === 'id' ? 'Hari Pernikahan 💍' : 'Wedding Day 💍') : undefined}
        >
          {isWeddingDay ? (
            <div className="wedding-heart-wrap">
              <svg viewBox="0 0 24 24" className="wedding-heart-svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="var(--color-primary)"/>
              </svg>
              <span className="wedding-day-num">{day}</span>
            </div>
          ) : (
            <>
              <span>{day}</span>
              {hasTask && <div className="event-dot"></div>}
            </>
          )}
        </div>
      );
    }

    return (
      <div className="mini-calendar-grid">
        {currentDayNames.map((dayName, idx) => (
          <div key={`mn-${idx}`} className="mini-calendar-day-name">{dayName}</div>
        ))}
        {cells}
      </div>
    );
  };

  return (
    <div className="mini-calendar-container">
      <div className="mini-calendar-header">
        <h4>{currentMonthName} {currentDate.getFullYear()}</h4>
        <div className="mini-calendar-nav">
          <button onClick={prevMonth}><ChevronLeft size={16} /></button>
          <button onClick={nextMonth}><ChevronRight size={16} /></button>
        </div>
      </div>
      {renderMonthView()}
    </div>
  );
};

export default MiniCalendar;
