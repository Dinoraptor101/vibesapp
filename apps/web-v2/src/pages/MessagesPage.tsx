/**
 * MessagesPage - Direct messages and DM requests
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Badge } from '@/components/ui-next';
import { DMRequestsList, ConversationList } from '@/features/messaging';
import { useDMRequests } from '@/features/messaging/hooks/useDMRequests';

/**
 * Page content without layout wrapper (for persistent pages)
 */
export function MessagesPageContent() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'requests'>('conversations');
  const { data: dmRequestsData } = useDMRequests();

  const pendingCount = dmRequestsData?.count || 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-background mb-6 flex border-b border-gray-200 dim:border-gray-600 dark:border-gray-700">
        <button
          type="button"
          data-testid="conversations-tab"
          onClick={() => setActiveTab('conversations')}
          className={`flex-1 flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'conversations'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dim:text-gray-450 dim:hover:text-gray-250 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Conversations
        </button>
        <button
          type="button"
          data-testid="dm-requests-tab"
          onClick={() => setActiveTab('requests')}
          className={`flex-1 flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'requests'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dim:text-gray-450 dim:hover:text-gray-250 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Requests
          {pendingCount > 0 && (
            <Badge variant="notification" size="sm">
              {pendingCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="px-4 pb-8" data-testid="messages-content">
        {activeTab === 'conversations' ? <ConversationList /> : <DMRequestsList />}
      </div>
    </div>
  );
}

/**
 * Full page with layout wrapper (for standalone routing)
 */
export function MessagesPage() {
  return (
    <AppLayout>
      <MessagesPageContent />
    </AppLayout>
  );
}
