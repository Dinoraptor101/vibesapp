# Version Management

This document describes how to manage versions in the VibesApp monorepo.

## Automated Version Updates

The monorepo includes an automated version management script that updates versions across all packages and files consistently.

### Usage

```bash
# Patch version (0.20.1 → 0.20.2)
npm run version:patch

# Minor version (0.20.1 → 0.21.0)  
npm run version:minor

# Major version (0.20.1 → 1.0.0)
npm run version:major
```

### What Gets Updated

The script automatically updates versions in:

#### Package Files
- `package.json` (root)
- `apps/web/package.json`
- `apps/api/package.json`
- `libs/shared/package.json`
- `libs/contracts/package.json`
- `libs/e2e-testing/package.json`

#### Code Files
- `apps/web/src/App.tsx` - VERSION constant
- `libs/shared/src/lib/constants.ts` - VERSION property
- `README.md` - Version badge

#### Generated Files
- `package-lock.json` - Regenerated with new version

### Git Integration

The script automatically:
1. **Stages all changes** (`git add .`)
2. **Commits changes** with descriptive message
3. **Creates git tag** (e.g., `v0.20.1`)

To push the changes:
```bash
git push && git push origin v<NEW_VERSION>
```

### Manual Override

If you need to skip the automated script and update versions manually, you can do so, but ensure all locations are updated consistently.

### Files Updated by Script

| File | Pattern | Purpose |
|------|---------|---------|
| `package.json` files | `"version": "..."` | NPM package version |
| `App.tsx` | `const VERSION = '...'` | Frontend version display |
| `constants.ts` | `VERSION: '...'` | Shared version constant |
| `README.md` | `version-...-blue` | Documentation badge |

### Troubleshooting

If the script fails:
1. **Check file permissions** - Ensure all files are writable
2. **Verify git status** - Ensure working directory is clean
3. **Check Node.js version** - Requires Node.js 20+
4. **Review error messages** - The script provides detailed error output

### Version Strategy

- **Patch** (x.y.Z) - Bug fixes, small improvements
- **Minor** (x.Y.0) - New features, backward compatible changes  
- **Major** (X.0.0) - Breaking changes, architecture updates

The monorepo migration to v0.20.0 represents a significant minor release with new architecture and tooling.