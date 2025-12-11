import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, MessageSquare, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { addComment, meToo, listFeedback } from '../api/feedbackService';
import type { FeedbackItem } from '../types';

type NonEmptyPriority = 'critical' | 'high' | 'medium' | 'low';

const PRIORITY_COLORS: Record<NonEmptyPriority, string> = {
  critical:
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 dim:bg-red-900 dim:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dim:bg-orange-900 dim:text-orange-200',
  medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dim:bg-yellow-900 dim:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 dim:bg-green-900 dim:text-green-200',
};

const PRIORITY_ICONS: Record<NonEmptyPriority, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

// Skeleton loader component
function SkeletonCard() {
  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-gray-800 dim:bg-gray-800 border-gray-300 dark:border-gray-600 dim:border-gray-600 animate-pulse">
      <div className="flex items-start gap-2">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 dim:bg-gray-700 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 dim:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 dim:bg-gray-700 rounded w-1/4" />
        </div>
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 dim:bg-gray-700 rounded" />
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 dim:border-gray-700 flex gap-3">
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 dim:bg-gray-700 rounded" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 dim:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export function FeedbackList() {
  const queryClient = useQueryClient();
  const { data: feedback, isLoading } = useQuery<FeedbackItem[]>({
    queryKey: ['feedback'],
    queryFn: listFeedback,
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shakeUpvote, setShakeUpvote] = useState<number | null>(null);
  const [shakeComment, setShakeComment] = useState<number | null>(null);

  const meTooMutation = useMutation({
    mutationFn: (issueNumber: number) => meToo(issueNumber),
    onSuccess: (_data, issueNumber) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setShakeUpvote(issueNumber);
      setTimeout(() => setShakeUpvote(null), 1000);
    },
  });

  const commentMutation = useMutation({
    mutationFn: ({ issueNumber, comment }: { issueNumber: number; comment: string }) =>
      addComment(issueNumber, comment),
    onSuccess: (_data, { issueNumber }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      setCommentingOn(null);
      setCommentText('');
      setShakeComment(issueNumber);
      setTimeout(() => setShakeComment(null), 1000);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      {feedback?.map((item) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={
            'border rounded-lg p-4 bg-white dark:bg-gray-800 ' +
            'dim:bg-gray-800 border-gray-300 dark:border-gray-600 dim:border-gray-600'
          }
          data-testid={`feedback-item-${item.id}`}
        >
          {/* Header */}
          <button
            type="button"
            className="w-full text-left"
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setExpandedId(expandedId === item.id ? null : item.id);
              }
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{item.type === 'bug' ? '🪲' : '🦋'}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 dim:text-gray-100">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400 mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {item.priority && (
                  <span
                    className={`text-xs px-2 py-1 rounded whitespace-nowrap ${PRIORITY_COLORS[item.priority as NonEmptyPriority]}`}
                    data-testid={`feedback-priority-${item.id}`}
                  >
                    {PRIORITY_ICONS[item.priority as NonEmptyPriority]} {item.priority}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Expanded description */}
          <AnimatePresence>
            {expandedId === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className="mt-4 pt-4 border-t text-sm text-gray-700 dark:text-gray-300 dim:text-gray-300 border-gray-200 dark:border-gray-700 dim:border-gray-700 prose prose-sm dark:prose-invert dim:prose-invert max-w-none"
                  data-testid={`feedback-description-${item.id}`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.description || 'No description'}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 dim:border-gray-700">
            <Button
              onClick={() => meTooMutation.mutate(item.id)}
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95 ${shakeUpvote === item.id ? 'animate-notification-shake' : ''} ${item.hasMeToo ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={meTooMutation.isPending || item.hasMeToo}
              data-testid={`me-too-button-${item.id}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Me Too {item.upvotes > 0 ? `(${item.upvotes})` : ''}</span>
            </Button>
            <Button
              onClick={() => setCommentingOn(commentingOn === item.id ? null : item.id)}
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs transition-all duration-200 hover:scale-105 active:scale-95 ${shakeComment === item.id ? 'animate-notification-shake' : ''}`}
              data-testid={`comment-button-${item.id}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{item.commentCount}</span>
            </Button>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto"
              title="View on GitHub"
              data-testid={`github-link-${item.id}`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs h-8 w-8 p-0 transition-all duration-200 hover:scale-110 active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="sr-only">View on GitHub</span>
              </Button>
            </a>
          </div>

          {/* Comment input */}
          <AnimatePresence>
            {commentingOn === item.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add your comment..."
                    className="w-full p-2 text-sm border rounded-lg bg-white dark:bg-gray-900 dim:bg-gray-900 border-gray-300 dark:border-gray-600 dim:border-gray-600 text-gray-900 dark:text-gray-100 dim:text-gray-100"
                    rows={3}
                    data-testid={`comment-textarea-${item.id}`}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (commentText.trim()) {
                          commentMutation.mutate({ issueNumber: item.id, comment: commentText });
                        }
                      }}
                      size="sm"
                      disabled={!commentText.trim() || commentMutation.isPending}
                      className="transition-all duration-200 hover:scale-105 active:scale-95"
                      data-testid={`submit-comment-button-${item.id}`}
                    >
                      Submit
                    </Button>
                    <Button
                      onClick={() => {
                        setCommentingOn(null);
                        setCommentText('');
                      }}
                      variant="ghost"
                      size="sm"
                      className="transition-all duration-200 hover:scale-105 active:scale-95"
                      data-testid={`cancel-comment-button-${item.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}

      {feedback?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 text-center py-8">
          No feedback submitted yet. Be the first!
        </p>
      )}
    </motion.div>
  );
}
