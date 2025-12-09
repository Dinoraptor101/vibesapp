/**
 * CaptionArticleToggle Component
 *
 * Segmented control for switching between Caption and Article modes.
 * Caption tab becomes disabled when text length exceeds 100 characters.
 */

import { cn } from '@/lib/cn';

export type PostMode = 'caption' | 'article';

interface CaptionArticleToggleProps {
  mode: PostMode;
  onModeChange: (mode: PostMode) => void;
  textLength: number;
  disabled?: boolean;
}

const CAPTION_MAX_LENGTH = 100;

export function CaptionArticleToggle({
  mode,
  onModeChange,
  textLength,
  disabled = false,
}: CaptionArticleToggleProps) {
  const canSwitchToCaption = textLength <= CAPTION_MAX_LENGTH;

  return (
    <div className="relative w-full border-b border-border dim:border-gray-600">
      {/* Toggle Tabs */}
      <div className="flex w-full">
        {/* Caption Tab */}
        <button
          type="button"
          onClick={() => canSwitchToCaption && onModeChange('caption')}
          disabled={disabled || !canSwitchToCaption}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
            mode === 'caption'
              ? 'text-brand border-b-2 border-brand'
              : canSwitchToCaption
                ? 'text-text-secondary hover:text-text-primary cursor-pointer'
                : 'text-text-tertiary cursor-not-allowed opacity-50'
          )}
          aria-label="Caption mode"
          aria-selected={mode === 'caption'}
          role="tab"
          title={
            !canSwitchToCaption
              ? `Caption mode disabled (text exceeds ${CAPTION_MAX_LENGTH} characters)`
              : 'Switch to caption mode'
          }
        >
          Caption
        </button>

        {/* Article Tab */}
        <button
          type="button"
          onClick={() => onModeChange('article')}
          disabled={disabled}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-all duration-200',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
            mode === 'article'
              ? 'text-brand border-b-2 border-brand'
              : 'text-text-secondary hover:text-text-primary cursor-pointer'
          )}
          aria-label="Article mode"
          aria-selected={mode === 'article'}
          role="tab"
          title="Switch to article mode"
        >
          Article
        </button>
      </div>
    </div>
  );
}
