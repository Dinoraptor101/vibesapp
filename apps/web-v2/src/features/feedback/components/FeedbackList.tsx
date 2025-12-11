import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
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
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 dim:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {feedback?.map((item) => (
        <div
          key={item.id}
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
              <span className="text-lg">{item.type === 'bug' ? '🐛' : '✨'}</span>
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
                <span
                  className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                    item.status === 'open'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dim:bg-yellow-900 dim:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 dim:bg-green-900 dim:text-green-200'
                  }`}
                  data-testid={`feedback-status-${item.id}`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </button>

          {/* Expanded description */}
          {expandedId === item.id && (
            <div
              className="mt-4 pt-4 border-t text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 dim:text-gray-300 border-gray-200 dark:border-gray-700 dim:border-gray-700"
              data-testid={`feedback-description-${item.id}`}
            >
              {item.description?.split(/^\\s*---\\s*$/m)[0] || 'No description'}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 dim:border-gray-700">
            <Button
              onClick={() => meTooMutation.mutate(item.id)}
              variant="ghost"
              size="sm"
              className={`gap-1.5 text-xs ${shakeUpvote === item.id ? 'animate-notification-shake' : ''} ${item.hasMeToo ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              className={`gap-1.5 text-xs ${shakeComment === item.id ? 'animate-notification-shake' : ''}`}
              data-testid={`comment-button-${item.id}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{item.commentCount}</span>
            </Button>
          </div>

          {/* Comment input */}
          {commentingOn === item.id && (
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
                  data-testid={`cancel-comment-button-${item.id}`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      {feedback?.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 dim:text-gray-400 text-center py-8">
          No feedback submitted yet. Be the first!
        </p>
      )}
    </div>
  );
}
