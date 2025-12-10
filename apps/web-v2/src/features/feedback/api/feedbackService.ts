import apiClient from '@/lib/api';
import type { FeedbackItem, SubmitFeedbackRequest } from '../types';

export async function submitFeedback(
  data: SubmitFeedbackRequest
): Promise<{ issueNumber: number }> {
  const response = await apiClient.post('/feedback/submit', data);
  return response;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const response = await apiClient.get<{ feedback: FeedbackItem[] }>(
    '/feedback/list'
  );
  return response.feedback;
}
