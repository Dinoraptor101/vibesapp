import type React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | boolean;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  const base =
    'w-full px-3 py-2 rounded-md border bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand';
  const errorClass = error ? 'border-red-400' : 'border-gray-200';
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <input id={inputId} className={`${base} ${errorClass} ${className}`} {...props} />
      {error && typeof error === 'string' && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
