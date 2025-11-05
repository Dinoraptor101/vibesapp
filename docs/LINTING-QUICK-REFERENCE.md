# Linting Quick Reference - VibesApp Monorepo

**Last Updated:** November 4, 2025

## 🎯 Quick Decision Tree

**Which project am I working on?**

### 📁 apps/web (Frontend V1 - Original)
```bash
cd apps/web
npm run lint        # ✅ Biome (linting + formatting)
npm run format      # ✅ Biome (formatting only)
```
- **Tools:** Biome ONLY
- **Config:** `biome.json`
- **Rules:** ❌ NO ESLint - Biome handles everything

### 📁 apps/web-v2 (Frontend V2 - Rebuild)
```bash
cd apps/web-v2
npm run lint        # ✅ ESLint (linting)
npx biome format .  # ✅ Biome (formatting)
```
- **Tools:** ESLint (linting) + Biome (formatting)
- **Config:** `eslint.config.js` + `biome.json`
- **Rules:** Both tools work together

### 📁 apps/api (Backend)
```bash
cd apps/api
npm run lint        # ✅ ESLint
```
- **Tools:** ESLint ONLY
- **Config:** `eslint.config.mjs`
- **Rules:** Node.js focused

---

## 🚫 Common Mistakes to Avoid

### ❌ DON'T: Install ESLint in apps/web
```bash
cd apps/web
npm install eslint                 # ❌ WRONG!
npm install @typescript-eslint/*   # ❌ WRONG!
```
**Why?** apps/web uses Biome exclusively. Adding ESLint will cause conflicts.

### ❌ DON'T: Forget VCS config in biome.json
```json
{
  "files": {
    "ignore": ["dist", "node_modules"]  // ❌ Doesn't work!
  }
}
```
**Fix:**
```json
{
  "vcs": {
    "enabled": true,
    "useIgnoreFile": true  // ✅ Respects .gitignore
  }
}
```

### ❌ DON'T: Use Biome for linting in apps/web-v2
```bash
cd apps/web-v2
npx biome check .  # ❌ WRONG for linting!
```
**Why?** apps/web-v2 uses ESLint for linting. Use `npm run lint` instead.

---

## ✅ Correct Usage Examples

### Linting Everything (Root Level)
```bash
# From monorepo root
npm run lint        # Runs lint on web + api
npm run lint:web    # apps/web only (Biome)
npm run lint:api    # apps/api only (ESLint)
```

### Formatting Everything (Root Level)
```bash
# From monorepo root
npm run format      # Formats shared libs with Biome
```

### Per-Project Commands

#### apps/web (Biome Only)
```bash
cd apps/web

# Lint and format together
npm run lint

# Format only
npm run format

# Check without fixing
npm run format:check
```

#### apps/web-v2 (ESLint + Biome)
```bash
cd apps/web-v2

# Lint (ESLint)
npm run lint
npm run lint -- --fix  # Auto-fix linting issues

# Format (Biome)
npx biome format --write .
npx biome format .  # Check only

# Both
npm run lint && npx biome format --write .
```

#### apps/api (ESLint Only)
```bash
cd apps/api

# Lint
npm run lint
npm run lint -- --fix  # Auto-fix
```

---

## 🔧 Configuration Files

### apps/web/biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.2/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "files": {
    "ignoreUnknown": true
  },
  "css": {
    "parser": {
      "cssModules": false,
      "allowWrongLineComments": true,
      "tailwindDirectives": true  // ⚠️ Important for Tailwind!
    },
    "linter": {
      "enabled": false  // CSS linting disabled
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noDocumentCookie": "off"  // We use document.cookie
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

### apps/web-v2/biome.json (Formatting Only)
```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.2/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true,
    "defaultBranch": "main"
  },
  "linter": {
    "enabled": false  // ⚠️ Linting handled by ESLint
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

### apps/web-v2/eslint.config.js
```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist'] },  // ⚠️ Important!
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
);
```

---

## 📊 Tool Comparison

| Feature | Biome | ESLint |
|---------|-------|--------|
| **Speed** | ⚡️ Very Fast (Rust) | 🐢 Slower (JavaScript) |
| **Linting** | ✅ Yes | ✅ Yes |
| **Formatting** | ✅ Yes | ❌ No (needs Prettier) |
| **CSS Support** | ✅ Yes (incl. Tailwind) | ❌ No |
| **React Hooks** | ⚠️ Basic | ✅ Comprehensive |
| **Plugin Ecosystem** | ❌ Limited | ✅ Extensive |
| **Configuration** | Simple (1 file) | Complex (multiple files) |

---

## 🎓 Why This Setup?

### apps/web → Biome Only
- **Simple:** One tool, one config file
- **Fast:** Rust-based performance
- **CSS:** Can handle Tailwind directives
- **Stable:** No migration mid-project

### apps/web-v2 → ESLint + Biome
- **Best of Both:** ESLint for linting, Biome for formatting
- **React Refresh:** ESLint has better Fast Refresh rules
- **Type Safety:** TypeScript ESLint integration
- **Modern:** Separate concerns (linting vs formatting)

### apps/api → ESLint Only
- **Node.js Focus:** ESLint has better Node.js rules
- **Mature:** Extensive plugin ecosystem
- **No Formatting:** Formatting less critical for backend

---

## 🆘 Troubleshooting

### "Biome is checking dist/ folder"
**Problem:** Linting errors in built files

**Solution:**
```json
// biome.json
{
  "vcs": {
    "enabled": true,
    "useIgnoreFile": true  // Add this!
  }
}
```

### "ESLint not working in apps/web-v2"
**Problem:** No lint output

**Solution:**
```bash
cd apps/web-v2
npm install  # Ensure deps installed
npm run lint -- --debug  # Check config
```

### "Fast Refresh warnings"
**Problem:** `react-refresh/only-export-components` error

**Solution:** Move non-component exports to separate files:
```typescript
// ❌ Bad - context and hook in same file
export function MyProvider() { ... }
export function useMyContext() { ... }

// ✅ Good - separate files
// context.tsx - only exports provider
// useMyContext.ts - only exports hook
```

---

## 📚 References

- **Biome Docs:** https://biomejs.dev/
- **ESLint Docs:** https://eslint.org/
- **Full Config:** `/Volumes/WD SSD/Workspace/vibesapp/LINTING.md`
- **Copilot Instructions:** `/.github/copilot-instructions.md`

---

**Remember:** When in doubt, check which project you're in and use the appropriate tool! 🎯
