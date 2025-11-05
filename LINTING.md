# VibesApp Linting & Formatting Configuration

This monorepo uses different linting strategies for different applications:

## ⚠️ Important: Project-Specific Tools

### Frontend V1 (`apps/web`) - Biome Only
- **Location**: `apps/web/biome.json`
- **Language**: TypeScript/JavaScript/CSS
- **Tool**: **Biome** (both linting AND formatting)
- **Run with**: `npm run lint` (from apps/web directory)
- **Format with**: `npm run format` (from apps/web directory)
- **⚠️ DO NOT**: Add ESLint config to this project - it uses Biome exclusively

### Frontend V2 (`apps/web-v2`) - ESLint + Biome
- **Location**: `apps/web-v2/eslint.config.js` and `apps/web-v2/biome.json`
- **Language**: TypeScript/JavaScript/CSS
- **Linting Tool**: **ESLint** + TypeScript ESLint
- **Formatting Tool**: **Biome** (formatting only)
- **Run lint**: `npm run lint` (from apps/web-v2 directory)
- **Note**: Uses ESLint for linting, Biome for formatting

### Backend (`apps/api`) - ESLint
- **Location**: `apps/api/eslint.config.mjs`
- **Language**: JavaScript
- **Tool**: ESLint
- **Run with**: `npm run lint` (from apps/api directory)

## Shared Libraries (TypeScript)
- **Location**: Individual library configurations
- **Language**: TypeScript
- **Tool**: Biome (formatting)

## Why Different Tools?

### Biome for apps/web
- **Fast**: Rust-based, extremely fast performance
- **All-in-one**: Handles both linting and formatting
- **CSS Support**: Can lint and format CSS, including Tailwind directives
- **No ESLint**: Completely replaces ESLint + Prettier for this project

### ESLint + Biome for apps/web-v2
- **ESLint**: For comprehensive React-specific linting (react-refresh, react-hooks, etc.)
- **Biome**: For fast formatting only
- **Separation**: Linting and formatting are separate concerns

### ESLint for apps/api
- **Node.js Focused**: ESLint has better Node.js specific rules
- **Mature Ecosystem**: Extensive plugin support for backend development

## Configuration Files

### Biome Configuration (`biome.json`)
```json
{
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true  // Respects .gitignore (important for dist/)
  },
  "linter": {
    "enabled": true,
    "rules": { ... }
  },
  "formatter": {
    "enabled": true
  }
}
```

### Important: VCS Integration
Biome configurations **must** include VCS settings to respect `.gitignore`:
- Without it, Biome will check `dist/` and `node_modules/`
- This causes false errors on built files

## Scripts
- **Root Level**: `npm run lint` - Lints all projects
- **Format All**: `npm run format` - Formats shared libraries with Biome
- **Lint Web**: `npm run lint:web` - Frontend V1 only (Biome)
- **Lint Web V2**: `cd apps/web-v2 && npm run lint` - Frontend V2 (ESLint)
- **Lint API**: `npm run lint:api` - Backend only (ESLint)

## Common Pitfalls

### ❌ DON'T: Add ESLint to apps/web
```bash
# This is WRONG - apps/web uses Biome, not ESLint
cd apps/web
npm install eslint  # ❌ Don't do this!
```

### ✅ DO: Use Biome for apps/web
```bash
# Correct approach
cd apps/web
npm run lint        # Uses Biome
npm run format      # Uses Biome
```

### ❌ DON'T: Forget VCS config in biome.json
```json
{
  "files": {
    "ignore": ["dist"]  // ❌ Wrong - doesn't work
  }
}
```

### ✅ DO: Enable VCS integration
```json
{
  "vcs": {
    "enabled": true,
    "useIgnoreFile": true  // ✅ Correct - respects .gitignore
  }
}
```