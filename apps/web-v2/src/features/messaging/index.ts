/**
 * Messaging Feature Barrel Exports
 */

// Types
export type { DMRequest, DMRequestStatus, DMRequestStatusCheck, DMRequestsResponse } from './types';

// Hooks
export { useSendDMRequest } from './hooks/useSendDMRequest';
export { useDMRequests } from './hooks/useDMRequests';
export { useDMRequestStatus } from './hooks/useDMRequestStatus';
export { useAcceptDMRequest } from './hooks/useAcceptDMRequest';
export { useDeclineDMRequest } from './hooks/useDeclineDMRequest';
export { useConversations } from './hooks/useConversations';
export { useConversation } from './hooks/useConversation';
export { useSendMessage } from './hooks/useSendMessage';
export { useMarkAsRead } from './hooks/useMarkAsRead';
export { useUnreadMessageCount } from './hooks/useUnreadMessageCount';
// Phase 4.6: New optimized polling hooks
export { useMessagingPolling } from './hooks/useMessagingPolling';
export { useAutoMarkAsRead } from './hooks/useAutoMarkAsRead';

// Components
export { DMRequestModal } from './components/DMRequestModal';
export { DMRequestCard } from './components/DMRequestCard';
export { DMRequestsList } from './components/DMRequestsList';
export { ConversationList } from './components/ConversationList';
export { ConversationView } from './components/ConversationView';
export { MessageBubble } from './components/MessageBubble';
export { MessageInput } from './components/MessageInput';
