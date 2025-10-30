// Activity-related type definitions
export interface IActivity {
  _id: string;
  type: 'reply' | 'like' | 'dislike' | 'groupchat' | 'groupreply' | 'watch'; // reverse compatibility for 'watch' type
  post: string;
  authorUserName?: string;
  userName?: string;
  isRead: boolean;
  createdAt: Date;
}
