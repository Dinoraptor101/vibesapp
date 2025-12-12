export type FeedbackType = 'bug' | 'feature';

interface FeedbackTypeToggleProps {
  value: FeedbackType;
  onChange: (value: FeedbackType) => void;
  disabled?: boolean;
  className?: string;
}

export function FeedbackTypeToggle({
  value,
  onChange,
  disabled = false,
  className = '',
}: FeedbackTypeToggleProps) {
  const handleClick = () => {
    if (disabled) return;
    const newValue = value === 'bug' ? 'feature' : 'bug';
    onChange(newValue);
  };

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* Left label - Bug */}
      <span
        className="text-sm font-semibold text-red-600 dark:text-red-400 dim:text-red-400 w-16 text-right"
        data-testid="feedback-type-bug"
      >
        Bug
      </span>

      {/* Toggle button - centered */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="relative inline-flex h-14 w-24 items-center rounded-full bg-white dark:bg-gray-800 dim:bg-gray-800 ring-2 ring-gray-300 dark:ring-gray-600 dim:ring-gray-600 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex-shrink-0"
        aria-label={`Current type: ${value === 'bug' ? 'Bug Report' : 'Feature Request'}`}
        data-testid="feedback-type-toggle"
      >
        {/* Icon slider */}
        <span
          className={`absolute inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-xl shadow-lg transition-all duration-300 ease-in-out ${
            value === 'feature'
              ? 'translate-x-12 from-blue-300 to-indigo-500'
              : 'translate-x-2 from-red-300 to-orange-500'
          }`}
        >
          {value === 'bug' ? '🪲' : '🦋'}
        </span>
      </button>

      {/* Right label - Feature */}
      <span
        className="text-sm font-semibold text-blue-600 dark:text-blue-400 dim:text-blue-400 w-16 text-left"
        data-testid="feedback-type-feature"
      >
        Feature
      </span>
    </div>
  );
}
