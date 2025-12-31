import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import './CustomDatePicker.css';

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomDatePicker({ value, onChange, placeholder = 'дд.мм.гггг' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  };

  const formatDateISO = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDateISO(date));
    setIsOpen(false);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) days.push(null);
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    return days;
  };

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="custom-datepicker" ref={containerRef}>
      <button type="button" className={`custom-datepicker-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <span className={selectedDate ? '' : 'placeholder'}>{selectedDate ? formatDate(selectedDate) : placeholder}</span>
        {selectedDate && <X size={14} className="clear-icon" onClick={(e) => { e.stopPropagation(); setSelectedDate(null); onChange(''); }} />}
        <Calendar size={16} className="calendar-icon" />
      </button>
      {isOpen && (
        <div className="custom-datepicker-dropdown">
          <div className="calendar-header">
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>‹</button>
            <span>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
            <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>›</button>
          </div>
          <div className="calendar-weekdays">{weekDays.map(d => <div key={d}>{d}</div>)}</div>
          <div className="calendar-days">
            {getDaysInMonth(currentMonth).map((date, i) => (
              <button key={i} type="button" disabled={!date} className={`${!date ? 'empty' : ''} ${date?.toDateString() === new Date().toDateString() ? 'today' : ''} ${date && selectedDate && date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`} onClick={() => date && handleDateSelect(date)}>
                {date?.getDate() || ''}
              </button>
            ))}
          </div>
          <div className="calendar-footer">
            <button type="button" onClick={() => { const t = new Date(); setCurrentMonth(t); handleDateSelect(t); }}>Сегодня</button>
            <button type="button" onClick={() => { setSelectedDate(null); onChange(''); setIsOpen(false); }}>Удалить</button>
          </div>
        </div>
      )}
    </div>
  );
}
