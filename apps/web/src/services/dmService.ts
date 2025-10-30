import type { IConversation, IConversationStatus } from '../types';
import apiService from './apiService';

class DMService {
  async sendDMRequest(senderId: string, recipientId: string) {
    return apiService.post('/api/dm/request', { senderId, recipientId });
  }

  async approveDMRequest(userId: string, senderId: string, recipientId: string) {
    return apiService.post('/api/dm/approve', { userId, senderId, recipientId });
  }

  async declineDMRequest(userId: string, senderId: string, recipientId: string) {
    return apiService.post('/api/dm/decline', { userId, senderId, recipientId });
  }

  async sendMessage(senderId: string, recipientId: string, body: string) {
    return apiService.post('/api/dm/message', { senderId, recipientId, body });
  }

  /**
   * Gets the conversation status between two users
   * @param userId Current user's ID
   * @param otherUserId The other user's ID
   * @returns Promise with conversation status ("pending", "approved", "closed", or undefined) and lastRequesterId
   */
  async getStatus(userId: string, otherUserId: string): Promise<IConversationStatus> {
    try {
      const response = await apiService.get(
        `/api/dm/status?currentUserId=${userId}&otherUserId=${otherUserId}`
      );
      return response.data as IConversationStatus;
    } catch (error) {
      console.error('Error getting conversation status:', error);
      return { exists: false, status: 'closed' as const, lastRequesterId: undefined };
    }
  }

  async getConversations(userId: string) {
    return apiService.get(`/api/dm/conversations/${userId}`);
  }

  async getConversation(conversationId: string) {
    return apiService.get(`/api/dm/conversation/${conversationId}`);
  }

  async markMessagesAsRead(conversationId: string, userId: string) {
    return apiService.post(`/api/dm/conversation/${conversationId}/markAsRead`, { userId });
  }

  async closeConversation(conversationId: string) {
    return apiService.post(`/api/dm/conversation/${conversationId}/close`, {});
  }

  /**
   * Checks if a user has any:
   * 1. Unread messages in existing conversations
   * 2. Pending DM requests that need their response
   *
   * @param userId The current user's ID
   * @returns Promise<boolean> True if there are unread messages or pending requests
   */
  async getUnreadConversations(userId: string): Promise<boolean> {
    try {
      const response = await this.getConversations(userId);
      const conversations = response.data;

      // Check if there are any conversations with unread messages
      // or pending requests that need the user's response
      return conversations.some((conversation: IConversation) => {
        const isPendingAndNeedsResponse =
          conversation.status === 'pending' && conversation.lastRequesterId !== userId;

        return conversation.hasUnreadMessages || isPendingAndNeedsResponse;
      });
    } catch (error) {
      console.error('Error checking unread conversations status:', error);
      return false;
    }
  }
}

export default new DMService();
