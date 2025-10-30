import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './CustomSelector.css';

interface CustomSelectorProps {
  id: string;
  value: string;
  options: { value: string; label: string }[];
  // eslint-disable-next-line no-unused-vars
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  className?: string;
}

const CustomSelector: React.FC<CustomSelectorProps> = ({
  id,
  value,
  options,
  onChange,
  placeholder,
  required,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div className={`custom-selector ${className || ''}`} ref={selectorRef}>
      <div
        className={`custom-selector__selected ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`${id}-selected`}
      >
        {value ? options.find((option) => option.value === value)?.label : placeholder}
      </div>
      {isOpen && (
        <div className="custom-selector__options" data-testid={`${id}-options`}>
          {options.map((option) => (
            <div
              key={option.value}
              className="custom-selector__option"
              onClick={() => handleOptionClick(option.value)}
              data-testid={`${id}-option-${option.value}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      <select
        className="custom-selector__native"
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        data-testid={`${id}-native`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelector;
