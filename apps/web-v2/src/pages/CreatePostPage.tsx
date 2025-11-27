/**
 * CreatePostPage - Create new post
 *
 * Full-page tab for creating posts (no modal).
 * Handles post creation, success feedback, and error handling.
 */

import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { CreatePostForm } from '@/features/posts/components/CreatePostForm';
import { useCreatePost } from '@/features/posts/hooks/useCreatePost';

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function CreatePostPageContent() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const createPostMutation = useCreatePost();

  const handleSubmit = async (data: {
    image: string;
    text?: string;
    blurPlaceholder?: string;
    location: { lat: number; lon: number };
  }) => {
    try {
      await createPostMutation.mutateAsync(data);

      // Show success message
      setShowSuccess(true);

      // Navigate back to home feed after 1.5 seconds
      setTimeout(() => {
        setShowSuccess(false);
        createPostMutation.reset();
        navigate('/');
      }, 1500);
    } catch (error) {
      // Error is handled by React Query and displayed in form
      console.error('Failed to create post:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/10 dim:bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500 dim:text-green-400" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-primary dim:text-gray-100">
              Post Created!
            </h3>
            <p className="text-sm text-text-secondary dim:text-gray-300 mt-1">
              Your post is now live on the feed
            </p>
          </div>
        </div>
      ) : (
        <CreatePostForm onSubmit={handleSubmit} isSubmitting={createPostMutation.isPending} />
      )}
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function CreatePostPage() {
  return (
    <AppLayout>
      <CreatePostPageContent />
    </AppLayout>
  );
}
