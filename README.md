# VibesApp Monorepo 🚀

[![Version](https://img.shields.io/badge/version-0.20.1-blue.svg)](https://github.com/Dinoraptor101/vibesapp)
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

# Start development servers
npm run dev
```

This starts both the frontend (localhost:3000) and backend (localhost:5001) in development mode.

## 📦 Applications

### Web App (`apps/web`)
- **Technology**: React 18 + TypeScript
- **Styling**: Custom CSS with theme system
- **State Management**: React Query + Context API
- **Build Tool**: Webpack with custom configuration
- **Linting**: Biome
- **Testing**: Jest + React Testing Library

```bash
# Development
npm run start:web

# Build for production
npm run build:web

# Run tests
npm run test:web
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

The monorepo uses a unified environment system with sections for each app:

```bash
# Root .env contains all configuration
# Sections are clearly marked for each application
cp .env.example .env
```

### Code Quality & Linting

⚠️ **Important:** Different projects use different tools!

- **apps/web**: Biome ONLY (linting + formatting)
- **apps/web-v2**: ESLint (linting) + Biome (formatting)
- **apps/api**: ESLint (linting)

📖 **Full Documentation:** See [LINTING.md](./LINTING.md) and [docs/LINTING-QUICK-REFERENCE.md](./docs/LINTING-QUICK-REFERENCE.md)
- **NX**: Intelligent task caching and dependency management

## 🚢 Deployment

### Frontend (Heroku)
The React application is deployed to Heroku with static file serving.

```bash
nx deploy web
```

### Backend (Heroku)
The Node.js API is deployed as a separate Heroku dyno.

```bash
nx deploy api
```

### Database
MongoDB Atlas provides the production database with connection pooling and monitoring.

## 📖 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- [Project Overview](docs/01-project-overview.md)
- [Vibes System](docs/02-vibes-system.md)
- [Location Features](docs/03-location-features.md)
- [Frontend Architecture](docs/04-frontend-architecture.md)
- [Backend Architecture](docs/05-backend-architecture.md)
- [API Integration](docs/06-api-integration.md)
- [Development Workflow](docs/07-development-workflow.md)
- [Component Guide](docs/08-component-guide.md)
- [Testing Strategy](docs/09-testing-strategy.md)
- [User Journey](docs/10-user-journey.md)
- [Feature Documentation](docs/11-feature-documentation.md)

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
