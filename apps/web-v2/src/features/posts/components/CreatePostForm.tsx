/**
 * CreatePostForm Component
 *
 * Form for creating a new post with image upload and optional caption/article.
 * Features:
 * - Caption mode: Short text (≤100 chars), Enter to submit
 * - Article mode: Long text (>100 chars), rich formatting toolbar
 * - Auto-switch between modes based on text length
 * - Tab indentation (desktop) and 3-space auto-indent (mobile)
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui-next';
import { uploadImage } from '../api/s3Service';
import type { ImageFile, UploadProgress } from '../utils/imageUtils';
import { CaptionArticleToggle, type PostMode } from './CaptionArticleToggle';
import { ImageUploader } from './ImageUploader';
import { RichTextEditor, type RichTextEditorRef } from './RichTextEditor';
import { RichTextToolbarV2 } from './RichTextToolbarV2';

interface Location {
  lat: number;
  lon: number;
  city?: string;
}

interface CreatePostFormProps {
  onSubmit: (data: { image: string; text?: string; location: Location }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MAX_TEXT_LENGTH = 5000;
const CAPTION_THRESHOLD = 100; // Switch to article mode after 100 characters

export function CreatePostForm({ onSubmit, onCancel, isSubmitting = false }: CreatePostFormProps) {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<PostMode>('caption');
  const [location, setLocation] = useState<Location | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const richEditorRef = useRef<RichTextEditorRef>(null);

  // Silently get user location on mount (required by backend, but hidden from UI)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        console.warn('Could not get location:', err.message);
        // Set a default location (will be rejected by backend if location is truly required)
        // Backend requires location, so we need some value
      },
      {
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: false,
      }
    );
  }, []);

  // Auto-switch to article mode when text exceeds threshold
  useEffect(() => {
    if (text.length > CAPTION_THRESHOLD && mode === 'caption') {
      setMode('article');
    }
  }, [text.length, mode]);

  // Handle mode change: strip HTML when switching to caption mode
  const handleModeChange = (newMode: PostMode) => {
    if (newMode === 'caption' && mode === 'article') {
      // Strip HTML tags when switching from article to caption
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      const plainText = tempDiv.innerText || tempDiv.textContent || '';
      setText(plainText);
    }
    setMode(newMode);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!selectedImage?.compressed) {
        setError('Please select an image');
        return;
      }

      if (!location) {
        setError('Unable to determine location. Please enable location services and try again.');
        return;
      }

      try {
        // Upload image to S3
        const imageKey = await uploadImage(selectedImage.compressed, setUploadProgress);

        // Submit post
        onSubmit({
          image: imageKey,
          text: text.trim() || undefined,
          location,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        setUploadProgress(null);
      }
    },
    [selectedImage, text, location, onSubmit]
  );

  /**
   * Handle key down for special behaviors (works for both textarea and contentEditable)
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | Element>) => {
    // Caption mode: Enter submits
    if (mode === 'caption' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
      return;
    }

    // Article mode: Tab inserts 4 spaces (only for textarea)
    if (mode === 'article' && e.key === 'Tab' && 'selectionStart' in e.currentTarget) {
      e.preventDefault();
      const textarea = e.currentTarget as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert 4 spaces at cursor
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      setText(newValue);

      // Move cursor after inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  /**
   * Handle textarea change with 3-space auto-indent (mobile)
   */
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Mobile 3-space auto-indent: detect 3 consecutive spaces and replace with 4
    if (mode === 'article') {
      const cursorPos = e.target.selectionStart;
      const beforeCursor = newValue.substring(0, cursorPos);
      const afterCursor = newValue.substring(cursorPos);

      // Check if last 3 characters are spaces
      if (beforeCursor.endsWith('   ')) {
        // Replace last 3 spaces with 4 spaces
        newValue = beforeCursor.slice(0, -3) + '    ' + afterCursor;
        setText(newValue);

        // Restore cursor position
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = cursorPos + 1;
          }
        }, 0);
        return;
      }
    }

    setText(newValue);
  };

  const canSubmit = selectedImage && location && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image uploader with progress overlay */}
      <div>
        <div className="block text-sm font-medium text-text-primary dim:text-gray-100 mb-2">
          Photo <span className="text-red-500 dim:text-red-400">*</span>
        </div>
        <div className="relative">
          <ImageUploader
            onImageSelect={setSelectedImage}
            onImageRemove={() => setSelectedImage(null)}
            selectedImage={selectedImage}
            disabled={isSubmitting || uploadProgress !== null}
          />

          {/* Circular Progress Overlay (ZEN style) */}
          {uploadProgress && selectedImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
              <div className="relative">
                {/* Circular progress ring */}
                <svg
                  className="w-24 h-24 transform -rotate-90"
                  viewBox="0 0 100 100"
                  role="img"
                  aria-label="Upload progress"
                >
                  <title>Upload progress: {uploadProgress.percentage}%</title>
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-white/20"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - uploadProgress.percentage / 100)}`}
                    className="text-white transition-all duration-300"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Percentage text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-white">
                    {uploadProgress.percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Caption/Article Toggle */}
      <div className="space-y-4">
        <CaptionArticleToggle
          mode={mode}
          onModeChange={handleModeChange}
          textLength={text.length}
          disabled={isSubmitting || uploadProgress !== null}
        />

        {/* Article Mode: Toolbar + ContentEditable */}
        {mode === 'article' && (
          <>
            <RichTextToolbarV2 editorRef={richEditorRef} />
            <div>
              <label htmlFor="post-text" className="sr-only">
                Article (Optional)
              </label>
              <RichTextEditor
                ref={richEditorRef}
                value={text}
                onChange={setText}
                placeholder="Write your article..."
                maxLength={MAX_TEXT_LENGTH}
                disabled={isSubmitting || uploadProgress !== null}
                onKeyDown={handleKeyDown}
              />
              <p id="article-hint" className="mt-1 text-xs text-text-tertiary dim:text-gray-400">
                Tab for indentation, Enter for new line
              </p>
            </div>
          </>
        )}

        {/* Caption Mode: Simple Textarea */}
        {mode === 'caption' && (
          <div>
            <label htmlFor="post-text" className="sr-only">
              Caption (Optional)
            </label>
            <textarea
              ref={textareaRef}
              id="post-text"
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Share your thoughts..."
              maxLength={MAX_TEXT_LENGTH}
              rows={3}
              disabled={isSubmitting || uploadProgress !== null}
              className="w-full px-4 py-2 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none bg-surface text-text-primary placeholder:text-text-secondary dim:bg-gray-700 dim:text-gray-100 dim:placeholder:text-gray-400 border border-border focus:ring-brand focus:border-brand dim:border-gray-600 dim:focus:ring-brand/50 dim:focus:border-brand max-h-[50vh] overflow-y-auto disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Caption text input"
              aria-describedby="caption-hint"
            />
            <p id="caption-hint" className="mt-1 text-xs text-text-tertiary dim:text-gray-400">
              Press Enter to submit
            </p>
          </div>
        )}

        {/* Character counter (80% threshold) */}
        {text.length >= MAX_TEXT_LENGTH * 0.8 && (
          <div className="mt-1 text-sm text-text-tertiary dim:text-gray-400 text-right animate-in fade-in duration-300">
            <span className={text.length > MAX_TEXT_LENGTH ? 'text-error font-medium' : ''}>
              {text.length}/{MAX_TEXT_LENGTH}
            </span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500/10 dim:bg-red-500/20 border border-red-500/20 dim:border-red-500/30 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 dim:text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-500 dim:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting || uploadProgress !== null}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!canSubmit || uploadProgress !== null}
          leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
