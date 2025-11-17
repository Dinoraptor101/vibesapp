/**
 * CreatePostForm Component
 *
 * Form for creating a new post with image upload and optional caption.
 * Silently gets user location in background (required by backend).
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button, Textarea } from '@/components/ui-next';
import { uploadImage } from '../api/s3Service';
import type { ImageFile, UploadProgress } from '../utils/imageUtils';
import { ImageUploader } from './ImageUploader';

interface Location {
  lat: number;
  lon: number;
  city?: string;
}

interface CreatePostFormProps {
  onSubmit: (data: { image: string; text?: string; location: Location }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  onArticleModeChange?: (isArticleMode: boolean) => void; // Notify parent when switching to article mode
}

const MAX_CAPTION_LENGTH = 5000;

export function CreatePostForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  onArticleModeChange,
}: CreatePostFormProps) {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Notify parent when switching between caption/article mode
  useEffect(() => {
    const isArticleMode = caption.length > 100;
    onArticleModeChange?.(isArticleMode);
  }, [caption.length, onArticleModeChange]);

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
          text: caption.trim() || undefined,
          location,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        setUploadProgress(null);
      }
    },
    [selectedImage, caption, location, onSubmit]
  );

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

      {/* Caption / Article */}
      <div>
        <label
          htmlFor="caption"
          className="block text-sm font-medium text-text-primary dim:text-gray-100 mb-2"
        >
          <span className="transition-all duration-300">
            {caption.length > 100 ? 'Article' : 'Caption'}
          </span>{' '}
          <span className="text-text-tertiary dim:text-gray-400">(Optional)</span>
        </label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Share your thoughts..."
          maxLength={MAX_CAPTION_LENGTH}
          rows={caption.length <= 100 ? 3 : 8}
          disabled={isSubmitting || uploadProgress !== null}
          className="resize-none max-h-[50vh] overflow-y-auto transition-all duration-300"
        />
        {/* Only show character count when approaching limit (80% = 4000 chars) */}
        {caption.length >= MAX_CAPTION_LENGTH * 0.8 && (
          <div className="mt-1 text-sm text-text-tertiary dim:text-gray-400 text-right animate-in fade-in duration-300">
            {caption.length}/{MAX_CAPTION_LENGTH}
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
