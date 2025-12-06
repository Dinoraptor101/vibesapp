export type BiologicalSexValue = 'Male' | 'Female' | null;

interface BiologicalSexToggleProps {
  value: BiologicalSexValue;
  onChange: (value: BiologicalSexValue) => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function BiologicalSexToggle({
  value,
  onChange,
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
}: BiologicalSexToggleProps) {
  const handleClick = () => {
    if (disabled || loading) return;

    // Start with Female if null, otherwise toggle
    const newValue: BiologicalSexValue =
      value === null ? 'Female' : value === 'Male' ? 'Female' : 'Male';
    onChange(newValue);
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <span className="w-16 text-right text-sm font-semibold text-text-primary">FEMALE</span>

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className="relative inline-flex h-14 w-28 mx-3 sm:mx-4 items-center rounded-full bg-surface ring-2 ring-border transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={ariaLabel || `Current selection: ${value || 'None - click to select'}`}
      >
        <span
          className={`absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-lg shadow-lg transition-all duration-300 ease-in-out ${
            value === 'Male'
              ? 'translate-x-16 from-blue-400 to-cyan-500'
              : value === 'Female'
                ? 'translate-x-2 from-pink-400 to-rose-500'
                : 'translate-x-9 from-gray-300 to-gray-400'
          }`}
        >
          {value === 'Male' ? '♂️' : value === 'Female' ? '♀️' : '○'}
        </span>
      </button>

      <span className="w-16 text-left text-sm font-semibold text-text-primary">MALE</span>
    </div>
  );
}
