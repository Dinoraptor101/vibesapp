/**
 * CreatePostModal Component
 *
 * Modal wrapper for CreatePostForm.
 * Handles post creation, success feedback, and error handling.
 */

import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from '@/components/ui-next';
import { useCreatePost } from '../hooks/useCreatePost';
import { CreatePostForm } from './CreatePostForm';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const createPostMutation = useCreatePost();

  const handleSubmit = async (data: {
    image: string;
    text?: string;
    location: { lat: number; lon: number };
  }) => {
    try {
      await createPostMutation.mutateAsync(data);

      // Show success message
      setShowSuccess(true);

      // Close modal after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
        createPostMutation.reset();
      }, 1500);
    } catch (error) {
      // Error is handled by React Query and displayed in form
      console.error('Failed to create post:', error);
    }
  };

  const handleClose = () => {
    if (!createPostMutation.isPending) {
      createPostMutation.reset();
      setShowSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <DialogBody>
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-text-primary">Post Created!</h3>
                <p className="text-sm text-text-secondary mt-1">
                  Your post is now live on the feed
                </p>
              </div>
            </div>
          ) : (
            <CreatePostForm
              onSubmit={handleSubmit}
              onCancel={handleClose}
              isSubmitting={createPostMutation.isPending}
            />
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
