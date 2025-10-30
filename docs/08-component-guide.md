# Component Guide

This document provides comprehensive documentation of the VibesApp frontend components, their props, usage patterns, and architectural decisions.

## Component Architecture

### Component Organization Structure

```
src/components/
├── shared/              # Reusable UI components
│   ├── Spinner/
│   ├── LoadingScreen/
│   └── NavigationAware/
├── layout/              # Layout components
│   ├── AppWrapper/
│   └── AddToHomeScreenPrompt/
├── content/             # Content display components
│   ├── Post/
│   ├── PostsGrid/
│   └── Document/
├── interaction/         # User interaction components
│   ├── CreatePost/
│   ├── GroupChat/
│   └── DirectMessage/
├── profile/             # User profile components
│   ├── UserProfile/
│   ├── PublicProfile/
│   └── WelcomeForm/
└── notification/        # Notification components
    ├── Notification/
    ├── ActivityList/
    └── LocationRequest/
```

## Core Components

### AppWrapper

**Location**: `src/components/AppWrapper/AppWrapper.tsx`

The main application container that provides global context and layout structure.

```typescript
interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  // Global state management
  // Theme context
  // User authentication context
  // Location context
};
```

**Features:**

- Global theme management (light, dim, dark)
- User authentication state
- Location services integration
- Error boundary implementation
- Service worker registration

**Usage:**

```typescript
// App.tsx
<AppWrapper>
  <Router>
    <Routes>
      {/* App routes */}
    </Routes>
  </Router>
</AppWrapper>
```

### Post Component

**Location**: `src/components/Post/Post.tsx`

Displays individual posts with content, metadata, and interaction options.

```typescript
interface PostProps {
  post: IPost;
  onLike?: (postId: string) => void;
  onDislike?: (postId: string) => void;
  onReply?: (postId: string) => void;
  showReplies?: boolean;
  isDetailed?: boolean;
}

const Post: React.FC<PostProps> = ({ post, onLike, onDislike, onReply, showReplies = false, isDetailed = false }) => {
  // Component implementation
};
```

**Sub-components:**

- `PostContent` - Text and image display
- `PostMeta` - Author info, timestamp, location
- `PostActions` - Like, dislike, reply buttons
- `PostStats` - Reaction counts and metrics

**Features:**

- Responsive image display with lazy loading
- Rich text content rendering
- Distance-based author information
- Permission-based action visibility
- Threaded reply support

### PostsGrid

**Location**: `src/components/PostsGrid/PostsGrid.tsx`

Main feed component that displays a list of posts with filtering and sorting options.

```typescript
interface PostsGridProps {
  filter?: 'all' | 'nearby' | 'following';
  sortBy?: 'recent' | 'popular' | 'distance';
  showReplies?: boolean;
}

const PostsGrid: React.FC<PostsGridProps> = ({ filter = 'all', sortBy = 'recent', showReplies = true }) => {
  // Implementation
};
```

**Features:**

- Virtual scrolling for performance
- Real-time post updates
- Distance-based filtering
- Infinite scroll loading
- Pull-to-refresh on mobile
- Empty state handling

**Hooks Used:**

- `usePostData` - Fetches and manages posts
- `useLocation` - User location for filtering
- `useInfiniteQuery` - Pagination
- `useNearBottom` - Infinite scroll detection

### CreatePost

**Location**: `src/components/CreatePost/CreatePost/CreatePost.tsx`

Multi-step post creation interface with rich text editing and image upload.

```typescript
interface CreatePostProps {
  replyTo?: string;
  onPostCreated?: (post: IPost) => void;
  onCancel?: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ replyTo, onPostCreated, onCancel }) => {
  // Implementation
};
```

**Features:**

- Rich text editor with Quill.js
- Image upload with cropping
- Location tagging
- Draft saving
- Character count
- Permission validation

**Sub-components:**

- `RichTextEditor` - Quill.js integration
- `ImageUpload` - File selection and upload
- `ImageCropper` - Image cropping interface
- `LocationPicker` - Location selection

### GroupChat

**Location**: `src/components/GroupChat/GroupChat.tsx`

Real-time messaging interface for post-specific conversations.

```typescript
interface GroupChatProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

const GroupChat: React.FC<GroupChatProps> = ({ postId, isVisible, onClose }) => {
  // Implementation
};
```

**Features:**

- Real-time message updates via Socket.IO
- Threaded conversations
- User typing indicators
- Message reactions
- Notification system
- Auto-scroll to new messages

**Hooks Used:**

- `useGroupChatHandler` - Message management
- `useSocket` - Real-time connection
- `useNewMessageIndicator` - Unread message tracking

### UserProfile

**Location**: `src/components/UserProfile/UserProfile.tsx`

User profile management and display component.

```typescript
interface UserProfileProps {
  userId?: string; // If not provided, shows current user
  isEditable?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, isEditable = false }) => {
  // Implementation
};
```

**Features:**

- Profile information display/editing
- Vibes history and statistics
- Post history grid
- Privacy settings
- Theme preferences
- Account management

### DirectMessage

**Location**: `src/components/DirectMessage/DirectMessage.tsx`

Private messaging interface with conversation management.

```typescript
interface DirectMessageProps {
  conversationId?: string;
}

const DirectMessage: React.FC<DirectMessageProps> = ({ conversationId }) => {
  // Implementation
};
```

**Features:**

- Conversation list
- Real-time messaging
- Message history
- DM request handling
- Read receipts
- Message search

## Shared Components

### Spinner

**Location**: `src/components/Spinner/Spinner.tsx`

Loading indicator with customizable size and color.

```typescript
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', color, className }) => {
  // Implementation
};
```

### LoadingScreen

**Location**: `src/components/LoadingScreen/LoadingScreen.tsx`

Full-screen loading component with app branding.

```typescript
interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  showProgress = false,
  progress = 0,
}) => {
  // Implementation
};
```

### NavigationAware

**Location**: `src/components/NavigationAware/NavigationAware.tsx`

HOC that provides navigation context to child components.

```typescript
interface NavigationAwareProps {
  children: React.ReactNode;
  onNavigation?: (path: string) => void;
}

const NavigationAware: React.FC<NavigationAwareProps> = ({ children, onNavigation }) => {
  // Implementation
};
```

## Notification Components

### Notification

**Location**: `src/components/Notification/Notification.tsx`

Toast-style notification system.

```typescript
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, duration = 3000, onClose }) => {
  // Implementation
};
```

### ActivityList

**Location**: `src/components/ActivityList/ActivityList.tsx`

User activity feed showing likes, replies, and mentions.

```typescript
interface ActivityListProps {
  userId: string;
  filter?: 'all' | 'unread' | 'mentions';
}

const ActivityList: React.FC<ActivityListProps> = ({ userId, filter = 'all' }) => {
  // Implementation
};
```

## Form Components

### WelcomeForm

**Location**: `src/components/WelcomeForm/WelcomeForm.tsx`

User onboarding and registration form.

```typescript
interface WelcomeFormProps {
  onComplete: (userData: IUserData) => void;
}

const WelcomeForm: React.FC<WelcomeFormProps> = ({ onComplete }) => {
  // Implementation
};
```

**Form Steps:**

1. Pigeon ID creation/entry
2. Basic profile information
3. Personality preferences (MBTI, polarity)
4. Location permission request
5. Welcome message and app tour

## Component Patterns

### Container/Presentation Pattern

```typescript
// Container Component (handles logic)
const PostContainer: React.FC<{ postId: string }> = ({ postId }) => {
  const { data: post, loading, error } = usePostData(postId);
  const { likePost, dislikePost } = usePostActions();

  const handleLike = useCallback(() => {
    likePost({ postId, location: userLocation });
  }, [postId, userLocation]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!post) return <NotFound />;

  return (
    <Post
      post={post}
      onLike={handleLike}
      onDislike={handleDislike}
    />
  );
};

// Presentation Component (pure UI)
const Post: React.FC<PostProps> = ({ post, onLike, onDislike }) => {
  return (
    <article className="post">
      <PostContent content={post} />
      <PostActions onLike={onLike} onDislike={onDislike} />
    </article>
  );
};
```

### Compound Components Pattern

```typescript
// PostActions as compound component
const PostActions: React.FC<PostActionsProps> & {
  Like: React.FC<LikeProps>;
  Dislike: React.FC<DislikeProps>;
  Reply: React.FC<ReplyProps>;
  Share: React.FC<ShareProps>;
} = ({ children }) => {
  return <div className="post-actions">{children}</div>;
};

PostActions.Like = ({ onClick, count, isActive }) => (
  <button onClick={onClick} className={`like ${isActive ? 'active' : ''}`}>
    👍 {count}
  </button>
);

PostActions.Dislike = ({ onClick, count, isActive }) => (
  <button onClick={onClick} className={`dislike ${isActive ? 'active' : ''}`}>
    👎 {count}
  </button>
);

// Usage
<PostActions>
  <PostActions.Like onClick={handleLike} count={post.likes} />
  <PostActions.Dislike onClick={handleDislike} count={post.dislikes} />
  <PostActions.Reply onClick={handleReply} />
</PostActions>
```

### Render Props Pattern

```typescript
// Location provider with render props
interface LocationProviderProps {
  children: (locationData: LocationData) => React.ReactNode;
}

const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const { location, loading, error, requestLocation } = useLocation();

  return (
    <>
      {children({
        location,
        loading,
        error,
        requestLocation,
        hasPermission: !!location
      })}
    </>
  );
};

// Usage
<LocationProvider>
  {({ location, loading, requestLocation }) => (
    <div>
      {loading ? (
        <Spinner />
      ) : location ? (
        <PostsGrid userLocation={location} />
      ) : (
        <LocationRequest onRequest={requestLocation} />
      )}
    </div>
  )}
</LocationProvider>
```

## Styling Architecture

### CSS Module Pattern

```typescript
// Post.module.css
.post {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.postContent {
  margin-bottom: 12px;
}

.postActions {
  display: flex;
  gap: 12px;
  align-items: center;
}

// Post.tsx
import styles from './Post.module.css';

const Post: React.FC<PostProps> = ({ post }) => (
  <article className={styles.post}>
    <div className={styles.postContent}>
      {post.text}
    </div>
    <div className={styles.postActions}>
      {/* Actions */}
    </div>
  </article>
);
```

### Theme Integration

```typescript
// Theme-aware component
const ThemedButton: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const buttonClass = `
    button
    button--${variant}
    theme--${theme}
  `.trim();

  return (
    <button className={buttonClass} {...props}>
      {children}
    </button>
  );
};
```

## Accessibility Features

### ARIA Implementation

```typescript
const Post: React.FC<PostProps> = ({ post }) => (
  <article
    role="article"
    aria-labelledby={`post-${post.id}-content`}
    aria-describedby={`post-${post.id}-meta`}
  >
    <div id={`post-${post.id}-content`}>
      {post.text}
    </div>
    <div id={`post-${post.id}-meta`} aria-label="Post metadata">
      By {post.user.userName} on {formatDate(post.createdAt)}
    </div>
    <div role="group" aria-label="Post actions">
      <button aria-label={`Like post by ${post.user.userName}`}>
        👍 {post.likes}
      </button>
      <button aria-label={`Dislike post by ${post.user.userName}`}>
        👎 {post.dislikes}
      </button>
    </div>
  </article>
);
```

### Keyboard Navigation

```typescript
const useKeyboardNavigation = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close modals/overlays
      }
      if (event.key === 'Enter' && event.ctrlKey) {
        // Submit forms
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
```

## Performance Optimization

### Memoization

```typescript
const Post = React.memo<PostProps>(({ post, onLike, onDislike }) => {
  const memoizedContent = useMemo(() => (
    <PostContent content={post.text} image={post.image} />
  ), [post.text, post.image]);

  const handleLike = useCallback(() => {
    onLike?.(post.id);
  }, [onLike, post.id]);

  return (
    <article>
      {memoizedContent}
      <PostActions onLike={handleLike} onDislike={onDislike} />
    </article>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes === nextProps.post.likes &&
    prevProps.post.dislikes === nextProps.post.dislikes
  );
});
```

### Lazy Loading

```typescript
const LazyPostDetail = lazy(() => import('./PostDetail/PostDetail'));
const LazyUserProfile = lazy(() => import('./UserProfile/UserProfile'));

// Usage with Suspense
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/post/:id" element={<LazyPostDetail />} />
    <Route path="/profile/:id" element={<LazyUserProfile />} />
  </Routes>
</Suspense>
```

## Testing Components

### Component Testing Pattern

```typescript
// Post.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Post } from './Post';

const mockPost: IPost = {
  id: '1',
  text: 'Test post content',
  user: { userName: 'testuser' },
  likes: 5,
  dislikes: 1,
  createdAt: '2025-06-27T00:00:00Z'
};

describe('Post Component', () => {
  it('renders post content correctly', () => {
    render(<Post post={mockPost} />);

    expect(screen.getByText('Test post content')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // likes count
  });

  it('calls onLike when like button is clicked', () => {
    const mockOnLike = jest.fn();
    render(<Post post={mockPost} onLike={mockOnLike} />);

    fireEvent.click(screen.getByLabelText(/like post/i));
    expect(mockOnLike).toHaveBeenCalledWith('1');
  });

  it('handles missing image gracefully', () => {
    const postWithoutImage = { ...mockPost, image: undefined };
    render(<Post post={postWithoutImage} />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
```

## Future Component Enhancements

### Planned Components

- **VideoPost** - Video content support
- **AudioPost** - Voice message functionality
- **EventPost** - Local event creation and management
- **PollPost** - Community polling features
- **LocationPost** - Enhanced location sharing

### Performance Improvements

- **Virtual scrolling** for large lists
- **Image optimization** with WebP support
- **Progressive loading** for better perceived performance
- **Service worker caching** for offline support

### Accessibility Enhancements

- **Screen reader optimization**
- **High contrast mode**
- **Reduced motion preferences**
- **Voice navigation support**
