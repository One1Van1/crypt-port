import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';
import { Calendar, X } from 'lucide-react';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';
import './DatePickerOverrides.css';

registerLocale('ru', ru);

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

export default function DatePicker({
  selected,
  onChange,
  placeholder = 'Выберите дату',
  minDate,
  maxDate,
}: DatePickerProps) {
  const formatDateInput = (input: string) => {
    if (!input) return '';
    
    // Удаляем все нецифровые символы
    const numbers = input.replace(/\D/g, '');
    
    // Форматируем с точками
    let formatted = '';
    if (numbers.length > 0) {
      formatted = numbers.substring(0, 2);
      if (numbers.length >= 3) {
        formatted += '.' + numbers.substring(2, 4);
      }
      if (numbers.length >= 5) {
        formatted += '.' + numbers.substring(4, 8);
      }
    }
    
    return formatted;
  };

  const handleChangeRaw = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!e?.target?.value) return;
    const input = e.target.value;
    const formatted = formatDateInput(input);
    e.target.value = formatted;
  };

  return (
    <div className="date-picker-wrapper">
      <Calendar size={16} className="date-picker-icon" />
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        onSelect={handleChangeRaw as any}
        locale="ru"
        dateFormat="dd.MM.yyyy"
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder}
        popperClassName="date-picker-popper"
        calendarClassName="date-picker-calendar"
        showPopperArrow={false}
        fixedHeight
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        className="date-picker-input"
        wrapperClassName="date-picker-input-wrapper"
      />
      {selected && (
        <button
          type="button"
          className="date-picker-clear"
          onClick={() => onChange(null)}
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
