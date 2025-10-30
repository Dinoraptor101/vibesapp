# Frontend Architecture

The VibesApp frontend is a modern React application built with TypeScript, focusing on performance, accessibility, and user experience. This document outlines the architectural decisions and patterns used throughout the application.

## Technology Stack

### Core Technologies

- **React 18** - Modern component-based UI framework
- **TypeScript** - Type safety and enhanced developer experience
- **React Router** - Client-side routing and navigation
- **React Query** - Server state management and caching
- **CSS3** - Custom styling with theme support

### Build & Development Tools

- **Create React App** - Project bootstrapping and build configuration
- **Webpack** - Module bundling and asset optimization
- **Biome** - Code formatting and linting
- **Playwright** - End-to-end testing

### Deployment & Hosting

- **Heroku** - QA environment hosting
- **GitHub Actions** - CI/CD pipeline
- **Progressive Web App** - Mobile-native experience
- **Service Worker** - Offline capabilities and caching

## Project Structure

```
src/
├── App.tsx                 # Main application component
├── index.tsx              # Application entry point
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks
├── interfaces/            # TypeScript type definitions
├── services/              # API and external service integrations
├── utils/                 # Helper functions and utilities
├── types/                 # Global type declarations
└── assets/                # Static images and media
```

## Component Architecture

### Component Organization

Components are organized by feature and complexity:

```
components/
├── Post/                  # Post-related components
│   ├── Post.tsx          # Main post component
│   ├── PostContent.tsx   # Post content display
│   ├── PostActions.tsx   # Like/dislike actions
│   └── PostMeta.tsx      # Author and timestamp info
├── CreatePost/           # Post creation workflow
├── GroupChat/            # Real-time messaging
├── UserProfile/          # User profile management
└── shared/               # Reusable UI components
    ├── Spinner/
    ├── LoadingScreen/
    └── NavigationAware/
```

### Component Patterns

#### Container/Presentational Pattern

```typescript
// Container: Handles data and business logic
const PostContainer: React.FC<{ postId: string }> = ({ postId }) => {
  const { data: post, loading } = usePostData(postId);
  const { handleLike, handleDislike } = usePostActions();

  if (loading) return <Spinner />;

  return (
    <Post
      post={post}
      onLike={handleLike}
      onDislike={handleDislike}
    />
  );
};

// Presentational: Pure UI component
const Post: React.FC<PostProps> = ({ post, onLike, onDislike }) => {
  return (
    <article className="post">
      <PostContent content={post.text} image={post.image} />
      <PostActions
        likes={post.likes}
        onLike={() => onLike(post.id)}
        onDislike={() => onDislike(post.id)}
      />
    </article>
  );
};
```

#### Custom Hooks Pattern

```typescript
// usePostData.ts - Encapsulates post data logic
export const usePostData = (postId: string) => {
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost(postId)
      .then(setPost)
      .finally(() => setLoading(false));
  }, [postId]);

  return { post, loading, refetch: () => fetchPost(postId) };
};
```

## State Management

### Local State Strategy

- **Component state** - UI state, form inputs, local interactions
- **Custom hooks** - Shared stateful logic between components
- **Context API** - Global app state (user auth, theme, location)

### Server State Management

- **React Query** - API data caching, synchronization, and updates
- **Optimistic updates** - Immediate UI feedback for user actions
- **Background refresh** - Keep data fresh without user intervention

### State Organization

```typescript
// Global app context
interface AppContextType {
  user: IUserData | null;
  theme: 'light' | 'dim' | 'dark';
  location: IGeoLocation | null;
  setTheme: (theme: string) => void;
}

// Component-level state
interface PostState {
  isExpanded: boolean;
  showReplies: boolean;
  replyContent: string;
}
```

## Routing & Navigation

### Route Structure

```typescript
// App.tsx route configuration
<Routes>
  <Route path="/" element={<PostsGrid />} />
  <Route path="/profile" element={<UserProfile />} />
  <Route path="/profile/:userId" element={<PublicProfile />} />
  <Route path="/post/:postId" element={<PostDetail />} />
  <Route path="/messages" element={<DirectMessage />} />
  <Route path="/welcome" element={<WelcomeForm />} />
</Routes>
```

### Navigation Patterns

- **NavigationAware** - Component wrapper for route-aware behavior
- **Conditional routing** - Permission-based route access
- **Deep linking** - Direct access to posts, profiles, conversations
- **Browser history** - Proper back/forward navigation support

## Data Flow Architecture

### API Integration Pattern

```typescript
// services/apiService.ts
export class ApiService {
  private static baseURL = process.env.REACT_APP_API_URL;

  static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'x-api-key': process.env.REACT_APP_API_KEY!,
        'x-pigeon-id': getCookie('pigeonId'),
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return response.json();
  }
}
```

### Real-time Updates

```typescript
// Socket.IO integration for real-time features
useEffect(() => {
  const socket = io(process.env.REACT_APP_SOCKET_URL);

  socket.on('new-message', handleNewMessage);
  socket.on('post-update', handlePostUpdate);
  socket.on('vibes-change', handleVibesChange);

  return () => socket.disconnect();
}, []);
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading for route components
const UserProfile = lazy(() => import('./components/UserProfile/UserProfile'));
const DirectMessage = lazy(() => import('./components/DirectMessage/DirectMessage'));

// Suspense wrapper for loading states
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    {/* Routes */}
  </Routes>
</Suspense>
```

### Memoization Strategy

```typescript
// React.memo for expensive components
export const Post = React.memo<PostProps>(({ post, onLike, onDislike }) => {
  return (
    <article className="post">
      {/* Component content */}
    </article>
  );
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.likes === nextProps.post.likes;
});

// useMemo for expensive calculations
const sortedPosts = useMemo(() => {
  return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}, [posts]);
```

### Image Optimization

- **Lazy loading** - Images load as they enter viewport
- **Progressive enhancement** - Show placeholder while loading
- **Responsive images** - Different sizes for different screen sizes
- **CDN integration** - CloudFront for optimized delivery

## Accessibility & UX

### Theme System

```css
/* theme.css - CSS custom properties for theming */
:root {
  --background-color: #ffffff;
  --text-color: #000000;
  --accent-color: #007bff;
}

[data-theme='dark'] {
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --accent-color: #66b3ff;
}
```

### Responsive Design

- **Mobile-first** - Base styles for mobile, progressive enhancement
- **Breakpoint system** - Consistent responsive behavior
- **Touch-friendly** - Appropriate touch targets and gestures
- **Viewport optimization** - Proper meta tags and scaling

### Progressive Web App

```typescript
// serviceWorker.ts - PWA capabilities
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/),
);

export function register() {
  if ('serviceWorker' in navigator) {
    // Service worker registration logic
  }
}
```

## Error Handling

### Error Boundary Pattern

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// Centralized error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }

  return 'An unexpected error occurred';
};
```

## Development Workflow

### Local Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

### Code Quality

- **TypeScript strict mode** - Enforces type safety
- **Biome configuration** - Consistent code style and formatting
- **Automated formatting** - Single formatter across entire monorepo
- **Pre-commit hooks** - Automated quality checks

### Testing Strategy

- **Unit tests** - Jest for component and utility testing
- **Integration tests** - React Testing Library for user interaction testing
- **E2E tests** - Playwright for full user workflow testing
- **Visual regression** - Screenshot testing for UI consistency

## Future Considerations

### Performance Improvements

- **Virtual scrolling** - For large post lists
- **Image optimization** - WebP format, lazy loading improvements
- **Bundle optimization** - Tree shaking, code splitting refinements
- **Caching strategy** - Enhanced service worker caching

### Architecture Evolution

- **State management** - Consider Redux Toolkit for complex state
- **Component library** - Extract reusable components
- **Micro-frontends** - Module federation for feature teams
- **GraphQL migration** - More efficient data fetching
