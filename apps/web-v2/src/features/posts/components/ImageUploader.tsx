/**
 * ImageUploader Component
 *
 * Drag-and-drop or file picker for image uploads with preview and compression.
 * Shows upload progress and handles validation.
 */

import { Image as ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui-next';
import {
  validateImageFile,
  compressImage,
  createImagePreview,
  revokeImagePreview,
  formatFileSize,
  type ImageFile,
} from '../utils/imageUtils';

interface ImageUploaderProps {
  onImageSelect: (file: ImageFile) => void;
  onImageRemove: () => void;
  selectedImage: ImageFile | null;
  disabled?: boolean;
}

export function ImageUploader({
  onImageSelect,
  onImageRemove,
  selectedImage,
  disabled = false,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        return;
      }

      // Create preview
      const preview = createImagePreview(file);

      // Compress image
      setIsCompressing(true);
      try {
        const compressed = await compressImage(file);

        onImageSelect({
          file,
          preview,
          compressed,
        });
      } catch {
        setError('Failed to process image');
        revokeImagePreview(preview);
      } finally {
        setIsCompressing(false);
      }
    },
    [onImageSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [disabled, handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    if (selectedImage) {
      revokeImagePreview(selectedImage.preview);
    }
    setError(null);
    onImageRemove();
  }, [selectedImage, onImageRemove]);

  // Show image preview if selected
  if (selectedImage) {
    return (
      <div className="relative w-full">
        <img
          src={selectedImage.preview}
          alt="Selected"
          className="w-full aspect-square object-cover rounded-lg"
        />

        {/* Remove button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleRemove}
          disabled={disabled}
          className="absolute top-2 right-2"
          aria-label="Remove image"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* File info */}
        <div className="mt-2 text-sm text-text-secondary">
          <p>Original: {formatFileSize(selectedImage.file.size)}</p>
          {selectedImage.compressed && (
            <p>Compressed: {formatFileSize(selectedImage.compressed.size)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        id="image-upload-input"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInput}
        disabled={disabled}
        className="sr-only"
      />

      {/* Drop zone */}
      <label
        htmlFor="image-upload-input"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          block relative border-2 border-dashed rounded-lg p-8
          transition-colors duration-200
          ${isDragging ? 'border-brand-primary bg-brand-primary/5' : 'border-border'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-brand-primary'}
        `}
      >
        {isCompressing ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
            <p className="text-sm text-text-secondary">Compressing image...</p>
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="flex flex-col items-center justify-center space-y-3">
              {isDragging ? (
                <Upload className="w-12 h-12 text-brand-primary" />
              ) : (
                <ImageIcon className="w-12 h-12 text-text-tertiary" />
              )}

              {/* Text */}
              <div className="text-center">
                <p className="text-base font-medium text-text-primary">
                  {isDragging ? 'Drop image here' : 'Drag and drop an image'}
                </p>
                <p className="text-sm text-text-secondary mt-1">or click to browse</p>
                <p className="text-xs text-text-tertiary mt-2">JPEG, PNG, WebP • Max 10MB</p>
              </div>
            </div>
          </>
        )}
      </label>

      {/* Error message */}
      {error && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
