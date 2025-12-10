import { useQuery } from '@tanstack/react-query';
import { listFeedback } from '../api/feedbackService';
import { useState } from 'react';
import type { Priority } from '../types';

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 dim:bg-red-900 dim:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 dim:bg-orange-900 dim:text-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dim:bg-yellow-900 dim:text-yellow-200',
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 dim:bg-green-900 dim:text-green-200',
};

const PRIORITY_ICONS: Record<Priority, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
};

export function FeedbackList() {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: listFeedback,
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);

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
          className="border rounded-lg p-4 cursor-pointer bg-white dark:bg-gray-800 dim:bg-gray-800 border-gray-300 dark:border-gray-600 dim:border-gray-600 hover:border-blue-500 transition-colors"
          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
          data-testid={`feedback-item-${item.id}`}
        >
          <div className="flex items-center gap-2">
            <span>{item.type === 'bug' ? '🐛' : '✨'}</span>
            <h3 className="font-medium flex-1 text-gray-900 dark:text-gray-100 dim:text-gray-100">
              {item.title}
            </h3>
            {item.priority && (
              <span
                className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[item.priority]}`}
                data-testid={`feedback-priority-${item.id}`}
              >
                {PRIORITY_ICONS[item.priority]} {item.priority}
              </span>
            )}
            <span
              className={`text-sm px-2 py-1 rounded ${
                item.status === 'open'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 dim:bg-yellow-900 dim:text-yellow-200'
                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 dim:bg-green-900 dim:text-green-200'
              }`}
              data-testid={`feedback-status-${item.id}`}
            >
              {item.status === 'open' ? 'Open' : 'Completed'}
            </span>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 dim:text-gray-400 mt-1">
            Submitted {new Date(item.createdAt).toLocaleDateString()}
          </p>

          {expandedId === item.id && (
            <div
              className="mt-4 pt-4 border-t text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300 dim:text-gray-300 border-gray-200 dark:border-gray-700 dim:border-gray-700"
              data-testid={`feedback-description-${item.id}`}
            >
              {item.description?.split('---')[0] || 'No description'}
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
