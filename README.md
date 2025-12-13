# VibesApp Monorepo 🚀

[![Version](https://img.shields.io/badge/version-0.22.0-blue.svg)](https://github.com/Dinoraptor101/vibesapp)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> A picture-based social network built with React and Node.js in a modern NX monorepo architecture.

## 🏗️ Architecture Overview

This monorepo contains the complete VibesApp ecosystem using NX and modern tooling:

```
vibesapp/
├── apps/
│   ├── web/                    # React frontend application
│   └── api/                    # Node.js backend server
├── libs/
│   ├── shared/                 # Shared types, utilities, and constants
│   ├── contracts/              # API contract definitions
│   └── e2e-testing/           # End-to-end testing with Playwright
├── docs/                      # Comprehensive documentation
└── tools/                     # Build and deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (18+ recommended)
- npm 8+
- MongoDB (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/Dinoraptor101/vibesapp.git
cd vibesapp

# Install dependencies
npm install

# Setup environment variables
# Create .env files in each app directory with required values
# See Environment Configuration section below for required variables

# Start development servers
npm run dev
```

This starts both the frontend (localhost:5173) and backend (localhost:5001) in development mode.

## 📦 Applications

### Web App (`apps/web-v2`)
- **Technology**: React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS 3.4 with custom design tokens and theme system
- **State Management**: Zustand + React Query 5
- **UI Library**: Radix UI primitives, Lucide React icons
- **Build Tool**: Vite
- **Linting**: ESLint + TypeScript ESLint
- **Formatting**: Biome
- **Testing**: Vitest + React Testing Library + Playwright
- **Architecture**: Feature-based organization with 7 modules (auth, posts, messaging, profile, settings, activity, admin)

**Key Features**: Auto-save forms, optimistic updates, location-based feeds, PWA support, offline graceful degradation

📖 [Detailed Architecture & Features](docs/Web-v2/01-current-architecture.md) | [UX Design Philosophy](docs/Web-v2/06-ux-design.md)

```bash
# Development
npm run start:web-v2

# Build for production
npm run build:web-v2

# Run tests
npm run test:web-v2
```

### API Server (`apps/api`)
- **Technology**: Node.js + Express
- **Database**: MongoDB with Mongoose
- **File Storage**: AWS S3
- **Real-time**: Socket.IO
- **Linting**: ESLint
- **Monitoring**: OpenTelemetry

```bash
# Development
npm run start:api

# Build for production
npm run build:api

# Run in production
npm run start:api:prod
```

## 📚 Shared Libraries

### `@vibesapp/shared`
Common types, utilities, and constants used across the entire application.

```typescript
import { IUserData, formatRelativeTime, API_ENDPOINTS } from '@vibesapp/shared';
```

### `@vibesapp/contracts`
API contract definitions for type-safe communication between frontend and backend.

```typescript
import { UserEndpoints, AuthEndpoints } from '@vibesapp/contracts';
```

### `@vibesapp/e2e-testing`
End-to-end testing suite using Playwright for comprehensive application testing.

📖 [E2E Testing Documentation](libs/e2e-testing/README.md)

## 🔧 Development with NX

### Available Scripts

```bash
# Development
npm run dev                    # Start both frontend and backend
nx serve web                   # Start frontend only
nx serve api                   # Start backend only

# Building
nx build web                   # Build frontend
nx build api                   # Build backend
nx build --all                 # Build all projects

# Testing
nx test web                    # Run frontend tests
nx test api                    # Run backend tests
nx e2e e2e-testing            # Run end-to-end tests

# Linting
nx lint web                    # Lint frontend
nx lint api                    # Lint backend
nx affected:lint               # Lint affected projects only

# Dependency Graph
nx graph                       # View project dependency graph
```

### Environment Configuration

The monorepo uses app-specific environment files:

**Backend** (`apps/api/.env`):
```bash
NODE_ENV=development
PORT=5001
MONGO_URI=your_mongodb_connection_string
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
API_KEY=your_api_key
RECAPTCHA_SECRET=your_recaptcha_secret
ENABLE_RECAPTCHA=false
```

**Frontend** (`apps/web-v2/.env`):
```bash
VITE_API_URL=http://localhost:5001
VITE_BACKEND_API_KEY=your_api_key
VITE_CDN_URL=your_cloudfront_url
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_USE_SSE=false
VITE_DEBUG=true
```

### Code Quality & Linting

⚠️ **Important:** Different projects use different tools!

- **apps/web-v2**: ESLint (linting) + Biome (formatting)
- **apps/api**: ESLint (linting)

📖 **Full Documentation:** See [LINTING.md](./LINTING.md) and [docs/LINTING-QUICK-REFERENCE.md](./docs/LINTING-QUICK-REFERENCE.md)
- **NX**: Intelligent task caching and dependency management

## 🚢 Deployment

⚠️ **IMPORTANT**: Before deploying Web V2 to production, you **MUST** run the database migration script! 

📖 **See [Production Deployment Guide](docs/13-production-deployment.md) for complete instructions.**

### Frontend (Heroku)
The React application is deployed to Heroku with static file serving.

```bash
npm run deploy:web-v2
```

### Backend (Heroku)
The Node.js API is deployed as a separate Heroku dyno.

```bash
nx deploy api
```

### Database Migrations
```bash
# Run BEFORE deploying Web V2 to production
cd apps/api
node scripts/addUserFieldsToPosts.js
```

### Database
MongoDB Atlas provides the production database with connection pooling and monitoring.

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

### Web V2 Project Documentation
Complete technical and design documentation for the current React frontend rebuild:

- **[Web V2 Documentation Index](docs/Web-v2/README.md)** - Start here
  - [Current Architecture](docs/Web-v2/01-current-architecture.md) - Tech stack, patterns, performance
  - [Implemented Features](docs/Web-v2/02-implemented-features.md) - All 25+ features documented
  - [Development Timeline](docs/Web-v2/03-development-timeline.md) - 8-phase rebuild history
  - [Design System](docs/Web-v2/04-design-system.md) - Colors, typography, components
  - [Testing Strategy](docs/Web-v2/05-testing-strategy.md) - Unit, component, and E2E testing
  - [UX Design & ZEN Principles](docs/Web-v2/06-ux-design.md) - Design philosophy and patterns

### Legacy Documentation (Web V1)
Original documentation preserved for reference:
- [Project Overview](docs/Web-V1/01-project-overview.md)
- [Vibes System](docs/Web-V1/02-vibes-system.md)
- [Location Features](docs/Web-V1/03-location-features.md)
- [Frontend Architecture](docs/Web-V1/04-frontend-architecture.md)
- [Backend Architecture](docs/Web-V1/05-backend-architecture.md)
- [API Integration](docs/Web-V1/06-api-integration.md)
- [Development Workflow](docs/Web-V1/07-development-workflow.md)
- [Component Guide](docs/Web-V1/08-component-guide.md)
- [Testing Strategy](docs/Web-V1/09-testing-strategy.md)
- [User Journey](docs/Web-V1/10-user-journey.md)
- [Feature Documentation](docs/Web-V1/11-feature-documentation.md)
- [ESLint Coding Standards](docs/Web-V1/12-eslint-coding-standards.md)

### Configuration & Tools
- [Code Quality & Linting](./LINTING.md)
- [**Production Deployment**](docs/Web-v2/) - See Web V2 documentation ⚠️ **Critical for V2 Release**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript for new frontend code
- Follow the existing code organization patterns
- Write tests for new features
- Update documentation as needed

## 🎯 NX Benefits in This Monorepo

- **Intelligent Task Running**: Only rebuild what's affected by changes
- **Dependency Graph**: Visual representation of project relationships
- **Code Sharing**: Seamless sharing between web and api applications
- **Consistent Tooling**: Unified development experience across all projects
- **Scalable**: Easy to add new applications and libraries

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Roadmap

- [ ] Migrate backend to TypeScript
- [ ] Implement GraphQL API
- [ ] Add real-time notifications
- [ ] Enhance mobile responsiveness
- [ ] Implement PWA features
- [ ] Add comprehensive test coverage

---

**Made with ❤️ by the VibesApp Team | Powered by NX**

# Trigger deploy
