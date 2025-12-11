import apiClient from '@/lib/api';
import type { SubmitFeedbackRequest } from '../types';

export async function submitFeedback(
  data: SubmitFeedbackRequest
): Promise<{ issueNumber: number }> {
  const response = await apiClient.post<{ issueNumber: number }>('/feedback/submit', data);
  return response;
}
