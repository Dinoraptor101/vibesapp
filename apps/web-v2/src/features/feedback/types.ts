export interface FeedbackItem {
  id: number;
  title: string;
  type: 'bug' | 'feature';
  priority: 'critical' | 'high' | 'medium' | 'low' | null;
  status: 'open' | 'closed';
  description: string;
  createdAt: string;
  closedAt: string | null;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface SubmitFeedbackRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature';
  priority: Priority;
  screenshotUrl?: string;
  appVersion: string;
  userAgent: string;
}
