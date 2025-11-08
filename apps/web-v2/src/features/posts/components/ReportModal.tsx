/**
 * ReportModal Component
 *
 * Modal for reporting posts with reason selection.
 * Part of the community moderation system (Phase 3.4).
 */

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui-next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui-next/Dialog';
import { cn } from '@/lib/cn';

type ReportReason = 'pornographic' | 'spam' | 'hate_speech';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason) => void;
  isLoading?: boolean;
}

interface ReasonOption {
  value: ReportReason;
  label: string;
  description: string;
}

const REPORT_REASONS: ReasonOption[] = [
  {
    value: 'pornographic',
    label: 'Pornographic content',
    description: 'Sexually explicit or adult content',
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Repetitive, unsolicited, or promotional content',
  },
  {
    value: 'hate_speech',
    label: 'Hate speech / Harassment',
    description: 'Offensive, threatening, or discriminatory content',
  },
];

export function ReportModal({ isOpen, onClose, onSubmit, isLoading }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);

  const handleSubmit = () => {
    if (selectedReason) {
      onSubmit(selectedReason);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Why are you reporting this post? This helps keep the community safe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason.value}
              type="button"
              onClick={() => setSelectedReason(reason.value)}
              className={cn(
                'w-full text-left rounded-lg border p-4 transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
                selectedReason === reason.value
                  ? 'border-brand bg-brand/5 dark:bg-brand/10'
                  : 'border-gray-200 dark:border-gray-700'
              )}
              aria-pressed={selectedReason === reason.value}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2',
                    selectedReason === reason.value
                      ? 'border-brand bg-brand'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  aria-hidden="true"
                >
                  {selectedReason === reason.value && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{reason.label}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {reason.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3 text-sm text-blue-900 dark:text-blue-100">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          <p>
            The post author won't see your report. If multiple users report this post, it may be
            automatically hidden for review.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedReason || isLoading}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
