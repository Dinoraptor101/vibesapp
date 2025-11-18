/**
 * ReportPostPage
 * Full-screen page for reporting posts
 * - ZEN approach: Select reason = Submit report (no separate submit button)
 * - Navigation instead of modal
 * - Use back button to cancel
 */

import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui-next';
import { useReportPost } from '@/features/posts';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading', description: 'Repetitive or fake content' },
  {
    value: 'pornographic',
    label: 'Inappropriate content',
    description: 'Adult or sexual content',
  },
  {
    value: 'hate_speech',
    label: 'Harassment or hate speech',
    description: 'Offensive or harmful content',
  },
] as const;

export function ReportPostPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { mutate: reportPost, isPending } = useReportPost();

  const handleReasonSelect = (reason: 'spam' | 'pornographic' | 'hate_speech') => {
    if (!postId || hasSubmitted) return;

    setHasSubmitted(true);
    // ZEN approach: Selecting a reason immediately submits the report
    reportPost(
      {
        postId,
        reason,
      },
      {
        onSuccess: () => {
          // Navigate back after successful report
          navigate(-1);
        },
        onError: (error) => {
          console.error('Failed to report post:', error);
          setHasSubmitted(false); // Allow retry on error
        },
      }
    );
  };

  if (!postId) {
    console.error('Missing postId');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft size={20} />}
            onClick={() => navigate(-1)}
            aria-label="Go back"
            disabled={isPending}
          />
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h1 className="text-lg font-semibold text-foreground">Report Post</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="space-y-6">
          {/* Description */}
          <p className="text-sm text-text-secondary">
            Help us maintain a safe community. Select a reason for reporting this post.
          </p>

          {/* Report Reasons */}
          <div className="space-y-3">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                onClick={() => handleReasonSelect(reason.value)}
                disabled={isPending || hasSubmitted}
                className="w-full text-left px-4 py-4 rounded-lg border border-border hover:border-warning/50 bg-surface hover:bg-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-base font-medium text-text-primary group-hover:text-warning transition-colors">
                    {reason.label}
                  </span>
                  <span className="text-sm text-text-secondary">{reason.description}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
