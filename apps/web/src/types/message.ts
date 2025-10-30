import type React from 'react';

// Message-related type definitions
export interface IMessage {
  _id: string;
  groupChatId: string;
  parentMessageId: string | null;
  userId: string;
  userName: string;
  body: string;
  timestamp: string;
  isWatched: boolean;
  likes: string[];
  dislikes: string[];
}

export interface IMessageItem {
  message: IMessage;
  depth: number;
  isExpanded?: boolean;
  hasReplies: boolean;
  isWatched?: boolean;
  replyCount?: number;
  toggleCollapse?: (_messageId: string) => void;
  handleReply?: (_messageId: string, _userName: string) => void;
  toggleWatchMessage?: (_messageId: string) => Promise<void>;
  collapsedMessages?: { [key: string]: boolean };
  renderMessages?: (
    _messages: IMessage[],
    _parentId?: string | null | undefined,
    _depth?: number
  ) => React.ReactNode;
  messages?: IMessage[];
}

export interface IMessageList {
  messages: IMessage[];
  isExpanded?: boolean;
  toggleCollapse?: (_messageId: string) => void;
  handleReply?: (_messageId: string, _userName: string) => void;
  toggleWatchMessage?: (_messageId: string) => Promise<void>;
  collapsedMessages?: { [key: string]: boolean };
  watchedMessages?: IMessage[];
  onReply?: (_messageId: string, _userName: string) => void;
  onToggleExpand?: (_messageId: string) => void;
}

export interface IDirectMessage {
  id: string;
  senderId: string;
  body: string;
  timestamp: string;
  readBy?: string[];
}

export interface IConversation {
  conversationId: string;
  user1Id: string;
  user2Id: string;
  lastRequesterId: string;
  user1Username: string;
  user2Username: string;
  status: 'pending' | 'approved' | 'closed';
  messages: IDirectMessage[];
  lastMessage?: IDirectMessage;
  hasUnreadMessages?: boolean;
}

export interface IDMRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  conversationId: string;
  requesterId: string;
  requesterUsername: string;
  recipientId: string;
  recipientUsername: string;
  status: 'pending' | 'approved' | 'rejected' | 'declined';
  timestamp: string;
}
