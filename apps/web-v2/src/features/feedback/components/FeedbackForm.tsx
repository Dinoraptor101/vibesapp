import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
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
  const queryClient = useQueryClient();

  // Validation checks
  const isTitleValid = title.length >= 5 && title.length <= 50;
  const isDescriptionValid = description.length >= 100 && description.length <= 500;
  const isPriorityValid = type === 'feature' || priority !== '';
  const isFormValid = isTitleValid && isDescriptionValid && isPriorityValid;

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      onSuccess();
      // Wait 2 seconds before fetching updated list (gives GitHub time to index)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['feedback'] });
      }, 2000);
      // Don't reset form - let success state show
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

  // Show success state instead of form
  return (
    <AnimatePresence mode="wait">
      {mutation.isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-green-500/10 dim:bg-green-500/20 dark:bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500 dim:text-green-400 dark:text-green-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-gray-100">
              Thanks! We'll look into it.
            </h3>
            <p className="text-sm text-gray-600 dim:text-gray-300 dark:text-gray-400 mt-1">
              We've received your feedback
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Type Selection - Toggle Style */}
          <div>
            <FeedbackTypeToggle value={type} onChange={setType} />
          </div>

          {/* Priority Selection - Only for bugs */}
          <AnimatePresence>
            {type === 'bug' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
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
              </motion.div>
            )}
          </AnimatePresence>

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
          <AnimatePresence>
            {type === 'bug' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
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

                  {screenshotError && (
                    <p className="text-sm text-red-500 mt-2">{screenshotError}</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Submit Button - Visible but disabled until form is valid */}
          <button
            type="submit"
            disabled={!isFormValid || mutation.isPending}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white text-base font-medium rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            data-testid="feedback-submit-button"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
          </button>

          {mutation.isError && (
            <p
              className="text-base text-red-600 dark:text-red-400 dim:text-red-400"
              data-testid="feedback-error-message"
            >
              Failed to submit feedback. Please try again.
            </p>
          )}
        </motion.form>
      )}
    </AnimatePresence>
  );
}
