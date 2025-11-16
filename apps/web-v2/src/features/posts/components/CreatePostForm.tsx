/**
 * CreatePostForm Component
 *
 * Form for creating a new post with image upload and optional caption.
 */

import { AlertCircle, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button, Textarea } from '@/components/ui-next';
import { uploadImage } from '../api/s3Service';
import type { ImageFile, UploadProgress } from '../utils/imageUtils';
import { ImageUploader } from './ImageUploader';

interface CreatePostFormProps {
  onSubmit: (data: { image: string; text?: string }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MAX_CAPTION_LENGTH = 500;

export function CreatePostForm({ onSubmit, onCancel, isSubmitting = false }: CreatePostFormProps) {
  const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);
  const [caption, setCaption] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validation
      if (!selectedImage?.compressed) {
        setError('Please select an image');
        return;
      }

      try {
        // Upload image to S3
        const imageKey = await uploadImage(selectedImage.compressed, setUploadProgress);

        // Submit post
        onSubmit({
          image: imageKey,
          text: caption.trim() || undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        setUploadProgress(null);
      }
    },
    [selectedImage, caption, onSubmit]
  );

  const canSubmit = selectedImage && !isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image uploader */}
      <div>
        <div className="block text-sm font-medium text-text-primary dim:text-gray-100 mb-2">
          Photo <span className="text-red-500 dim:text-red-400">*</span>
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
        <label
          htmlFor="caption"
          className="block text-sm font-medium text-text-primary dim:text-gray-100 mb-2"
        >
          Caption <span className="text-text-tertiary dim:text-gray-400">(Optional)</span>
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
        <div className="mt-1 text-sm text-text-tertiary dim:text-gray-400 text-right">
          {caption.length}/{MAX_CAPTION_LENGTH}
        </div>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary dim:text-gray-300">Uploading...</span>
            <span className="text-text-primary dim:text-gray-100 font-medium">
              {uploadProgress.percentage}%
            </span>
          </div>
          <div className="w-full bg-surface-secondary dim:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

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
