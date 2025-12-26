import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './CustomSelect.css';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = 'Выберите...' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="custom-select" ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? '' : 'placeholder'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'rotated' : ''}`} />
      </button>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.length > 5 && (
            <div className="custom-select-search">
              <input
                type="text"
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
          )}

          <div className="custom-select-options">
            {filteredOptions.length === 0 ? (
              <div className="custom-select-empty">Ничего не найдено</div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`custom-select-option ${option.value === value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {option.value === value && <Check size={16} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
