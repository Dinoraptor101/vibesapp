# Production Database Migration - Web-V2 Schema Compatibility

**Date:** 9 December 2025  
**Executed by:** Renamon (AI Partner) with Dima oversight  
**Duration:** ~15 minutes  
**Status:** ✅ Complete

---

## Executive Summary

Production database was running legacy schema from Web-V1. Test/QA database had evolved with Web-V2 features. This migration brought prod into full Web-V2 compatibility.

### Key Metrics

| Collection | Documents | Fields Added | Completion |
|------------|-----------|--------------|------------|
| Users | 627 | 8 fields | 100% |
| Posts | 352 | 10 fields | 100% |
| Conversations | 13 | 1 field | 100% |

---

## Problem Discovery

### Initial Symptom
Partner reported: "Test QA database works on Web-V2, but prod shows some issues sometimes... especially when it comes to users."

### Root Cause Analysis

Compared BSON backups from prod (`backup-prod-20251208-225238`) and test (`backup-test-20251208-225111`).

**Method:**
```bash
bsondump --quiet backups/.../users.bson | jq -s 'map(keys) | add | unique | sort'
```

### Schema Differences Discovered

#### Users Collection (627 documents)

| Field | Expected (Model) | PROD Status | TEST Status |
|-------|------------------|-------------|-------------|
| `isDeleted` | Boolean, default: false | ❌ Missing (625) | ✅ Present |
| `deletedAt` | Date, default: null | ❌ Missing (627) | ✅ Present |
| `createdAt` | Date, default: Date.now | ❌ Missing (625) | ✅ Present |
| `profilePictureUrl` | String, optional | ❌ Missing (626) | ✅ Present |
| `bio` | String, optional | ❌ Missing (626) | ✅ Present |
| `notificationPreferences` | Object | ❌ Missing (625) | ✅ Present |
| `location.city` | String, optional | ❌ Missing (599) | ✅ Present |
| `location.state` | String, optional | ❌ Missing (599) | ✅ Present |

#### Posts Collection (352 documents)

| Field | Expected (Model) | PROD Status |
|-------|------------------|-------------|
| `hiddenForUsers` | Array, default: [] | ❌ Missing (350) |
| `commentOn` | ObjectId, default: null | ❌ Missing (350) |
| `replyToCommentId` | ObjectId, default: null | ❌ Missing (350) |
| `user.profilePictureUrl` | String, optional | ❌ Missing (199) |

#### Conversations Collection (13 documents)

| Field | Expected (Model) | PROD Status |
|-------|------------------|-------------|
| `readCursors` | Map, default: {} | ❌ Missing (7) |

#### Missing Indexes in PROD

- `users.pigeonId` (unique) - **CRITICAL for auth performance**
- `users.location.lat_1_location.lon_1` - for nearby queries

---

## Migration Script

**File:** `/scripts/migrate-prod-schema.js`  
**Version:** 2.0  
**Lines:** 578

### Script Features

1. **Safe operations** - Each update wrapped in try/catch with descriptive output
2. **Idempotent** - Can be run multiple times without side effects
3. **createdAt derivation** - Extracts timestamp from MongoDB ObjectId (accurate creation date)
4. **Data integrity checks** - Warns about missing required fields
5. **Verification report** - Shows % completion for all fields

---

## Execution Log

### Command
```bash
mongosh "mongodb+srv://[connection-string]/prod" --file scripts/migrate-prod-schema.js
```

### Output Summary

```
╔════════════════════════════════════════════════════════════════════╗
║       VIBESAPP PROD → WEB-V2 SCHEMA MIGRATION                      ║
║       Version 2.0                                                   ║
╚════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SECTION 1: USERS COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total users in database: 627

  ✓ Added isBanned field: 0 documents updated
  ✓ Added isDeleted field: 625 documents updated
  ✓ Added bannedAt field: 0 documents updated
  ✓ Added deletedAt field: 627 documents updated
  ✓ Added strikes array: 0 documents updated
  ✓ Added profilePictureUrl field: 626 documents updated
  ✓ Added bio field: 626 documents updated
  ✓ Added notificationPreferences: 625 documents updated
  ✓ Added createdAt field: 627/627 users now have createdAt
  ✓ Added location.city and location.state: 599 documents updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SECTION 2: POSTS COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total posts in database: 352

  ✓ Added hiddenForUsers array: 350 documents updated
  ✓ Added commentOn field: 350 documents updated
  ✓ Added replyToCommentId field: 350 documents updated
  ✓ Added user.profilePictureUrl to embedded users: 199 documents updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SECTION 3: CONVERSATIONS COLLECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total conversations in database: 13

  ✓ Added readCursors field: 7 documents updated

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SECTION 7: FINAL VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  USERS:
    Total: 627
    With isBanned: 627 (100%)
    With isDeleted: 627 (100%)
    With strikes: 627 (100%)
    With createdAt: 627 (100%)
    With notificationPreferences: 627 (100%)

  POSTS:
    Total: 352
    With isDeleted: 352 (100%)
    With isHidden: 352 (100%)
    With reports: 352 (100%)
    With hiddenForUsers: 352 (100%)

  CONVERSATIONS:
    Total: 13
    With readCursors: 13 (100%)

╔════════════════════════════════════════════════════════════════════╗
║       MIGRATION COMPLETE                                           ║
║  Duration: 10.32 seconds                                           ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Additional Fixes

### Orphaned Users (pigeonId = null)

**Issue:** 3 users created without pigeonId - they could never authenticate.

**Discovery:** Index creation failed with duplicate key error on `null`.

**Affected Users:**
| _id | userId | userName |
|-----|--------|----------|
| 67afbfb128094ff32b9469c5 | 4f81bf26-043d-4911-a794-0a0f67922663 | Dave |
| 67b0b177c8c4aabcfaf654fe | 62598d89-b647-4057-9120-6a7b48830e83 | Anon |
| 67b0b177c8c4aabcfaf65500 | 468c0ca4-c054-4989-a8aa-29b6d5c257cd | Anon |

**Fix Applied:**
```javascript
// Set pigeonId = userId for each orphaned user
db.users.updateOne(
  {_id: ObjectId("67afbfb128094ff32b9469c5")},
  {$set: {pigeonId: "4f81bf26-043d-4911-a794-0a0f67922663"}}
);
// ... repeated for other 2 users
```

**Root Cause:** Likely a signup bug where pigeonId generation failed silently.

**Prevention:** Add validation in signup endpoint to ensure pigeonId is always set.

---

## Indexes Created

| Collection | Index | Options |
|------------|-------|---------|
| users | `pigeonId_1` | unique: true |
| users | `userId_1` | unique: true |
| users | `location.lat_1_location.lon_1` | - |
| posts | `user.userId_1` | - |
| posts | `createdAt_-1` | - |
| posts | `isDeleted_1_isHidden_1` | - |
| posts | `commentOn_1` | sparse: true |
| posts | `replyTo_1` | sparse: true |
| conversations | `user1Id_1_user2Id_1` | - |
| conversations | `status_1` | - |
| conversations | `updatedAt_-1` | - |
| activities | `recipientId_1_createdAt_-1` | - |
| activities | `recipientId_1_isRead_1` | - |
| activities | `type_1` | - |
| dmrequests | `sender_1` | - |
| dmrequests | `recipient_1` | - |
| dmrequests | `recipient_1_status_1` | - |
| dmrequests | `sender_1_recipient_1` | - |
| follows | `follower_1` | - |
| follows | `following_1` | - |
| follows | `follower_1_following_1` | unique: true |

---

## Backup Information

**Pre-migration backups exist at:**
- `/backups/backup-prod-20251208-225238/prod/`
- `/backups/backup-test-20251208-225111/test/`

These can be restored with:
```bash
mongorestore --uri="connection-string" --drop backups/backup-prod-20251208-225238/
```

---

## Lessons Learned

1. **Schema drift is silent** - Prod and test diverged without anyone noticing. Regular schema audits should be part of the release process.

2. **BSON backups are forensic tools** - The ability to compare field presence across environments was invaluable.

3. **Orphaned data accumulates** - The 3 users with null pigeonId existed since creation. They were invisible failures.

4. **Idempotent migrations are essential** - The script can be run multiple times safely. This reduces anxiety about re-running after failures.

5. **createdAt derivation from ObjectId** - MongoDB ObjectIds contain their creation timestamp. This is a reliable way to backfill `createdAt` fields.

---

## Verification Checklist

- [x] All users have `isDeleted` field
- [x] All users have `createdAt` field (derived from ObjectId)
- [x] All users have `notificationPreferences` object
- [x] All users have `pigeonId` (3 fixed manually)
- [x] All posts have `hiddenForUsers` array
- [x] All posts have `commentOn` field
- [x] All conversations have `readCursors` Map
- [x] `pigeonId` unique index created
- [x] All required indexes created
- [x] No data integrity warnings

---

## Sign-off

**Migration verified by:** Renamon + Dima  
**Date:** 9 December 2025  
**Next action:** Monitor prod for any schema-related errors in application logs
