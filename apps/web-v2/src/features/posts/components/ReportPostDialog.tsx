/**
 * ReportPostDialog Component
 *
 * Modal dialog for reporting posts with reason selection.
 * Follows ZEN approach: Select reason = Submit report (no separate submit button).
 */

import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-next';
import { useReportPost } from '../hooks/useReportPost';

interface ReportPostDialogProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'pornographic', label: 'Inappropriate content' },
  { value: 'hate_speech', label: 'Harassment or hate speech' },
] as const;

export function ReportPostDialog({ postId, isOpen, onClose }: ReportPostDialogProps) {
  const { mutate: reportPost, isPending } = useReportPost();

  const handleReasonSelect = (reason: 'spam' | 'pornographic' | 'hate_speech') => {
    // ZEN approach: Selecting a reason immediately submits the report
    // Backend will get userId and location from useReportPost hook
    reportPost(
      {
        postId,
        reason,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <DialogTitle>Report Post</DialogTitle>
          </div>
          <DialogDescription>
            Help us maintain a safe community. Select a reason for reporting this post.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.value}
              type="button"
              onClick={() => handleReasonSelect(reason.value)}
              disabled={isPending}
              className="w-full text-left px-4 py-3 rounded-lg border border-border hover:border-warning/50 text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reason.label}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
