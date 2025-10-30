// Component props type definitions

import type { IDMRequest } from './message';
import type { INotification } from './notification';
import type { IPost, IPostData } from './post';

export interface CropResponse {
  type: 'success' | 'invalid_size';
  data?: Blob;
}

export interface ImageEditorProps {
  image: string;
  onCrop: (_response: CropResponse) => void;
  setIsImageLoaded: (_loaded: boolean) => void;
}

export interface HtmlPageProps {
  src: string;
}

export interface NavLinkProps {
  to: string;
  label: string;
  unread?: boolean;
}

export interface IssueProps {
  setNotification: (notification: INotification) => void;
}

export interface WelcomeFormProps {
  setNotification: (notification: INotification) => void;
}

export interface PostProps {
  postData: IPostData;
  post: IPostData; // Alternative field name used in PostHandler
  ownerReacted: boolean;
  replies?: IPostData[];
  setNotification: (notification: INotification) => void;
  onPostUpdate?: () => void;
}

export interface PostsGridProps {
  posts: IPost[];
  setNotification: (notification: INotification) => void;
  onPostsUpdate?: () => void;
}

export interface CreatePostProps {
  userId: string;
  setNotification: (notification: INotification) => void;
  onPostCreated?: (post: IPost) => void;
}

export interface UserProfileProps {
  userId?: string;
  version?: string;
  setNotification: (notification: INotification) => void;
}

export interface PublicProfileProps {
  userId: string;
  setNotification: (notification: INotification) => void;
}

export interface DirectMessageProps {
  conversation: unknown; // TODO: Define proper conversation type
  setNotification: (_notification: INotification) => void;
}

export interface GroupChatProps {
  postId: string;
  userId: string;
  setNotification?: (notification: INotification) => void;
}

export interface LoadingScreenProps {
  message?: string;
}

export interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export interface LocationRequestProps {
  onLocationGranted: (location: { lat: number; lon: number }) => void;
  onLocationDenied: () => void;
}

export interface NotificationProps extends INotification {
  onClose: () => void;
}

export interface ActivityListProps {
  activities: unknown[]; // TODO: Define proper activity type
  setNotification: (_notification: INotification) => void;
}

export interface MessengerProps {
  conversationId: string;
  isDMRequest?: boolean;
}

export interface DMRequestItemProps {
  request: IDMRequest; // The DM request data
  onRequestProcessed?: () => void; // Optional callback when request is processed
}

export interface PostCardProps {
  post: IPost | IPostData; // Accept both types to handle different use cases
  isVisible?: boolean;
  'data-testid'?: string;
  imageResolution?: 'low' | 'full';
}

export interface ControlsProps {
  withReplies: boolean;
  setWithReplies: (withReplies: boolean | ((prev: boolean) => boolean)) => void;
  range: number;
  setRange: (range: number) => void;
}

export interface RepliesGridProps {
  posts: (IPost | IPostData)[]; // Accept both types to handle different use cases
}

export interface FloatingEditorProps {
  editorState: string;
  handleEditorStateChange: (state: string) => void;
  loading: boolean;
  croppedImage: Blob | null;
  isDisabled: boolean;
}

export interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
}

export interface VibesProps {
  userVibes: number;
  toggleLegend?: () => void;
  setNotification?: (notification: INotification) => void;
}

export interface ConversationListProps {
  conversations: unknown[];
  setNotification: (_notification: INotification) => void;
}

export interface RequestButtonProps {
  userId?: string;
  profileUserId?: string;
  setNotification: (notification: INotification) => void;
}

export interface IConversationStatus {
  exists?: boolean;
  status?: 'pending' | 'approved' | 'closed';
  conversationId?: string;
  lastRequesterId?: string;
}
