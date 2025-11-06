import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const base =
    'w-full px-3 py-2 rounded-md border bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand';
  const errorClass = error ? 'border-red-400' : 'border-gray-200';
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}
      <textarea id={textareaId} className={`${base} ${errorClass} ${className}`} {...props} />
      {error && typeof error === 'string' && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Textarea;
