# Current Architecture

## Technology Stack

### Frontend Framework
- **React 19** - Latest React with concurrent features
- **TypeScript 5.9** - Full type safety throughout the application
- **Vite** - Fast build tool and development server
- **React Router 7** - Modern routing with data loading

### State Management
- **React Query 5** - Server state management and caching
- **Zustand** - Lightweight client state management
- **React Context** - Theme and authentication context

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI primitives
- **Lucide React** - Consistent icon system
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting and error detection
- **Biome** - Fast code formatting
- **Playwright** - End-to-end testing framework
- **Vitest** - Unit testing framework

### Build & Deployment
- **Vite Build** - Optimized production builds
- **PWA Support** - Service worker and offline capabilities
- **Vercel** - Frontend static hosting (CDN, auto SSL)
- **Heroku** - Backend API hosting

### Deployment Architecture
```
┌─────────────────────┐         ┌─────────────────────┐
│       Vercel        │   API   │       Heroku        │
│   (Static Files)    │ ──────► │    (Node.js API)    │
│  qa.vibesapp.net    │   SSE   │  logosil-backend    │
└─────────────────────┘         └─────────────────────┘
```

**Why this architecture?**
- Monorepo-friendly (no complex buildpack issues)
- Frontend builds locally, deploys as static files
- SSE connections go directly from browser to Heroku
- Fast global CDN for static assets via Vercel

## Project Structure

```
apps/web-v2/
├── src/
│   ├── app/              # Application setup
│   │   ├── App.tsx       # Root component
│   │   ├── Router.tsx    # Route configuration
│   │   ├── providers.tsx # Context providers
│   │   └── pages/        # Page components
│   ├── features/         # Feature modules
│   │   ├── auth/         # Authentication
│   │   ├── posts/        # Posts & interactions
│   │   ├── messaging/    # Real-time messaging
│   │   ├── profile/      # User profiles
│   │   ├── settings/     # User preferences
│   │   ├── activity/     # Activity feeds
│   │   └── admin/        # Admin panel
│   ├── components/       # Shared components
│   │   ├── ui/           # Design system
│   │   ├── ui-next/      # Updated components
│   │   ├── shared/       # Reusable components
│   │   ├── layout/       # Layout components
│   │   └── ThemeSwitcher.tsx
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilities
│   ├── types/            # TypeScript types
│   ├── styles/           # Global styles
│   └── assets/           # Static assets
```

## Architecture Patterns

### Feature-Based Organization
Each feature is self-contained with its own:
- Components
- Hooks
- API services
- Types
- Tests

### Component Composition
- **Atomic Design**: Small, reusable components
- **Compound Components**: Related components grouped together
- **Render Props**: Flexible component APIs
- **Custom Hooks**: Logic extraction and reuse

### State Management Strategy
- **Server State**: React Query for API data
- **Client State**: Zustand for UI state
- **Form State**: Local component state
- **Global State**: Context for theme/auth

### API Integration
- **Axios**: HTTP client with interceptors
- **React Query**: Caching and synchronization
- **Error Handling**: Global error boundaries
- **Loading States**: Suspense and skeleton components

## API Design Principles

### Dumb Frontend, Smart Backend

The frontend is a **visual presentation layer only**. All data logic, aggregation, and computation lives in the backend.

#### Core Rules:

1. **Single Request = Complete Response**
   - When the frontend requests an entity (post, user, conversation), the backend returns ALL data needed to display it
   - No multiple API calls to display a single entity
   - No "get post" then "get comments count" then "get likes count"

2. **No Frontend Data Derivation**
   - Frontend should NOT calculate, aggregate, or derive data
   - ❌ `const likes = post.reactions.filter(r => r.type === 'like').length`
   - ✅ `post.likeCount` (computed by backend)

3. **Consistent Schema**
   - Every response of the same type MUST include all fields
   - Use `0` or `null` for empty values, never `undefined`
   - Frontend can choose to hide "0" values visually, but data is always present

4. **Backend Computes, Frontend Displays**
   - Backend: "Here's a post with 5 likes and 3 comments"
   - Frontend: "I'll show the heart icon with '5' and comment icon with '3'"

#### Post Response Schema Example:

```typescript
interface PostResponse {
  _id: string;
  text: string | null;
  image: string;
  user: PostUser;
  
  // Always computed by backend, never derived on frontend
  likeCount: number;      // Always present, 0 if none
  commentCount: number;   // Always present, 0 if none
  
  // Raw data if frontend needs it for other purposes
  reactions: Reaction[];
  
  createdAt: string;
  updatedAt: string;
}
```

#### Benefits:
- **Performance**: Single round-trip, no waterfall requests
- **Consistency**: Same data structure everywhere
- **Maintainability**: Logic changes only need backend updates
- **Testability**: Backend logic is easier to unit test
- **Offline Support**: Complete data cached from single request

### Comment System (Polymorphic Post Model)

Comments are stored in the **same MongoDB collection as posts** using a polymorphic design. The `commentOn` field distinguishes them:

```typescript
interface Post {
  _id: string;
  text?: string;
  image?: string;              // Required for posts, optional for comments
  commentOn?: string;          // If set, this is a comment on that post ID
  replyToCommentId?: string;   // If set, this is a reply to another comment
  // ... other fields
}
```

**Why?** Comments share most fields with posts (text, user, reactions, timestamps) and can be "vibed" just like posts.

**API Separation:**
- `GET /api/posts` → Filters out comments (`!post.commentOn`)
- `GET /api/comments/:postId` → Returns only comments for that post
- `POST /api/comments` → Creates a comment (sets `commentOn`)

See [Backend Architecture - Comment System](../Web-V1/05-backend-architecture.md#comment-system-architecture-polymorphic-design) for full documentation.

## Performance Optimizations

### Build Performance
- **Vite**: Sub-second HMR and fast builds
- **Code Splitting**: Route-based and component splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and lazy loading

### Runtime Performance
- **React 19**: Concurrent rendering and automatic batching
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: Efficient large list rendering
- **Image Optimization**: Progressive loading and WebP support

### Bundle Analysis
- **Bundle Size**: <500KB total (from ~800KB in V1)
- **Vendor Splitting**: Separate chunks for libraries
- **Dynamic Imports**: Lazy loading of routes and components

## Accessibility (WCAG AA)

### Screen Reader Support
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Comprehensive labeling for interactive elements
- **Focus Management**: Keyboard navigation and focus indicators
- **Live Regions**: Dynamic content announcements

### Keyboard Navigation
- **Tab Order**: Logical navigation flow
- **Keyboard Shortcuts**: Common actions accessible via keyboard
- **Focus Trapping**: Modal and dropdown focus management
- **Skip Links**: Quick navigation to main content

### Visual Accessibility
- **Color Contrast**: WCAG AA compliant ratios
- **Theme Support**: Light, dim, and dark themes
- **Font Scaling**: Responsive typography
- **Motion Preferences**: Reduced motion support

## Security Considerations

### Authentication
- **Pigeon ID System**: Password-only authentication
- **JWT Tokens**: Secure token storage and refresh
- **Session Management**: Automatic logout on inactivity

### Data Protection
- **Input Validation**: Client and server-side validation
- **XSS Prevention**: Sanitized user content
- **CSRF Protection**: Token-based request validation
- **Secure Headers**: Content Security Policy

### Privacy
- **Minimal Data Collection**: Only necessary user data
- **Location Privacy**: Optional GPS with manual fallback
- **Cookie Management**: Secure, httpOnly cookies
- **Data Encryption**: Encrypted data transmission

## Development Workflow

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Consistent code standards
- **Biome**: Automated formatting
- **Pre-commit Hooks**: Quality gates before commits

### Testing Strategy
- **Unit Tests**: Component and utility testing
- **Integration Tests**: Feature-level testing
- **E2E Tests**: User journey testing
- **Accessibility Tests**: Automated a11y checks

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Code Quality**: Lint and format checks
- **Security Scanning**: Dependency vulnerability checks
- **Performance Monitoring**: Bundle size and Lighthouse scores

## Deployment Architecture

### Production Build
- **Static Assets**: Optimized and cached
- **Service Worker**: Offline functionality
- **PWA Manifest**: Installable web app
- **CDN Integration**: Fast global content delivery

### Environment Configuration
- **Environment Variables**: Secure configuration
- **Build Variants**: Development and production builds
- **Feature Flags**: Runtime feature toggling
- **Analytics**: Performance and usage tracking

### Monitoring & Maintenance
- **Error Tracking**: Real-time error monitoring
- **Performance Metrics**: Core Web Vitals tracking
- **User Analytics**: Usage patterns and feature adoption
- **Security Updates**: Regular dependency updates

## Migration from V1

### Key Improvements
- **Performance**: 6x faster builds, 2x faster HMR
- **Bundle Size**: 37% smaller bundles
- **Developer Experience**: Better tooling and TypeScript
- **Accessibility**: Full WCAG AA compliance
- **Architecture**: Maintainable, scalable codebase

### Breaking Changes
- **Technology Stack**: Complete rewrite with new tools
- **Component API**: New design system and patterns
- **State Management**: Different patterns and libraries
- **Build Process**: Vite instead of Create React App

### Migration Strategy
- **Feature Parity**: All V1 features implemented in V2
- **Progressive Migration**: Component-by-component replacement
- **Data Compatibility**: Backend API maintained
- **User Experience**: Improved UX with same functionality