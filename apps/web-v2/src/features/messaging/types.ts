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
  senderId: string;
  receiverId: string;
  message?: string; // Optional message with request (200 char max)
  status: DMRequestStatus;
  declinedAt?: string; // ISO timestamp when declined (for cooldown)
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  // Populated sender info
  sender?: User;
  receiver?: User;
}

// DM Request Status Check (for button state)
export interface DMRequestStatusCheck {
  hasPendingRequest: boolean;
  wasDeclined: boolean;
  canRequest: boolean; // false if declined within 2 days
  cooldownEndsAt?: string; // ISO timestamp when can request again
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
