import apiClient from '@/lib/api';
import type { FeedbackItem, SubmitFeedbackRequest } from '../types';

export async function submitFeedback(
  data: SubmitFeedbackRequest
): Promise<{ issueNumber: number }> {
  const response = await apiClient.post<{ issueNumber: number }>('/feedback/submit', data);
  return response;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const response = await apiClient.get<{ feedback: FeedbackItem[] }>('/feedback/list');
  return response.feedback;
}

export async function meToo(issueNumber: number): Promise<void> {
  await apiClient.post(`/feedback/${issueNumber}/me-too`);
}

export async function addComment(issueNumber: number, comment: string): Promise<void> {
  await apiClient.post(`/feedback/${issueNumber}/comment`, { comment });
}
