import { useState } from 'react';

export type PolarityValue = 'YIN' | 'YANG' | 'NEUTRAL';

interface PolarityToggleProps {
  value: PolarityValue;
  onChange: (value: PolarityValue) => void;
  disabled?: boolean;
  loading?: boolean;
  showError?: boolean;
  onToggle?: () => Promise<void> | void;
  className?: string;
  'aria-label'?: string;
}

export function PolarityToggle({
  value,
  onChange,
  disabled = false,
  loading = false,
  showError = false,
  onToggle,
  className = '',
  'aria-label': ariaLabel,
}: PolarityToggleProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleClick = async () => {
    if (disabled || loading || isToggling) return;

    if (onToggle) {
      // Custom toggle handler (for AccountTab with fetch-first)
      setIsToggling(true);
      try {
        await onToggle();
      } finally {
        setIsToggling(false);
      }
    } else {
      // Simple toggle handler (for SignupWizard)
      if (value === 'NEUTRAL') {
        onChange('YANG'); // Default to YANG when recovering from neutral
      } else {
        onChange(value === 'YIN' ? 'YANG' : 'YIN');
      }
    }
  };

  const isLoading = loading || isToggling;

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <span className="text-sm font-semibold text-text-primary">YIN</span>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`relative inline-flex h-14 w-28 items-center rounded-full bg-surface ring-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          showError
            ? 'ring-red-300 dim:ring-red-500 dark:ring-red-600'
            : isLoading
              ? 'ring-blue-300 dim:ring-blue-500 dark:ring-blue-600'
              : 'ring-border'
        }`}
        aria-label={
          ariaLabel ||
          `Current polarity: ${value === 'NEUTRAL' ? 'Unknown - click to set' : value}${
            isLoading ? ' (updating...)' : ''
          }`
        }
      >
        <span
          className={`absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg shadow-lg transition-all duration-300 ease-in-out ${
            value === 'NEUTRAL'
              ? 'translate-x-9 from-gray-400 to-gray-500'
              : value === 'YANG'
                ? 'translate-x-16 from-orange-400 to-red-500'
                : 'translate-x-2 from-blue-400 to-purple-500'
          }`}
        >
          {value === 'NEUTRAL' ? '○' : value === 'YIN' ? '🌙' : '☀️'}
        </span>
      </button>

      <span className="text-sm font-semibold text-text-primary">YANG</span>
    </div>
  );
}
