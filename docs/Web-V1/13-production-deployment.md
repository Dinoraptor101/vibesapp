# Production Deployment Guide

This document outlines the critical steps for deploying Web V2 to production and replacing Web V1.

## Pre-Deployment Checklist

### 1. Database Migrations

Before deploying Web V2 to production, you **MUST** run the following migration scripts to ensure data compatibility:

#### Migration 1: Add User Fields to Posts

**Purpose**: Adds `profilePictureUrl` and `mbtiPersonality` to all existing posts so that user avatars display correctly in the new frontend.

**Script**: `apps/api/scripts/addUserFieldsToPosts.js`

**When to run**: Before switching frontend from V1 to V2

**How to run**:
```bash
cd apps/api
node scripts/addUserFieldsToPosts.js
```

**What it does**:
- Scans all posts (including comments) in the database
- Looks up current user data for each post author
- Updates post.user.profilePictureUrl with user's current profile picture
- Updates post.user.mbtiPersonality with user's current MBTI type
- Skips posts that already have this data
- Reports errors for posts where the user no longer exists

**Expected output**:
```
Connecting to MongoDB...
Connected successfully
Found XXX posts to check
⚠️  User not found for post [ID] (userId: [userId])  // For deleted users
✅ Migration complete!
   Updated: XX posts
   Skipped: XX posts (already have data)
   Errors:  XX posts
```

**Safety**: 
- ✅ Idempotent - Safe to run multiple times
- ✅ Non-destructive - Only adds missing fields
- ✅ Read-only on User collection
- ⚠️  Will show warnings for deleted user accounts (expected)

---

## Deployment Steps

### Step 1: Backend Schema Updates

The backend schema changes are already in place (as of this migration):
- ✅ Post model includes `profilePictureUrl` and `mbtiPersonality` in UserSubSchema
- ✅ Post creation controller includes these fields
- ✅ Comment creation controller includes these fields

### Step 2: Run Database Migrations

**On Production Server**:
```bash
# SSH into production server or use Heroku CLI
heroku run bash --app your-app-name

# Run migration
cd apps/api
node scripts/addUserFieldsToPosts.js
```

**Verify Results**:
- Check that "Updated: X posts" count is reasonable
- Errors for deleted users are expected and safe to ignore
- Verify a sample post has `profilePictureUrl` in database

### Step 3: Deploy Backend

```bash
# Ensure backend is deployed with latest code
git push heroku main:master

# Or if using separate backend deployment
cd apps/api
git push heroku-api main:master
```

### Step 4: Deploy Frontend V2

```bash
# Build Web V2
cd apps/web-v2
npm run build

# Deploy to Heroku or hosting platform
git subtree push --prefix apps/web-v2/dist heroku-frontend main:master
```

### Step 5: Verification

After deployment, verify:
1. ✅ User avatars display in posts (not just initials)
2. ✅ MBTI badges appear on user cards
3. ✅ New posts include profile pictures
4. ✅ Comments include profile pictures
5. ✅ Account settings avatar upload works

---

## Rollback Plan

If issues arise:

### Database Rollback
The migration is **non-destructive** and doesn't need rollback. The added fields won't affect Web V1.

### Frontend Rollback
Simply redeploy Web V1:
```bash
git checkout v1-branch
# Deploy v1 frontend
```

### Backend Rollback
Revert the Post model changes:
```bash
git revert [commit-hash]
git push heroku main:master
```

---

## Migration Script Reference

### addUserFieldsToPosts.js

**Location**: `apps/api/scripts/addUserFieldsToPosts.js`

**Environment Requirements**:
- Node.js 20+
- Access to MongoDB (MONGO_URI env variable)
- Read access to User collection
- Write access to Post collection

**Error Handling**:
- Continues processing even if individual posts fail
- Reports all errors at end
- Does not exit on user-not-found (expected for test/deleted accounts)

**Performance**:
- Processes posts sequentially (safe for production)
- Logs progress every 100 posts
- Average runtime: ~30 seconds for 1000 posts

---

## Post-Deployment Monitoring

### Key Metrics to Watch

1. **Avatar Display Rate**
   - Monitor: Are user avatars showing vs initials?
   - Expected: >95% of posts should show avatars

2. **API Response Times**
   - Monitor: Post fetch endpoints
   - Expected: No significant change (<5% increase)

3. **Error Rates**
   - Monitor: Frontend console errors
   - Watch for: Avatar loading failures, CDN issues

4. **User Reports**
   - Common issues: Missing avatars, profile picture not updating

---

## Troubleshooting

### Issue: Avatars Still Not Showing

**Diagnosis**:
```bash
# Check a sample post in database
db.posts.findOne({}, { 'user.profilePictureUrl': 1, 'user.userName': 1 })
```

**Solutions**:
1. Verify migration ran successfully
2. Check CDN_URL environment variable is set
3. Verify user actually has a profile picture
4. Check browser console for CORS/loading errors

### Issue: Migration Script Fails

**Error**: "MONGO_URI is undefined"
**Solution**: Ensure .env file is in root directory with MONGO_URI set

**Error**: "Cannot connect to MongoDB"
**Solution**: Check MongoDB Atlas whitelist, connection string, network access

### Issue: High Error Count in Migration

**Expected**: 10-20% errors from deleted test accounts is normal
**Concerning**: >50% errors suggests data integrity issue

---

## Additional Migrations

As more migrations are needed, add them to this document following this format:

### Migration Template

```markdown
#### Migration N: [Name]

**Purpose**: [What it does]
**Script**: `path/to/script.js`
**When to run**: [Timing]
**How to run**: [Commands]
**Safety**: [Idempotent? Destructive?]
```

---

## Version History

| Date | Migration | Version | Notes |
|------|-----------|---------|-------|
| 2025-11-16 | addUserFieldsToPosts.js | v0.20.1 | Initial Web V2 deployment prep |

---

## Related Documentation

- [Version Management](./version-management.md) - Version update process
- [Backend Architecture](./05-backend-architecture.md) - Backend structure
- [Development Workflow](./07-development-workflow.md) - Dev environment setup
