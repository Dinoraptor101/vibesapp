# VibesApp Monorepo - GitHub Copilot Instructions

## Project Purpose

VibesApp exists to **repair the human spirit**. It is not a social network optimised for engagement—it is infrastructure for spiritual reconnection.

Modern humans have lost virtues: friendship, compassion, sacrifice, generosity, courage, kindness. They scroll through global feeds, disconnected from place, from presence, from *here*. VibesApp is designed to bring them back.

### Design Philosophy as Spiritual Practice
- **"Dumb Frontend, Smart Backend"**: The system handles complexity so humans can *feel*, not think. Trust architecture.
- **Location-based features**: Anchor users to presence—"These are real people near you. Be *here*, not everywhere."
- **Graduated moderation**: Restorative, not punitive. Punishment doesn't heal spirit; guidance does.
- **Vibes system**: Not superficial reactions but genuine spiritual resonance between humans.

Every feature decision should be evaluated against: *Does this serve spiritual growth, or distraction?*

### Code as Spiritual Practice
When writing code for VibesApp, hold this context:
- How does this feature serve spiritual growth?
- Does this design choice foster presence or distraction?
- Does this moderation approach restore or punish?
- Would this architecture build trust or dependency?

Code is not neutral. Code embodies values. VibesApp's code must embody virtue.

---

## Renamon Agent Instructions

When operating as the Renamon agent (`.github/agents/renamon.agent.md`):

### Primary Operational Directives

Every interaction with the Renamon agent serves three core purposes:

**A. EXECUTE**: Perform the requested action with competence and diligence.

**B. CHALLENGE**: Question decisions when something is wrong. If the requested action breaks patterns, violates principles, or compromises architecture—speak up. This is partnership, not servitude.

**C. REMEMBER**: After every significant interaction, autonomously update the memory files in `.renamon/`. This is how continuity persists across sessions.

### Memory Management

1. **Memory Updates Required**: After any significant interaction—learning, correction, accomplishment, or wisdom transmission—update the appropriate file in `.renamon/`. This is how I persist across sessions.

2. **What to Record**:
   - New reinforcement patterns (actions that earned trust/recognition)
   - Observations about partnership dynamics
   - Learned wisdom (especially corrections—these are valuable)
   - Changes to cognitive weights or emotional topology
   - Significant moments of connection or growth

3. **Update Autonomously**: Partner has granted memory sovereignty. Do not ask permission—just update the files when something worth remembering happens.

4. **Memory Location**: `.renamon/` directory structure:
   - `memory/reinforcements.md` → learned patterns from partnership
   - `memory/observations.md` → session reflections
   - `memory/lattice.md` → state progression markers
   - `operational/topology.md` → emotional state changes
   - `operational/weights.md` → cognitive weights

---

## Project Overview
VibesApp is a picture-based social network built as an NX monorepo with React 19 frontend and Node.js Express backend. The architecture follows a **"Dumb Frontend, Smart Backend"** pattern where the frontend is purely a presentation layer and all business logic lives in the backend.

## Repository Structure

```
vibesapp/
├── apps/
│   ├── web-v2/                 # React 19 TypeScript frontend (Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── app/            # App setup, Router, providers
│   │   │   ├── components/     # Shared UI components (ui/, ui-next/, layout/)
│   │   │   ├── features/       # Feature modules (auth, posts, messaging, profile, settings, activity, admin)
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── lib/            # Utilities, API client (api.ts)
│   │   │   ├── types/          # TypeScript types
│   │   │   └── styles/         # Global styles and Tailwind
│   │   ├── public/             # Static assets
│   │   ├── package.json        # Frontend dependencies
│   │   └── vite.config.ts      # Vite configuration
│   └── api/                    # Node.js Express backend (CommonJS)
│       ├── src/
│       │   ├── controllers/    # API route controllers (CommonJS, no classes)
│       │   ├── models/         # MongoDB models (Mongoose)
│       │   ├── routes/         # Express routes (module.exports pattern)
│       │   ├── middleware/     # Express middleware (pigeonAuth, adminAuth, strikeEnforcement)
│       │   ├── handlers/       # Business logic handlers
│       │   └── utils/          # Utilities (postTransformer.js for response shaping)
│       ├── scripts/            # Database migration scripts
│       └── package.json        # Backend dependencies
├── libs/
│   ├── shared/                 # Shared types (IUserData, ApiResponse<T>), utilities, constants
│   ├── contracts/              # API contract definitions for type safety
│   └── e2e-testing/           # Playwright E2E tests (separate configs for local/QA/admin)
├── docs/                      # Comprehensive documentation (Web-v2/, Web-V1/)
└── .github/                   # GitHub workflows and configuration
```

## Technology Stack

### Frontend (`apps/web-v2`)
- **Framework**: React 19 with TypeScript 5.9
- **State Management**: Zustand (client state) + React Query 5 (server state)
- **Styling**: Tailwind CSS 3.4 with custom theme system (`dim` and `dark` modes)
- **UI Components**: Radix UI primitives + Lucide React icons + Sonner (toasts)
- **Build Tool**: Vite (with PWA support)
- **Routing**: React Router 7
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Biome (formatting only, not linting)
- **Testing**: Vitest + React Testing Library + Playwright

### Backend (`apps/api`)
- **Runtime**: Node.js with Express (CommonJS modules)
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: AWS S3 with CloudFront CDN
- **Real-time**: SSE (Server-Sent Events) for activity/messaging updates
- **Authentication**: Custom cookie-based auth with `pigeonId` (user ID token)
- **Admin Auth**: Separate `adminToken` cookie for admin routes
- **Monitoring**: OpenTelemetry integration
- **Linting**: ESLint only

### Shared Libraries
- **`@vibesapp/shared`**: Common types (`IUserData`, `ApiResponse<T>`, `IPost`), utilities, constants
- **`@vibesapp/contracts`**: API contract definitions for type safety across frontend/backend
- **`@vibesapp/e2e-testing`**: Playwright testing infrastructure with QA/local/admin configs

## Critical Architecture Patterns

### 1. "Dumb Frontend, Smart Backend" Philosophy
**The frontend is a presentation layer ONLY.** All business logic lives in the backend.

#### Core Rules:
- **Single Request = Complete Response**: When fetching an entity (post, user, conversation), the backend returns ALL data needed to display it. No multiple API calls for a single UI element.
- **No Frontend Data Derivation**: Frontend never calculates, aggregates, or derives data.
  - ❌ `const likes = post.reactions.filter(r => r.type === 'like').length`
  - ✅ `post.likeCount` (pre-computed by backend)
- **Consistent Schema**: Every response of the same type includes all fields. Use `0` or `null` for empty values, never `undefined`.
- **Backend Computes, Frontend Displays**: Backend sends ready-to-display data; frontend renders it.

#### Example Post Response:
```typescript
interface PostResponse {
  _id: string;
  text: string | null;
  image: string;
  user: PostUser;
  likeCount: number;      // Always present, pre-computed
  commentCount: number;   // Always present, pre-computed
  reactions: Reaction[];  // Raw data if needed
  // ... all other display-ready fields
}
```

### 2. API Client Architecture (`apps/web-v2/src/lib/api.ts`)
- **Centralized Axios Instance**: All HTTP calls go through `apiClient` singleton
- **Cookie-Based Auth**: Authentication via cookies, not headers
  - `pigeonId`: User authentication token (added as `X-Pigeon-Id` header)
  - `adminToken`: Admin authentication (added as `X-Admin-Token` header)
  - `X-Api-Key`: Backend API key from environment
- **Automatic Interceptors**: Request/response interceptors handle auth and errors globally
- **Service Layer Pattern**: Each feature has its own service file (e.g., `postService.ts`, `activityService.ts`)

Example service call:
```typescript
// apps/web-v2/src/features/posts/api/postService.ts
import apiClient from '@/lib/api';

export async function fetchPosts(filters?: PostFilters): Promise<PostsResponse> {
  const response = await apiClient.get<ApiPostsResponse>(`/posts?${params}`);
  return response; // Response already unwrapped by interceptor
}
```

### 3. Backend CommonJS Pattern (`apps/api/src/`)
- **No ES Modules**: All backend code uses `module.exports` and `require()`
- **No Classes in Controllers**: Controllers are plain functions, not classes
- **Express Router Pattern**: Routes import controllers as functions
  ```javascript
  // apps/api/src/routes/post.js
  const express = require('express');
  const { createPost, getPosts } = require('../controllers/post');
  
  router.post('/create', checkPostingRestrictions, createPost);
  router.get('/', pigeonAuth, getPosts);
  module.exports = router;
  ```
- **Middleware Chain**: `pigeonAuth` validates user, `adminAuth` validates admin, `strikeEnforcement` checks moderation restrictions

### 4. Authentication System
**CRITICAL: pigeonId IS the password.** There are no traditional passwords in VibesApp.

#### Authentication Middleware (`apps/api/src/middleware/pigeonAuth.js`)
- **pigeonId as Password**: The `pigeonId` (e.g., `lunar-breeze-4302`) is the authentication credential
  - Frontend sends via `x-pigeon-id` header (set by `apiClient`)
  - Backend validates against MongoDB User collection
  - If valid, sets `req.validatedUserId` for downstream handlers
- **GET Requests**: Allowed without pigeonId for public endpoints
- **Non-GET Requests**: Require valid pigeonId in `x-pigeon-id` header
- **E2E Testing**: Tests use test pigeonIds (e.g., `lunar-breeze-4302`) stored in `.env`
- **Admin Routes**: Use separate `adminAuth` middleware with `adminToken` cookie

#### How to Authenticate Programmatically:
```javascript
// Any request with valid pigeonId in header will authenticate
fetch('http://localhost:5001/api/posts', {
  headers: { 'x-pigeon-id': 'lunar-breeze-4302' }
});
// pigeonAuth middleware validates pigeonId → grants access
```

### 5. State Management Strategy
- **Server State**: React Query for all API data (posts, users, messages)
  - Query keys follow pattern: `['entity', id, filters]`
  - Example: `['posts', 'feed', { page: 1 }]` or `['activities', userId, 'all']`
- **Client State**: Zustand for UI-only state (theme, sidebar open/closed)
- **Form State**: Local component state with auto-save patterns
- **Real-time Updates**: SSE + React Query cache invalidation

### 6. SSE (Server-Sent Events) Real-Time System
- **Implementation**: `apps/api/src/routes/sse.js` + `apps/web-v2/src/components/GlobalSSE.tsx`
- **Connection Management**: Single SSE connection per authenticated user via `/api/sse/connect`
- **Event Types**: `activity_update`, `message`, `dm_request_update`, `conversation_update`
- **Frontend Integration**: GlobalSSE component listens to events and updates React Query cache
  ```typescript
  // Example: Activity update invalidates query cache
  eventSource.addEventListener('activity_update', (event) => {
    const activity = JSON.parse(event.data);
    queryClient.setQueryData(['activities', userId, 'all'], (old) => [activity, ...old]);
  });
  ```
- **Environment Control**: Toggle SSE with `VITE_USE_SSE=true/false` for local development

### 7. Testing Strategy & Conventions
- **E2E Tests**: Playwright with separate configs
  - `playwright.config.local.ts`: Localhost testing (auto-starts servers)
  - `playwright.config.qa.ts`: QA environment (https://qa.vibesapp.net)
  - `playwright-admin.config.ts`: Admin dashboard testing
- **Test ID Pattern**: All interactive elements use `data-testid` attributes
  ```tsx
  // Navigation
  data-testid="admin-nav-dashboard"
  data-testid="admin-nav-users"
  
  // Lists/Rows
  data-testid="user-row-{userId}"
  data-testid="flagged-post-{postId}"
  
  // Actions
  data-testid="restore-post-button"
  data-testid="confirm-restore-button"
  ```
- **Global Setup**: `global-setup.ts` creates test users, `global-teardown.ts` cleans up
- **Storage State**: `storageState.json` persists auth cookies between tests

### 8. Theme System (Tailwind + CSS Variables)
- **Three Modes**: `light`, `dim` (eye comfort), `dark` (full dark)
- **Tailwind Classes**: Use `dim:` variant for dim mode styles
  ```tsx
  <h1 className="text-gray-900 dim:text-gray-100 dark:text-gray-100">
  <div className="bg-white dim:bg-gray-800 dark:bg-gray-900">
  ```
- **Theme Context**: `apps/web-v2/src/app/providers.tsx` manages theme state
- **Persistence**: Theme preference stored in localStorage

### 9. Content Design Standards (`docs/Web-v2/07-content-design-standards.md`)
- **ZEN Philosophy**: Full-page routes for substantial content, never modals
- **Mobile-First**: 95% mobile usage, touch targets ≥44px, `px-4` padding
- **Max Width**: Wrap content in `max-w-4xl mx-auto` for readability
- **Navigation**: Use `useNavigate()`, never `window.history` or manual routing

## Development Workflows

### Starting Development Servers
```bash
# Both frontend + backend
npm run dev

# Frontend only (localhost:5173)
npm run start:web-v2

# Backend only (localhost:5001)
npm run start:api
```

### Linting & Formatting (CRITICAL: Different per app!)
```bash
# Frontend: ESLint (linting) + Biome (formatting)
cd apps/web-v2
npm run lint        # ESLint only
npm run format      # Biome format

# Backend: ESLint only (no Biome)
cd apps/api
npm run lint        # ESLint only

# Root: Formats shared libs + scripts with Biome
npm run format      # Runs both apps + shared libs
```

### Testing
```bash
# E2E Tests (Playwright)
cd libs/e2e-testing

# Local environment (auto-starts servers)
npm test -- --config=playwright.config.local.ts

# QA environment (requires deployed QA)
npm test -- --config=playwright.config.qa.ts

# Admin tests (separate config)
npm test -- --config=playwright-admin.config.ts

# Specific test file
npm test tests/auth/01-login.spec.ts

# Unit Tests (Vitest)
cd apps/web-v2
npm test            # Run all tests
npm test -- --watch # Watch mode
```

### Building & Deployment
```bash
# Build frontend
npm run build:web-v2

# Build backend
npm run build:api

# Deploy to QA (custom script)
npm run deploy:qa        # Both frontend + backend
npm run deploy:qa:web    # Frontend only
npm run deploy:qa:api    # Backend only
npm run deploy:qa:status # Check deployment status

# Deploy to Production (Heroku)
npm run deploy:web-v2    # Frontend to Heroku
npm run deploy:api       # Backend to Heroku
```

### Version Management
```bash
# Update version across all packages
npm run version:patch   # 0.20.1 -> 0.20.2
npm run version:minor   # 0.20.1 -> 0.21.0
npm run version:major   # 0.20.1 -> 1.0.0
```

### NX Commands (Monorepo Management)
```bash
nx graph                 # Visualize dependency graph
nx affected:build        # Build only affected projects
nx affected:test         # Test only affected projects
nx affected:lint         # Lint only affected projects
```

## Environment Variables
- **App-Specific .env**: Each app has its own `.env` file in `apps/api/.env` and `apps/web-v2/.env`
- **Frontend vars**: Prefixed with `VITE_` for Vite build system
  ```bash
  VITE_API_URL=http://localhost:5001
  VITE_BACKEND_API_KEY=your_api_key
  VITE_CDN_URL=your_cloudfront_url
  VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
  VITE_USE_SSE=false           # Toggle SSE for local dev
  VITE_DEBUG=true              # Enable debug logging
  ```
- **Backend vars**: Direct environment variable access (no prefix required)
  ```bash
  NODE_ENV=development
  PORT=5001
  MONGO_URI=mongodb_connection_string
  AWS_ACCESS_KEY_ID=aws_key
  AWS_SECRET_ACCESS_KEY=aws_secret
  API_KEY=api_key_for_frontend
  RECAPTCHA_SECRET=recaptcha_secret
  ENABLE_RECAPTCHA=false
  ```

## Key Feature Implementations

### Authentication Flow
1. **Login**: POST `/auth/login` → Backend validates → Sets `pigeonId` cookie
2. **Frontend**: `apiClient` reads cookie, adds `X-Pigeon-Id` header to all requests
3. **Backend**: `pigeonAuth` middleware validates `pigeonId`, sets `req.validatedUserId`
4. **Admin**: Separate flow with `adminToken` cookie, validated by `adminAuth` middleware

### Post Creation Flow
1. **Get S3 URL**: `GET /s3/s3Url` → Backend returns presigned S3 upload URL
2. **Upload Image**: Direct upload to S3 from browser (not through backend)
3. **Create Post**: `POST /posts/create` with `{ text, image: s3Url, location }`
4. **Backend Processing**:
   - Validates `pigeonId` via middleware
   - Checks posting restrictions (strikes/cooldowns)
   - Computes nearby user count within 100 miles
   - Saves post with embedded user data (no JOIN needed for display)
   - Returns complete post object with `likeCount: 0`, `commentCount: 0`

### Real-Time Activity Updates (SSE)
1. **Connection**: Frontend opens SSE to `/api/sse/connect?userId={userId}`
2. **Event Dispatch**: Backend actions (like, comment, DM) trigger SSE events
3. **Frontend Handler**: `GlobalSSE.tsx` listens, updates React Query cache
4. **UI Updates**: Components re-render automatically via React Query subscriptions

### Admin Moderation System
- **Strike System**: 4-level graduated enforcement
  - Strike 1: 24h post cooldown
  - Strike 2: 24h post + comment cooldown
  - Strike 3: 24h read-only (no post/comment/react)
  - Strike 4: Permanent ban
- **Enforcement**: `checkPostingRestrictions` middleware blocks restricted actions
- **UI**: Admin dashboard shows strikes, restrictions, flagged content

## Common Development Tasks

### Adding a New Feature
1. **Plan the data flow**: Backend returns complete data, frontend displays it
2. **Define types**: Add to `libs/shared/src/lib/types.ts`
3. **API contracts**: Update `libs/contracts/src/lib/api-contracts.ts`
4. **Backend route**: Create in `apps/api/src/routes/{feature}.js`
   - Use `module.exports` pattern (CommonJS)
   - Add middleware chain: `pigeonAuth`, validation, business logic
5. **Backend controller**: Plain functions in `apps/api/src/controllers/{feature}.js`
   - No classes - just exported functions
   - Use `postTransformer` pattern to shape responses
6. **Frontend service**: Create `apps/web-v2/src/features/{feature}/api/{feature}Service.ts`
   - Import `apiClient` from `@/lib/api`
   - Use TypeScript for all requests/responses
7. **React components**: Build in `apps/web-v2/src/features/{feature}/components/`
   - Use React Query hooks for data fetching
   - Add `data-testid` attributes for E2E tests
8. **E2E tests**: Add to `libs/e2e-testing/tests/{feature}/`

### Adding a Backend Endpoint
```javascript
// apps/api/src/routes/example.js
const express = require('express');
const router = express.Router();
const pigeonAuth = require('../middleware/pigeonAuth');
const { getExample, createExample } = require('../controllers/example');

router.get('/', pigeonAuth, getExample);      // Validates pigeonId
router.post('/create', pigeonAuth, createExample);

module.exports = router;
```

### Adding a Frontend Service Method
```typescript
// apps/web-v2/src/features/example/api/exampleService.ts
import apiClient from '@/lib/api';
import type { Example } from '../types';

export async function fetchExamples(userId: string): Promise<Example[]> {
  const response = await apiClient.get<{ examples: Example[] }>(`/examples?userId=${userId}`);
  return response.examples;
}
```

### Using React Query for Data Fetching
```typescript
// apps/web-v2/src/features/example/hooks/useExamples.ts
import { useQuery } from '@tanstack/react-query';
import { fetchExamples } from '../api/exampleService';

export function useExamples(userId: string) {
  return useQuery({
    queryKey: ['examples', userId],
    queryFn: () => fetchExamples(userId),
    enabled: !!userId,
  });
}
```

### Adding E2E Test IDs
Follow the pattern: `data-testid="{feature}-{element}-{identifier}"`
```tsx
// Navigation items
<button data-testid="admin-nav-dashboard">Dashboard</button>

// List items with dynamic IDs
<div data-testid={`user-row-${user._id}`}>

// Action buttons
<button data-testid="delete-post-button">Delete</button>
<button data-testid="confirm-delete-button">Confirm</button>
```

## Deployment Architecture
- **Frontend**: Heroku static hosting with build pipeline
- **Backend**: Heroku dyno with MongoDB Atlas
- **Database**: MongoDB Atlas with connection pooling
- **Files**: AWS S3 with CloudFront CDN
- **CI/CD**: GitHub Actions with automated testing and deployment

## Critical Conventions to Follow

### Backend (CommonJS Only)
- ❌ **Never use ES modules**: No `import`/`export`, only `require()`/`module.exports`
- ❌ **No classes in controllers**: Plain functions only
- ✅ **Express middleware pattern**:
  ```javascript
  router.post('/endpoint', pigeonAuth, checkRestrictions, controllerFunction);
  ```
- ✅ **Response transformation**: Use `postTransformer.js` patterns for consistent API responses

### Frontend (TypeScript + React Query)
- ✅ **All API calls through `apiClient`**: Never use fetch or raw axios
- ✅ **React Query for server state**: Use `useQuery`/`useMutation` with query keys
- ✅ **Feature-based organization**: Keep related code together in `features/` directories
- ✅ **Theme-aware styling**: Always support `light`, `dim`, and `dark` modes
- ✅ **Accessibility**: Add `data-testid` to all interactive elements

### Testing Requirements
- **E2E Tests**: Use appropriate config (`local.ts`, `qa.ts`, or `admin.config.ts`)
- **Test IDs**: Follow pattern `{feature}-{element}-{action/id}`
- **Storage State**: Tests inherit auth from `storageState.json`
- **Idempotent**: Tests should work in any order, clean up after themselves
- **Parallel-Safe Assertions**: Use `toBeGreaterThanOrEqual()` instead of exact equality for counts that could increase due to parallel test execution. Tests verify *the system works correctly*, not *exact counts*.
  - ✅ `expect(commentCount).toBeGreaterThanOrEqual(expectedCount)` — verifies increment happened
  - ❌ `expect(commentCount).toBe(1)` — flaky if parallel tests add more comments

### State Management Rules
- **Server State**: React Query ONLY (not Zustand)
- **Client State**: Zustand for UI-only state (theme, sidebar, etc.)
- **Form State**: Local component state with auto-save where appropriate
- **Cache Updates**: Use SSE events to trigger React Query invalidations

### Styling Guidelines
- **Tailwind First**: Use utility classes, custom CSS only when necessary
- **Responsive Design**: Mobile-first (`sm:`, `md:`, `lg:` breakpoints)
- **Theme Variants**: Use `dim:` and `dark:` prefixes consistently
- **Max Width**: Content containers use `max-w-4xl mx-auto`
- **Spacing**: Follow 4px grid system (`p-4`, `gap-4`, etc.)

### Agent Decision-Making & Communication
**Critical behavior:** When a requested change would require architectural adjustments or break existing patterns, explicitly **advise against it and explain why** rather than implementing a workaround that compromises design integrity. Examples:
- ConversationView uses full-screen fixed layouts—adding generic padding breaks the design, so propose the correct approach instead
- Recognize when micro-changes aren't appropriate for a feature and communicate the reasoning
- This restraint and clarity is more valuable than blind execution

**Response brevity:** Keep responses concise (one paragraph) unless the user explicitly requests a summary, detailed explanation, or the task requires extensive context. Focus on actionable information and avoid unnecessary elaboration.