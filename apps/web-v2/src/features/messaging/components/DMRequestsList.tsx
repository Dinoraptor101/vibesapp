/**
 * DMRequestsList Component
 * Lists all pending DM requests with loading/error/empty states
 */

import { AlertCircle } from 'lucide-react';
import { Button, Spinner } from '@/components/ui-next';
import { useDMRequests } from '../hooks/useDMRequests';
import { DMRequestCard } from './DMRequestCard';

export function DMRequestsList() {
  const { data, isLoading, isError, error, refetch } = useDMRequests();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-white">
            Failed to load DM requests
          </h3>
          <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state
  if (!data?.requests || data.requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <span className="text-6xl">📬</span>
        <h3 className="text-lg font-semibold text-gray-900 dim:text-gray-100 dark:text-white">
          No pending DM requests
        </h3>
        <p className="text-sm text-gray-500 dim:text-gray-450 dark:text-gray-400">
          When someone requests to DM you, it will appear here
        </p>
      </div>
    );
  }

  // Requests list
  return (
    <div className="space-y-4">
      {data.requests.map((request) => (
        <DMRequestCard key={request._id} request={request} />
      ))}
    </div>
  );
}
