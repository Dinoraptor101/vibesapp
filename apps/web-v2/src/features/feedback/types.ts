export interface FeedbackItem {
  id: number;
  title: string;
  type: 'bug' | 'feature';
  priority: 'critical' | 'high' | 'medium' | 'low' | null;
  status: 'open' | 'closed';
  description: string;
  upvotes: number;
  commentCount: number;
  hasMeToo: boolean;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low' | '';

export interface SubmitFeedbackRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature';
  priority: Exclude<Priority, ''>;
  screenshotUrl?: string;
  appVersion: string;
  buildVersion: string;
  userAgent: string;
}
