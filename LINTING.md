# VibesApp Linting Configuration

This monorepo uses different linting strategies for different languages:

## Frontend (TypeScript) - Biome
- **Location**: `apps/web/biome.json`
- **Language**: TypeScript/JavaScript
- **Tool**: Biome
- **Run with**: `npm run lint` (from apps/web directory)

## Backend (JavaScript) - ESLint
- **Location**: `apps/api/eslint.config.mjs`
- **Language**: JavaScript
- **Tool**: ESLint
- **Run with**: `npm run lint` (from apps/api directory)

## Shared Libraries (TypeScript)
- **Location**: Individual library configurations
- **Language**: TypeScript
- **Tool**: Will use Biome when configured

## Future Unification
We plan to unify the linting strategy in a future iteration. For now, maintaining app-specific configurations ensures stability during the monorepo migration.

## Scripts
- **Lint All**: `npm run lint:all` (runs all project linters)
- **Lint Web**: `npm run lint:web` (frontend only)
- **Lint API**: `npm run lint:api` (backend only)