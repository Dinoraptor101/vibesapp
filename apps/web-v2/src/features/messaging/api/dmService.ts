import apiClient from '@/lib/api';
import type { User } from '@/types';

/**
 * DM Request and Messaging API Service
 */

export interface DMRequest {
  _id: string;
  sender: User; // Populated sender user object from backend
  recipient: string; // Recipient userId (not populated in list responses)
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  __v?: number; // Mongoose version key
}

export interface DMRequestStatus {
  canSend: boolean;
  reason?: 'pending' | 'cooldown' | 'approved';
  cooldownUntil?: Date;
  existingRequest?: DMRequest;
}

export interface Conversation {
  _id: string;
  user1Id: string;
  user2Id: string;
  lastRequesterId?: string;
  messages: Message[];
  status: 'pending' | 'approved' | 'closed';
  createdAt?: Date;
  updatedAt?: Date;
  // Backend determines and provides the "other" user based on auth
  otherUser: User; // Always populated by backend
  unreadCount?: number;
  lastMessage?: Message;
}

export interface Message {
  _id?: string;
  senderId: string;
  body: string;
  timestamp: Date;
  readBy: string[];
}

export interface SendDMRequestPayload {
  recipientId: string;
  message?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  body: string;
}

/**
 * Check if user can send DM request to recipient
 */
export const checkDMRequestStatus = async (recipientId: string): Promise<DMRequestStatus> => {
  return await apiClient.get<DMRequestStatus>(`/dm-requests/status/${recipientId}`);
};

/**
 * Send a DM request to a user
 */
export const sendDMRequest = async (payload: SendDMRequestPayload): Promise<DMRequest> => {
  return await apiClient.post<DMRequest>('/dm-requests', payload);
};

/**
 * Get all DM requests for current user
 */
export const getDMRequests = async (): Promise<DMRequest[]> => {
  return await apiClient.get<DMRequest[]>('/dm-requests');
};

/**
 * Accept a DM request (creates conversation)
 */
export const acceptDMRequest = async (requestId: string): Promise<void> => {
  await apiClient.post(`/dm-requests/${requestId}/accept`);
};

/**
 * Decline a DM request (sets 24h cooldown)
 */
export const declineDMRequest = async (requestId: string): Promise<void> => {
  await apiClient.post(`/dm-requests/${requestId}/decline`);
};

/**
 * Get all conversations for current user
 */
export const getConversations = async (userId: string): Promise<Conversation[]> => {
  return await apiClient.get<Conversation[]>(`/dm/conversations/${userId}`);
};

/**
 * Get a specific conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<Conversation> => {
  return await apiClient.get<Conversation>(`/dm/conversation/${conversationId}`);
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (payload: SendMessagePayload): Promise<Message> => {
  return await apiClient.post<Message>('/dm/message', payload);
};

/**
 * Mark messages as read in a conversation
 */
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/dm/conversation/${conversationId}/markAsRead`);
};

/**
 * Close a conversation
 */
export const closeConversation = async (conversationId: string): Promise<void> => {
  await apiClient.post(`/dm/conversation/${conversationId}/close`);
};

/**
 * Get conversation status between two users
 */
export const getConversationStatus = async (
  userId1: string,
  userId2: string
): Promise<{ status: string; conversationId?: string }> => {
  return await apiClient.get<{
    status: string;
    conversationId?: string;
  }>('/dm/status', {
    params: { userId1, userId2 },
  });
};
