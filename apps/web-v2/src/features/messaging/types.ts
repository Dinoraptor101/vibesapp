/**
 * Messaging Feature Types
 * Type definitions for DM requests, conversations, and messages
 */

import type { User } from '@/types';

// DM Request Status
export type DMRequestStatus = 'pending' | 'accepted' | 'declined';

// DM Request Interface
export interface DMRequest {
  _id: string;
  sender: User; // Populated sender user object
  recipient: string; // Recipient userId (not populated in list view)
  message?: string; // Optional message with request (200 char max)
  status: DMRequestStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  __v?: number; // Mongoose version key
}

// DM Request Status Check (for button state)
export interface DMRequestStatusCheck {
  canSend: boolean;
  reason?: 'pending' | 'received' | 'connected'; // pending=you sent, received=they sent you, connected=already messaging
  requestId?: string; // ID of the pending request
  conversationId?: string; // ID of existing conversation
  message?: string; // Additional message to display to user
}

// API Response Types
export interface DMRequestsResponse {
  requests: DMRequest[];
  count: number;
}

export interface SendDMRequestPayload {
  message?: string;
}

export interface DMRequestStatusResponse extends DMRequestStatusCheck {
  request?: DMRequest;
}
