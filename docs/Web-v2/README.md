# Web-v2 Documentation

This directory contains comprehensive documentation for the VibesApp Web-v2 frontend rebuild, completed in November 2025.

## Overview

Web-v2 is a complete rewrite of the VibesApp frontend using modern technologies and best practices. The rebuild focused on performance, accessibility, and maintainability while implementing all planned features.

## Documentation Structure

### Core Documentation
- **[01-current-architecture.md](./01-current-architecture.md)** - Complete technical architecture and technology stack
- **[02-implemented-features.md](./02-implemented-features.md)** - All features implemented in the rebuild
- **[03-development-timeline.md](./03-development-timeline.md)** - Phase-by-phase development history
- **[04-design-system.md](./04-design-system.md)** - UI patterns, components, and design language
- **[05-testing-strategy.md](./05-testing-strategy.md)** - Testing approach and automation plans
- **[06-ux-design.md](./06-ux-design.md)** - UX design principles and ZEN philosophy
- **[07-content-design-standards.md](./07-content-design-standards.md)** - Content guidelines and voice/tone

### Feature Design Specifications
- **[VIBES-GROWTH-SYSTEM.md](./VIBES-GROWTH-SYSTEM.md)** - Complete design specification for plant-based karma visualization in Settings ("Your Vibe" tab). Includes 5-stage growth progression, number-free design principles, animation specs, content guidelines, and implementation phases. **Status**: Approved for implementation.

## Key Achievements

- **Performance**: Sub-second HMR, <5s builds, <500KB bundle
- **Accessibility**: WCAG AA compliant, screen reader tested
- **UX Philosophy**: ZEN principles guiding every interaction
- **Architecture**: Feature-based organization, TypeScript throughout
- **Features**: Complete social network with posts, messaging, profiles, admin
- **Design**: Responsive grid layout, multi-theme support, touch-optimized

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **State**: React Query + Zustand
- **UI**: Radix UI, Lucide icons
- **Build**: ESLint + Biome, Playwright testing
- **Deployment**: Vercel (frontend) + Heroku (backend)

## Live Environments

| Environment | Frontend | Backend |
|-------------|----------|--------|
| **QA** | https://qa.vibesapp.net (Vercel) | https://logosil-backend-a8355253628c.herokuapp.com (Heroku) |
| **Production** | https://vibesapp.net | https://api.vibesapp.net |

## Development Status

✅ **Complete** - All features implemented
✅ **Deployed** - QA environment live on Vercel + Heroku
⏳ **Pending** - Production deployment

## Archived Documentation

Historical planning and implementation documents are archived in:
- **[REBUILD/archive/](./REBUILD/archive/)** - Original planning documents
- **[development-log/](./development-log/)** - Phase implementation summaries

---

**Last Updated**: November 27, 2025
**Status**: QA Deployed