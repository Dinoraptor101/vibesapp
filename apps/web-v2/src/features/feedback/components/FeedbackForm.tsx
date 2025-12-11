import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitFeedback } from '../api/feedbackService';
import { APP_VERSION } from '@/lib/constants';
import { submitFeedback } from '../api/feedbackService';
import type { Priority } from '../types';

export function FeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [priority, setPriority] = useState<Priority>('medium');
  const [screenshotUrl, setScreenshotUrl] = useState<string>();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      // Invalidate feedback list to show newly submitted feedback
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      onSuccess();
      // Reset form
      setTitle('');
      setDescription('');
      setType('bug');
      setPriority('medium');
      setScreenshotUrl(undefined);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      description,
      type,
      priority,
      screenshotUrl,
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="bug"
            checked={type === 'bug'}
            onChange={() => setType('bug')}
            className="cursor-pointer"
            data-testid="feedback-type-bug"
          />
          <span>🐛 Bug Report</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="feature"
            checked={type === 'feature'}
            onChange={() => setType('feature')}
            className="cursor-pointer"
            data-testid="feedback-type-feature"
          />
          <span>✨ Feature Request</span>
        </label>
      </div>

      {/* Priority Selection */}
      <div>
        <label
          htmlFor="priority-select"
          className="block text-sm font-medium mb-2 text-gray-900 dark:text-gray-100 dim:text-gray-100"
        >
          Priority
        </label>
        <select
          id="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dim:bg-gray-800 text-gray-900 dark:text-gray-100 dim:text-gray-100 border-gray-300 dark:border-gray-600 dim:border-gray-600"
          data-testid="feedback-priority-select"
        >
          <option value="critical">🔴 Critical - App is broken/unusable</option>
          <option value="high">🟠 High - Major issue, needs attention soon</option>
          <option value="medium">🟡 Medium - Should be fixed, but not urgent</option>
          <option value="low">🟢 Low - Nice to have, minor issue</option>
        </select>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Brief summary..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dim:bg-gray-800 text-gray-900 dark:text-gray-100 dim:text-gray-100 border-gray-300 dark:border-gray-600 dim:border-gray-600"
        data-testid="feedback-title-input"
      />

      {/* Description */}
      <textarea
        placeholder={
          type === 'bug'
            ? 'What happened? What did you expect? Steps to reproduce...'
            : 'Describe the feature. What problem does it solve?'
        }
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
        required
        className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dim:bg-gray-800 text-gray-900 dark:text-gray-100 dim:text-gray-100 border-gray-300 dark:border-gray-600 dim:border-gray-600"
        data-testid="feedback-description-input"
      />

      {/* Screenshot Upload - TODO: Add S3Upload component integration */}
      {/* For now, users can paste screenshot URLs in the description */}

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
        data-testid="feedback-submit-button"
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {mutation.isSuccess && (
        <p
          className="text-green-600 dark:text-green-400 dim:text-green-400"
          data-testid="feedback-success-message"
        >
          Thanks! We'll look into it.
        </p>
      )}

      {mutation.isError && (
        <p
          className="text-red-600 dark:text-red-400 dim:text-red-400"
          data-testid="feedback-error-message"
        >
          Failed to submit feedback. Please try again.
        </p>
      )}
    </form>
  );
}
