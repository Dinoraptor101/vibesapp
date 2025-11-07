/**
 * CreatePostForm Component
 *
 * Form for creating a new post with image upload, optional caption, and location.
 */

import { AlertCircle, Loader2, MapPin } from 'lucide-react';
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
}

const MAX_CAPTION_LENGTH = 500;

export function CreatePostForm({ onSubmit, onCancel, isSubmitting = false }: CreatePostFormProps) {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get user location on mount
  const handleGetLocation = useCallback(() => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (err) => {
        let errorMessage = 'Failed to get location';
        if (err.code === 1) {
          errorMessage = 'Location permission denied';
        } else if (err.code === 2) {
          errorMessage = 'Location unavailable';
        } else if (err.code === 3) {
          errorMessage = 'Location request timed out';
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        timeout: 5000,
        maximumAge: 300000, // 5 minutes
        enableHighAccuracy: false,
      }
    );
  }, []);

  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

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
        setError('Location is required. Please allow location access or try again.');
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
    [selectedImage, location, caption, onSubmit]
  );

  const canSubmit = selectedImage && location && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image uploader */}
      <div>
        <div className="block text-sm font-medium text-text-primary mb-2">
          Photo <span className="text-red-500">*</span>
        </div>
        <ImageUploader
          onImageSelect={setSelectedImage}
          onImageRemove={() => setSelectedImage(null)}
          selectedImage={selectedImage}
          disabled={isSubmitting || uploadProgress !== null}
        />
      </div>

      {/* Caption */}
      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-text-primary mb-2">
          Caption <span className="text-text-tertiary">(Optional)</span>
        </label>
        <Textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Share your thoughts..."
          maxLength={MAX_CAPTION_LENGTH}
          rows={3}
          disabled={isSubmitting || uploadProgress !== null}
          className="resize-none"
        />
        <div className="mt-1 text-sm text-text-tertiary text-right">
          {caption.length}/{MAX_CAPTION_LENGTH}
        </div>
      </div>

      {/* Location */}
      <div>
        <div className="block text-sm font-medium text-text-primary mb-2">
          Location <span className="text-red-500">*</span>
        </div>

        {isGettingLocation && (
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Getting your location...</span>
          </div>
        )}

        {location && !isGettingLocation && (
          <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-text-primary">
              <MapPin className="w-4 h-4 text-brand-primary" />
              <span>
                {location.city || `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetLocation}
              disabled={isSubmitting || uploadProgress !== null}
            >
              Update
            </Button>
          </div>
        )}

        {locationError && !location && (
          <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-orange-500">{locationError}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isSubmitting}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Uploading...</span>
            <span className="text-text-primary font-medium">{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-500">{error}</p>
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
