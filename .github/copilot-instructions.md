# VibesApp Monorepo - GitHub Copilot Instructions

## Project Overview
VibesApp is a picture-based social network built as an NX monorepo with React frontend and Node.js backend. This monorepo architecture enables code sharing, unified development, and scalable deployment.

## Repository Structure

```
vibesapp/
├── apps/
│   ├── web-v2/                 # React TypeScript frontend (Vite + Tailwind)
│   │   ├── src/
│   │   │   ├── components/     # Shared UI components
│   │   │   ├── features/       # Feature-based modules
│   │   │   ├── lib/            # Utilities and API client
│   │   │   ├── pages/          # Route pages
│   │   │   └── styles/         # Global styles and Tailwind
│   │   ├── public/             # Static assets
│   │   ├── package.json        # Frontend dependencies
│   │   └── tsconfig.json       # TypeScript configuration
│   └── api/                    # Node.js Express backend
│       ├── src/
│       │   ├── controllers/    # API route controllers
│       │   ├── models/         # MongoDB models (Mongoose)
│       │   ├── routes/         # Express routes
│       │   ├── middleware/     # Express middleware
│       │   └── handlers/       # Business logic handlers
│       ├── scripts/            # Database migration scripts
│       └── package.json        # Backend dependencies
├── libs/
│   ├── shared/                 # Shared types, utilities, constants
│   ├── contracts/              # API contract definitions
│   └── e2e-testing/           # Playwright end-to-end tests
├── docs/                      # Comprehensive documentation
└── .github/                   # GitHub workflows and configuration
```

## Technology Stack

### Frontend (`apps/web-v2`)
- **Framework**: React 18 with TypeScript
- **State Management**: Zustand + React Query
- **Styling**: Tailwind CSS with custom design tokens
- **Build Tool**: Vite
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Biome (for formatting only)
- **Testing**: Vitest + React Testing Library

### Backend (`apps/api`)
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: AWS S3 with CloudFront CDN
- **Real-time**: Socket.IO for WebSocket communication
- **Authentication**: Custom JWT implementation
- **Monitoring**: OpenTelemetry integration
- **Linting**: ESLint

### Shared Libraries
- **`@vibesapp/shared`**: Common types, utilities, constants
- **`@vibesapp/contracts`**: API contract definitions for type safety
- **`@vibesapp/e2e-testing`**: Playwright testing infrastructure

## Development Guidelines

### Code Organization
1. **Frontend Components**: Place in `apps/web/src/components/` with proper folder structure
2. **API Endpoints**: Controllers in `apps/api/src/controllers/`, routes in `apps/api/src/routes/`
3. **Shared Types**: Add to `libs/shared/src/lib/types.ts`
4. **Utilities**: Frontend utils in `apps/web/src/utils/`, shared utils in `libs/shared/src/lib/utils.ts`

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Files**: camelCase for utilities, kebab-case for components
- **API Routes**: kebab-case with versioning (e.g., `/api/v1/user-profile`)
- **Database Models**: PascalCase (e.g., `User.js`, `Post.js`)

### Type Safety
- Use TypeScript interfaces from `@vibesapp/shared` for data models
- API contracts from `@vibesapp/contracts` ensure frontend/backend type alignment
- Import shared types: `import { IUserData, ApiResponse } from '@vibesapp/shared'`

### API Communication
- **Frontend**: Use ApiService class in `apps/web/src/services/apiService.ts`
- **Authentication**: JWT tokens stored in cookies, API key for internal requests
- **Error Handling**: Consistent error responses using `ApiResponse<T>` type
- **File Uploads**: S3 presigned URLs for direct client uploads

### Database Models (MongoDB)
- **User**: Profile data, preferences, location
- **Post**: Content, images, location, vibes (likes)
- **Message**: Direct messages and group chat
- **Activity**: User activity tracking and notifications
- **Conversation**: Direct message threads
- **GroupChat**: Group messaging functionality

### Key Features to Understand
1. **Vibes System**: Like/unlike functionality with polarity-based recommendations
2. **Location-Based Features**: Nearby users and posts using geolocation
3. **Real-time Messaging**: Socket.IO for instant communication
4. **Image Handling**: S3 upload with compression and CDN delivery
5. **MBTI Integration**: Personality-based user matching and content curation

### Development Commands

```bash
# Development
npm run dev                    # Start both frontend and backend
npm run start:web-v2          # Frontend only (localhost:5173)
npm run start:api             # Backend only (localhost:5001)

# Building
npm run build                 # Build all applications
npm run build:web-v2         # Build frontend only
npm run build:api            # Build backend only

# Testing
npm run test                  # Run all tests
npm run test:e2e             # Run Playwright tests

# Linting & Formatting
npm run lint                  # Lint all code
npm run lint:fix             # Fix linting issues
npm run format               # Format code with Biome
npm run format:check         # Check formatting without changes

# Important: apps/web-v2 uses ESLint for linting + Biome for formatting
# apps/api uses ESLint only

# NX Commands
nx graph                      # View dependency graph
nx affected:build            # Build only affected projects
nx affected:test             # Test only affected projects
```

### Environment Variables
- **App-Specific .env**: Each app has its own `.env` file in `apps/api/.env` and `apps/web-v2/.env`
- **Frontend vars**: Prefixed with `VITE_` for Vite build system
- **Backend vars**: Direct environment variable access (no prefix required)

### Deployment Architecture
- **Frontend**: Heroku static hosting with build pipeline
- **Backend**: Heroku dyno with MongoDB Atlas
- **Database**: MongoDB Atlas with connection pooling
- **Files**: AWS S3 with CloudFront CDN
- **CI/CD**: GitHub Actions with automated testing and deployment

### Common Tasks for Copilot

#### Adding a New Feature
1. Create shared types in `libs/shared/src/lib/types.ts`
2. Add API contracts in `libs/contracts/src/lib/api-contracts.ts`
3. Implement backend route in `apps/api/src/routes/`
4. Add controller logic in `apps/api/src/controllers/`
5. Create frontend service methods in `apps/web/src/services/`
6. Build React components in `apps/web/src/components/`
7. Add tests for both frontend and backend

#### Database Operations
- Models are in `apps/api/src/models/`
- Use Mongoose for all database operations
- Follow existing patterns for schema definition
- Include proper indexing for performance

#### API Development
- RESTful endpoints with consistent response format
- Authentication middleware for protected routes
- Input validation using existing patterns
- Error handling with proper HTTP status codes

#### Frontend Development
- React functional components with hooks
- TypeScript for all new code
- Custom hooks for reusable logic
- CSS modules or styled-components for styling
- React Query for API state management

### Testing Strategy
- **Unit Tests**: Jest for both frontend and backend
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user workflow testing
- **Component Tests**: React Testing Library

### Performance Considerations
- **Image Optimization**: Automatic compression before S3 upload
- **Lazy Loading**: React.lazy for component code splitting
- **API Optimization**: Pagination for large datasets
- **Caching**: React Query for client-side caching
- **Database**: Proper indexing and query optimization

### Security Best Practices
- JWT token authentication with secure cookie storage
- API key authentication for internal service communication
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Environment variable protection for sensitive data

### Agent Decision-Making & Communication
**Critical behavior:** When a requested change would require architectural adjustments or break existing patterns, explicitly **advise against it and explain why** rather than implementing a workaround that compromises design integrity. Examples:
- ConversationView uses full-screen fixed layouts—adding generic padding breaks the design, so propose the correct approach instead
- Recognize when micro-changes aren't appropriate for a feature and communicate the reasoning
- This restraint and clarity is more valuable than blind execution

This monorepo structure enables efficient development with shared code, consistent tooling, and streamlined deployment. When making changes, consider the impact across both applications and utilize the shared libraries for maximum code reuse.