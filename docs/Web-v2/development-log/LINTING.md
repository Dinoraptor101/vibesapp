# VibesApp Linting & Formatting Configuration

This monorepo uses different linting strategies for different applications:

## ⚠️ Important: Project-Specific Tools

### Frontend (`apps/web-v2`) - ESLint + Biome
- **Location**: `apps/web-v2/eslint.config.js` and `apps/web-v2/biome.json`
- **Language**: TypeScript/JavaScript/CSS
- **Linting Tool**: **ESLint** + TypeScript ESLint
- **Formatting Tool**: **Biome** (formatting only)
- **Run lint**: `npm run lint` (from apps/web-v2 directory)
- **Run format**: `npm run format` (from apps/web-v2 directory)

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

### ❌ DON'T: Mix linting and formatting tools incorrectly
```bash
# Don't use Biome for linting in web-v2
cd apps/web-v2
biome lint src/  # ❌ Use ESLint instead
```

### ✅ DO: Use the right tool for each job
```bash
# Correct approach
cd apps/web-v2
npm run lint        # Uses ESLint for linting
npm run format      # Uses Biome for formatting
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