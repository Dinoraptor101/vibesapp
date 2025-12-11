import { useMutation } from '@tanstack/react-query';
import { Upload, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { uploadImage } from '@/features/posts/api/s3Service';
import { APP_VERSION } from '@/lib/constants';
import { getBuildVersion } from '@/utils/versionCheck';
import { submitFeedback } from '../api/feedbackService';
import type { Priority } from '../types';
import { FeedbackTypeToggle } from './FeedbackTypeToggle';

export function FeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [priority, setPriority] = useState<Priority>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>();
  const [screenshotFile, setScreenshotFile] = useState<{ name: string; size: number } | null>(null);
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation checks
  const isTitleValid = title.length >= 5 && title.length <= 50;
  const isDescriptionValid = description.length >= 100 && description.length <= 500;
  const isPriorityValid = type === 'feature' || priority !== '';
  const isFormValid = isTitleValid && isDescriptionValid && isPriorityValid;

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
      setPriority('');
      setScreenshotUrl(undefined);
      setScreenshotFile(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      description,
      type,
      priority: type === 'feature' ? 'medium' : (priority as Exclude<Priority, ''>),
      screenshotUrl,
      appVersion: APP_VERSION,
      buildVersion: getBuildVersion() || 'Unknown',
      userAgent: navigator.userAgent,
    });
  };

  const handleScreenshotSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScreenshotError('Image must be less than 10MB');
      return;
    }

    setScreenshotError(null);
    setScreenshotUploading(true);

    try {
      const s3Key = await uploadImage(file);
      setScreenshotUrl(s3Key);
      setScreenshotFile({ name: file.name, size: file.size });
    } catch (error) {
      setScreenshotError('Failed to upload screenshot. Please try again.');
      console.error('Screenshot upload error:', error);
    } finally {
      setScreenshotUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection - Toggle Style */}
      <div>
        <FeedbackTypeToggle value={type} onChange={setType} />
      </div>

      {/* Priority Selection - Only for bugs */}
      {type === 'bug' && (
        <select
          id="priority-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dim:bg-gray-800 text-base text-gray-900 dark:text-gray-100 dim:text-gray-100 border-gray-300 dark:border-gray-600 dim:border-gray-600"
          data-testid="feedback-priority-select"
        >
          <option value="" className="text-gray-400">
            Priority
          </option>
          <option value="critical">🔴 Critical - App is broken/unusable</option>
          <option value="high">🟠 High - Major issue, needs attention soon</option>
          <option value="medium">🟡 Medium - Should be fixed, but not urgent</option>
          <option value="low">🟢 Low - Nice to have, minor issue</option>
        </select>
      )}

      {/* Title */}
      <div>
        <input
          type="text"
          placeholder="Brief summary (5-50 characters)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={50}
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dim:bg-gray-800 text-base text-gray-900 dark:text-gray-100 dim:text-gray-100 border-gray-300 dark:border-gray-600 dim:border-gray-600"
          data-testid="feedback-title-input"
        />
        {title.length > 0 && (
          <p
            className={`text-xs mt-1 ${isTitleValid ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'}`}
          >
            {title.length}/50 characters (minimum 5)
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <textarea
          placeholder={
            type === 'bug'
              ? 'Steps to reproduce:\nGiven this state\nWhen I do this\nThen that happened'
              : 'Describe the feature. What problem does it solve? (100-500 characters)'
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={6}
          className="w-full p-3 border rounded-lg bg-white dark:bg-gray-800 dim:bg-gray-800 text-base text-gray-900 dark:text-gray-100 dim:text-gray-100 border-gray-300 dark:border-gray-600 dim:border-gray-600"
          data-testid="feedback-description-input"
        />
        {description.length > 0 && (
          <p
            className={`text-xs mt-1 ${isDescriptionValid ? 'text-gray-500 dark:text-gray-400' : 'text-red-500'}`}
          >
            {description.length}/500 characters (100-500 required)
          </p>
        )}
      </div>

      {/* Screenshot Upload - Only for bugs, optional */}
      {type === 'bug' && (
        <div>
          <div className="block text-sm font-medium text-gray-700 dim:text-gray-200 dark:text-gray-300 mb-2">
            Screenshot (optional)
          </div>

          {screenshotUrl ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 dim:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 dim:border-green-800">
              <div className="flex-1">
                <span className="text-green-700 dark:text-green-400 dim:text-green-400 text-sm font-medium">
                  ✓ Uploaded: {screenshotFile?.name}
                </span>
                {screenshotFile && (
                  <span className="text-green-600 dark:text-green-500 dim:text-green-500 text-xs block mt-1">
                    {(screenshotFile.size / 1024).toFixed(2)} KB
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setScreenshotUrl(undefined);
                  setScreenshotFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="text-green-700 dark:text-green-400 dim:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                aria-label="Remove screenshot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="screenshot-input"
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dim:bg-gray-800 border-gray-300 dark:border-gray-600 dim:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 dim:hover:bg-gray-700"
            >
              <Upload className="w-6 h-6 mb-2 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dim:text-gray-300">
                {screenshotUploading ? 'Uploading...' : 'Click to upload screenshot'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 dim:text-gray-400 mt-1">
                PNG, JPG up to 10MB
              </span>
              <input
                id="screenshot-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleScreenshotSelect}
                disabled={screenshotUploading || mutation.isPending}
                className="hidden"
                data-testid="feedback-screenshot-input"
              />
            </label>
          )}

          {screenshotError && <p className="text-sm text-red-500 mt-2">{screenshotError}</p>}
        </div>
      )}

      {/* Submit Button - Visible but disabled until form is valid */}
      <button
        type="submit"
        disabled={!isFormValid || mutation.isPending}
        className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-base font-medium rounded-lg transition-colors"
        data-testid="feedback-submit-button"
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {mutation.isSuccess && (
        <p
          className="text-base text-green-600 dark:text-green-400 dim:text-green-400"
          data-testid="feedback-success-message"
        >
          Thanks! We'll look into it.
        </p>
      )}

      {mutation.isError && (
        <p
          className="text-base text-red-600 dark:text-red-400 dim:text-red-400"
          data-testid="feedback-error-message"
        >
          Failed to submit feedback. Please try again.
        </p>
      )}
    </form>
  );
}
