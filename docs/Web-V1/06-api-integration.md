# API Integration

This document outlines how the VibesApp frontend integrates with the backend API, including authentication patterns, data flow, error handling, and real-time communication.

## API Service Architecture

### Base Configuration

```typescript
// services/apiService.ts
export class ApiService {
  private static readonly baseURL = process.env.REACT_APP_API_URL;
  private static readonly apiKey = process.env.REACT_APP_API_KEY;

  private static getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey!,
      'x-pigeon-id': getCookie('pigeonId') || '',
    };
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }
}
```

### Environment Configuration

```typescript
// Environment variables
interface ApiConfig {
  REACT_APP_API_URL: string; // API base URL
  REACT_APP_API_KEY: string; // Global API key
  REACT_APP_SOCKET_URL: string; // Socket.IO server URL
  REACT_APP_S3_BUCKET: string; // S3 bucket for images
  REACT_APP_CLOUDFRONT_URL: string; // CDN URL
}
```

## Authentication Flow

### User Authentication

```typescript
// services/userService.ts
export const loginUser = async (pigeonId: string): Promise<IUserData> => {
  try {
    const user = await ApiService.request<IUserData>(`/api/user/login/${pigeonId}`);

    // Store authentication data
    setCookie('pigeonId', pigeonId, 365);
    setCookie('userId', user.userId, 365);

    return user;
  } catch (error) {
    throw new Error('Invalid pigeon ID or authentication failed');
  }
};

export const createUser = async (userData: CreateUserRequest): Promise<IUserData> => {
  return ApiService.request<IUserData>('/api/user/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const getUserVibes = async (): Promise<number> => {
  const userId = getCookie('userId');
  if (!userId) throw new Error('User not authenticated');

  const user = await ApiService.request<IUserData>(`/api/user/${userId}`);
  return user.vibes;
};
```

### Session Management

```typescript
// utils/cookieUtils.ts
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
```

## Data Fetching Patterns

### React Query Integration

```typescript
// hooks/usePostData.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';

export const usePostsData = () => {
  return useQuery(['posts'], () => ApiService.request<IPost[]>('/api/post/'), {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (postData: CreatePostRequest) =>
      ApiService.request<IPost>('/api/post/create', {
        method: 'POST',
        body: JSON.stringify(postData),
      }),
    {
      onSuccess: () => {
        // Invalidate and refetch posts
        queryClient.invalidateQueries(['posts']);
      },
      onError: (error) => {
        console.error('Failed to create post:', error);
      },
    },
  );
};
```

### Post Interaction Hooks

```typescript
// hooks/usePostActions.ts
export const usePostReactions = () => {
  const queryClient = useQueryClient();

  const likePost = useMutation(
    ({ postId, location }: { postId: string; location: IGeoLocation }) =>
      ApiService.request(`/api/post/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({
          userId: getCookie('userId'),
          location,
        }),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['posts']);
        queryClient.invalidateQueries(['user-vibes']);
      },
    },
  );

  const dislikePost = useMutation(
    ({ postId, location }: { postId: string; location: IGeoLocation }) =>
      ApiService.request(`/api/post/${postId}/dislike`, {
        method: 'POST',
        body: JSON.stringify({
          userId: getCookie('userId'),
          location,
        }),
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['posts']);
        queryClient.invalidateQueries(['user-vibes']);
      },
    },
  );

  return { likePost, dislikePost };
};
```

## Real-time Communication

### Socket.IO Integration

```typescript
// hooks/useSocket.ts
import { useEffect, useContext } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL!, {
      auth: {
        pigeonId: getCookie('pigeonId'),
      },
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return socket;
};
```

### Group Chat Integration

```typescript
// hooks/useGroupChat.ts
export const useGroupChatHandler = (postId: string) => {
  const socket = useSocket();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!socket || !postId) return;

    // Join post-specific chat room
    socket.emit('join-post-chat', postId);

    // Listen for new messages
    socket.on('new-group-message', (message: IMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load existing messages
    loadGroupChatMessages();

    return () => {
      socket.off('new-group-message');
    };
  }, [socket, postId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !content.trim()) return;

      socket.emit('send-group-message', {
        postId,
        senderId: getCookie('userId'),
        content: content.trim(),
      });

      setNewMessage('');
    },
    [socket, postId],
  );

  const loadGroupChatMessages = async () => {
    try {
      const messages = await ApiService.request<IMessage[]>(`/api/groupchat/${postId}/messages`);
      setMessages(messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    sendMessage,
  };
};
```

### Direct Messaging

```typescript
// hooks/useDMHandler.ts
export const useDMHandler = () => {
  const socket = useSocket();
  const [conversations, setConversations] = useState<IConversation[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new DMs
    socket.on('new-dm', (message: IDMMessage) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId ? { ...conv, messages: [...conv.messages, message] } : conv,
        ),
      );
    });

    return () => {
      socket.off('new-dm');
    };
  }, [socket]);

  const sendDMRequest = async (toUserId: string) => {
    return ApiService.request<IConversation>('/api/dm/request', {
      method: 'POST',
      body: JSON.stringify({
        fromUserId: getCookie('userId'),
        toUserId,
      }),
    });
  };

  const sendDMMessage = (conversationId: string, content: string) => {
    if (!socket) return;

    socket.emit('send-dm', {
      conversationId,
      senderId: getCookie('userId'),
      content,
    });
  };

  return {
    conversations,
    sendDMRequest,
    sendDMMessage,
  };
};
```

## File Upload Integration

### S3 Upload Flow

```typescript
// services/uploadService.ts
export const uploadImage = async (file: File): Promise<string> => {
  // Get presigned URL from backend
  const { url, key } = await ApiService.request<{ url: string; key: string }>('/api/s3/s3Url');

  // Upload directly to S3
  const uploadResponse = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image');
  }

  return key; // Return S3 key for use in post creation
};

// Image upload hook
export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const key = await uploadImage(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      return key;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return { uploadFile, uploading, uploadProgress };
};
```

## Error Handling

### API Error Classes

```typescript
// utils/errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed') {
    super(401, message);
    this.name = 'AuthenticationError';
  }
}

export class PermissionError extends ApiError {
  constructor(required: number, current: number) {
    super(403, `Insufficient vibes. Required: ${required}, Current: ${current}`);
    this.name = 'PermissionError';
  }
}
```

### Error Handling Patterns

```typescript
// hooks/useErrorHandler.ts
export const useErrorHandler = () => {
  const showNotification = useNotification();

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof AuthenticationError) {
        // Redirect to login
        deleteCookie('pigeonId');
        deleteCookie('userId');
        window.location.href = '/welcome';
        return;
      }

      if (error instanceof PermissionError) {
        showNotification({
          type: 'warning',
          message: error.message,
          duration: 5000,
        });
        return;
      }

      if (error instanceof ApiError) {
        showNotification({
          type: 'error',
          message: error.message,
          duration: 3000,
        });
        return;
      }

      // Generic error handling
      console.error('Unexpected error:', error);
      showNotification({
        type: 'error',
        message: 'An unexpected error occurred',
        duration: 3000,
      });
    },
    [showNotification],
  );

  return { handleError };
};
```

### React Query Error Handling

```typescript
// Global error handling for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on authentication or permission errors
        if (error instanceof AuthenticationError || error instanceof PermissionError) {
          return false;
        }
        return failureCount < 3;
      },
      onError: (error) => {
        // Global error handling
        if (error instanceof ApiError) {
          handleApiError(error);
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (error instanceof ApiError) {
          handleApiError(error);
        }
      },
    },
  },
});
```

## Data Validation

### Request Validation

```typescript
// utils/validation.ts
export const validateCreatePostRequest = (data: CreatePostRequest): void => {
  if (!data.image) {
    throw new Error('Image is required');
  }

  if (data.text && data.text.length > 500) {
    throw new Error('Post text cannot exceed 500 characters');
  }

  if (!data.user.location.lat || !data.user.location.lon) {
    throw new Error('Location is required');
  }

  // Validate latitude/longitude ranges
  if (data.user.location.lat < -90 || data.user.location.lat > 90) {
    throw new Error('Invalid latitude');
  }

  if (data.user.location.lon < -180 || data.user.location.lon > 180) {
    throw new Error('Invalid longitude');
  }
};
```

### Response Validation

```typescript
// Type guards for API responses
export const isValidUser = (obj: any): obj is IUserData => {
  return (
    obj &&
    typeof obj.userId === 'string' &&
    typeof obj.userName === 'string' &&
    typeof obj.vibes === 'number' &&
    obj.location &&
    typeof obj.location.lat === 'number' &&
    typeof obj.location.lon === 'number'
  );
};

export const isValidPost = (obj: any): obj is IPost => {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.image === 'string' &&
    obj.user &&
    isValidUser(obj.user) &&
    typeof obj.createdAt === 'string'
  );
};
```

## Performance Optimization

### Request Caching

```typescript
// Cache configuration for different data types
const cacheConfig = {
  posts: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
  },
  user: {
    staleTime: 60 * 1000, // 1 minute
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  conversations: {
    staleTime: 10 * 1000, // 10 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  },
};
```

### Request Debouncing

```typescript
// hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Usage in search functionality
const usePostSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: searchResults } = useQuery(
    ['post-search', debouncedSearchTerm],
    () => searchPosts(debouncedSearchTerm),
    {
      enabled: debouncedSearchTerm.length > 2,
    },
  );

  return { searchTerm, setSearchTerm, searchResults };
};
```

### Optimistic Updates

```typescript
// Optimistic updates for immediate UI feedback
export const useOptimisticPostReaction = () => {
  const queryClient = useQueryClient();

  const optimisticLike = useMutation(likePostRequest, {
    onMutate: async ({ postId }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['posts']);

      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update
      queryClient.setQueryData(['posts'], (old: IPost[] | undefined) =>
        old?.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1, userLiked: true } : post)),
      );

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      // Rollback on error
      queryClient.setQueryData(['posts'], context?.previousPosts);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['posts']);
    },
  });

  return { optimisticLike };
};
```

## Testing Integration

### API Mocking

```typescript
// __mocks__/apiService.ts
export const mockApiService = {
  request: jest.fn(),
};

// Test setup
const mockPosts: IPost[] = [
  {
    id: '1',
    text: 'Test post',
    image: 'test-image-key',
    user: mockUser,
    likes: 5,
    dislikes: 0,
    createdAt: '2025-06-27T00:00:00Z',
  },
];

beforeEach(() => {
  mockApiService.request.mockImplementation((endpoint: string) => {
    if (endpoint === '/api/post/') {
      return Promise.resolve(mockPosts);
    }
    return Promise.reject(new Error('Not implemented'));
  });
});
```

### Integration Testing

```typescript
// Integration test example
test('user can create and like a post', async () => {
  render(<App />);

  // Login
  fireEvent.click(screen.getByText('Login'));

  // Create post
  fireEvent.click(screen.getByText('Create Post'));
  fireEvent.change(screen.getByPlaceholderText('What\'s on your mind?'), {
    target: { value: 'Test post content' },
  });
  fireEvent.click(screen.getByText('Post'));

  // Wait for post to appear
  await waitFor(() => {
    expect(screen.getByText('Test post content')).toBeInTheDocument();
  });

  // Like the post
  fireEvent.click(screen.getByLabelText('Like post'));

  // Verify like was registered
  await waitFor(() => {
    expect(screen.getByText('1 like')).toBeInTheDocument();
  });
});
```
