/**
 * MessagesPage - Direct messages and DM requests
 */

import { useState } from 'react';
import { AppLayout } from '@/components/layout';
import { Badge } from '@/components/ui-next';
import { DMRequestsList, ConversationList } from '@/features/messaging';
import { useDMRequests } from '@/features/messaging/hooks/useDMRequests';

export function MessagesPage() {
  const [activeTab, setActiveTab] = useState<'conversations' | 'requests'>('conversations');
  const { data: dmRequestsData } = useDMRequests();

  const pendingCount = dmRequestsData?.count || 0;

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-1 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('conversations')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'conversations'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Conversations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'requests'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Requests
            {pendingCount > 0 && (
              <Badge variant="error" size="sm">
                {pendingCount}
              </Badge>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div>{activeTab === 'conversations' ? <ConversationList /> : <DMRequestsList />}</div>
      </div>
    </AppLayout>
  );
}
