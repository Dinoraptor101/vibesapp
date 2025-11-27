# QA Deployment - Copilot Prompt

> Machine-readable instructions for GitHub Copilot to execute the QA deployment code changes.

---

## Context

```yaml
project: vibesapp
environment: QA
branch: rebuilding-front-end
heroku_apps:
  frontend: logosil-frontend
  backend: logosil-backend
target_urls:
  frontend: https://qa.vibesapp.net (or Heroku default URL)
  backend: https://api-qa.vibesapp.net (or Heroku default URL)
```

---

## Task 1: Fix API Procfile

**File**: `apps/api/Procfile`

**Current Content**:
```
web: node server/index.js
```

**Required Content**:
```
web: node src/index.js
```

**Validation**:
- Entry point exists at `apps/api/src/index.js` ✅ (verified)

---

## Task 2: Create Frontend Static Config

**File**: `apps/web-v2/static.json`

**Content**:
```json
{
  "root": "dist",
  "clean_urls": true,
  "routes": {
    "/**": "index.html"
  },
  "headers": {
    "/**": {
      "Cache-Control": "public, max-age=0, must-revalidate"
    },
    "/assets/**": {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  }
}
```

**Purpose**:
- `root: "dist"` - Serve from Vite build output directory
- `routes` - SPA fallback routing (all paths serve index.html)
- `headers` - Cache control for static assets

---

## Task 3: Create Frontend Procfile (Optional)

**File**: `apps/web-v2/Procfile`

**Content**:
```
web: npx serve dist -s -l $PORT
```

**Purpose**:
- Alternative to static buildpack
- Uses `serve` package for static file serving
- `-s` flag enables SPA mode (rewrites to index.html)
- `-l $PORT` listens on Heroku-assigned port

**Note**: Only needed if not using `heroku-buildpack-static`. Human should decide which approach.

---

## Task 4: Create Phase 3.4 Migration Script

**File**: `apps/api/scripts/migratePhase3_4.js`

**Content**:
```javascript
/**
 * Phase 3.4 Migration Script
 * 
 * Adds reports[] array to Posts and strikes[] array to Users.
 * Safe to run multiple times (idempotent).
 * 
 * Run with: node scripts/migratePhase3_4.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migratePhase3_4() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully\n');

    const db = mongoose.connection.db;

    // Migrate Posts collection
    console.log('Migrating Posts collection...');
    const postsResult = await db.collection('posts').updateMany(
      { reports: { $exists: false } },
      {
        $set: {
          reports: [],
          hiddenAt: null,
          hiddenBy: null
        }
      }
    );
    console.log(`  Posts updated: ${postsResult.modifiedCount}`);
    console.log(`  Posts matched: ${postsResult.matchedCount}`);

    // Ensure isDeleted field exists
    const isDeletedResult = await db.collection('posts').updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );
    console.log(`  Posts with isDeleted added: ${isDeletedResult.modifiedCount}`);

    // Migrate Users collection
    console.log('\nMigrating Users collection...');
    const usersResult = await db.collection('users').updateMany(
      { strikes: { $exists: false } },
      { $set: { strikes: [] } }
    );
    console.log(`  Users updated: ${usersResult.modifiedCount}`);
    console.log(`  Users matched: ${usersResult.matchedCount}`);

    // Ensure isBanned field exists
    const isBannedResult = await db.collection('users').updateMany(
      { isBanned: { $exists: false } },
      { $set: { isBanned: false, bannedAt: null } }
    );
    console.log(`  Users with isBanned added: ${isBannedResult.modifiedCount}`);

    console.log('\n✅ Phase 3.4 migration complete!');
    
    // Summary
    const totalPosts = await db.collection('posts').countDocuments();
    const totalUsers = await db.collection('users').countDocuments();
    const postsWithReports = await db.collection('posts').countDocuments({ reports: { $exists: true } });
    const usersWithStrikes = await db.collection('users').countDocuments({ strikes: { $exists: true } });
    
    console.log('\n📊 Summary:');
    console.log(`  Total Posts: ${totalPosts}`);
    console.log(`  Posts with reports field: ${postsWithReports}`);
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Users with strikes field: ${usersWithStrikes}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the migration
migratePhase3_4();
```

---

## Task 5: Add CORS Origin (Conditional)

**File**: `apps/api/src/index.js`

**Condition**: Only if using default Heroku URLs instead of custom domain.

**Current CORS** (already includes qa.vibesapp.net):
```javascript
corsOptions.origin = [
  'https://vibesapp.net',
  'https://api.vibesapp.net',
  'https://qa.vibesapp.net',      // ✅ Present
  'https://api-qa.vibesapp.net',  // ✅ Present
  'https://dinoraptor101.github.io',
];
```

**If Heroku default URL needed**, add:
```javascript
'https://logosil-frontend.herokuapp.com',
'https://logosil-frontend-xxxxxxxx.herokuapp.com', // Random suffix version
```

**Human Input Required**: Confirm if using custom domain or Heroku default URL.

---

## Task 6: Add serve Dependency (Conditional)

**File**: `apps/web-v2/package.json`

**Condition**: Only if using Procfile with `serve` instead of static buildpack.

**Change**: Add to devDependencies:
```json
"serve": "^14.2.0"
```

---

## Execution Order

```
1. Fix API Procfile                    [REQUIRED]
2. Create static.json                  [REQUIRED]
3. Create frontend Procfile            [OPTIONAL - human decides]
4. Create migratePhase3_4.js          [REQUIRED]
5. Update CORS origins                 [CONDITIONAL - if needed]
6. Add serve dependency                [CONDITIONAL - if using Procfile]
```

---

## Validation Commands

After code changes, human should verify:

```bash
# Verify API Procfile
cat apps/api/Procfile
# Expected: web: node src/index.js

# Verify static.json exists
cat apps/web-v2/static.json
# Expected: JSON with root, routes, headers

# Verify migration script
cat apps/api/scripts/migratePhase3_4.js
# Expected: Script with mongoose connection and updateMany calls

# Test build locally
cd apps/web-v2 && npm run build
# Expected: dist/ folder created

# Test API starts locally
cd apps/api && npm run dev
# Expected: Server starts on port 5001
```

---

## Files Summary

| File | Action | Status |
|------|--------|--------|
| `apps/api/Procfile` | MODIFY | 🔴 TODO |
| `apps/web-v2/static.json` | CREATE | 🔴 TODO |
| `apps/web-v2/Procfile` | CREATE (optional) | 🔴 TODO |
| `apps/api/scripts/migratePhase3_4.js` | CREATE | 🔴 TODO |
| `apps/api/src/index.js` | MODIFY (conditional) | ⚪ N/A (already configured) |
| `apps/web-v2/package.json` | MODIFY (conditional) | ⚪ N/A |

---

## Trigger Phrase

To execute these changes, use the prompt:

> "Implement the QA deployment code changes from the deployment prompt file"

Or more specifically:

> "Execute tasks 1-4 from QA-DEPLOYMENT-PROMPT.md: fix API Procfile, create static.json, create frontend Procfile, and create migratePhase3_4.js"
