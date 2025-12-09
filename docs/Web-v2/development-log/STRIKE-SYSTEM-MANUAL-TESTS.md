# Strike System - Manual Test Scenarios

## Purpose
This document provides step-by-step manual testing scenarios to validate the Strike System UI/UX and error handling. Use these scenarios to verify that users experience appropriate feedback when posting under strike restrictions.

---

## Prerequisites

### Test Environment Setup
1. **Backend running**: `npm run start:api` (port 5001)
2. **Frontend running**: `npm run start:web-v2` (port 5173)
3. **MongoDB connected**: Verify database connection
4. **Test user with strike**: Create or use existing user with active strike

### Creating a Test User with Strike

#### Option 1: Via Admin Dashboard (Recommended)
1. Open admin dashboard: `http://localhost:5173/admin/login`
2. Login with admin credentials
3. Navigate to Flagged Posts
4. Find a post and restore it (this removes a strike, so you need existing strikes)
5. **OR** Ban a user then unban them (adds Strike 4, then can be removed)

#### Option 2: Via MongoDB Directly
```javascript
// Connect to MongoDB
use vibesapp_db

// Add Strike 1 to a test user
db.users.updateOne(
  { userId: "YOUR_TEST_USER_ID" },
  {
    $push: {
      strikes: {
        reason: "Test strike for manual testing",
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }
  }
)

// Verify strike was added
db.users.findOne(
  { userId: "YOUR_TEST_USER_ID" },
  { strikes: 1, userId: 1, username: 1 }
)
```

#### Option 3: Via API Call
```bash
# Report a post 3 times from nearby users to trigger auto-strike
curl -X POST http://localhost:5001/api/post/report \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_ID",
    "userId": "REPORTER_USER_ID_1",
    "reason": "spam",
    "location": {
      "type": "Point",
      "coordinates": [-122.4194, 37.7749]
    }
  }'

# Repeat 2 more times with different userIds and nearby locations
```

---

## Test Scenario 1: Strike 1 - Post Creation Block

### Objective
Verify that users with Strike 1 see appropriate error when attempting to create a post during the 24-hour cooldown period.

### Steps

#### 1. Setup
- Login as user with Strike 1 (active, within 24 hours)
- Navigate to home feed or create post page

#### 2. Attempt to Create Post
1. Click on "Create Post" button or camera icon
2. Upload an image (or select from gallery)
3. Add caption: "Test post during Strike 1 cooldown"
4. Set location (if prompted)
5. Click "Post" or "Share" button

#### 3. Expected Result: Error Display
**Error Modal/Toast Should Appear:**
```
❌ Post creation failed

You cannot post during the cooldown period.

Your posting privileges are temporarily suspended until 
[Date Time].

Strike count: 1

[Cooldown Timer: XX hours XX minutes remaining]

[View Community Guidelines] [OK]
```

#### 4. Verify UI State
- [ ] Error message is clearly visible (modal or toast)
- [ ] Cooldown end time is displayed and formatted correctly
- [ ] Strike count is shown (1)
- [ ] Timer shows remaining cooldown time
- [ ] Post was NOT created (verify in feed)
- [ ] Image upload was NOT processed
- [ ] User can dismiss the error and return to previous screen

#### 5. Verify Post Button State (Optional UX)
- [ ] Create Post button is disabled with tooltip
- [ ] Tooltip shows: "Posting disabled - Strike cooldown active"
- [ ] Visual indication (grayed out, locked icon, etc.)

### Expected API Response
```json
{
  "error": "You cannot post during the cooldown period.",
  "restrictions": {
    "canPost": false,
    "canComment": true,
    "canReact": true,
    "isBanned": false,
    "strikeCount": 1
  },
  "cooldownEnd": "2025-12-05T00:12:28.420Z",
  "message": "Your posting privileges are temporarily suspended until Thu Dec 04 2025 19:12:28 GMT-0500 (Eastern Standard Time). Strike count: 1"
}
```

### Screenshots to Capture
- [ ] Error modal/toast displaying cooldown message
- [ ] Post creation form before error (to show user workflow)
- [ ] Disabled post button state (if implemented)

---

## Test Scenario 2: Strike 2 - Post + Comment Block

### Objective
Verify that users with Strike 2 cannot post OR comment, but can still react (hearts).

### Steps

#### 1. Setup
- Login as user with Strike 2 (add second strike to test user)
- Navigate to home feed

#### 2A. Attempt to Create Post
1. Follow steps from Scenario 1
2. **Expected:** Same error as Strike 1, but strike count shows 2

#### 2B. Attempt to Comment
1. Navigate to any post
2. Click on comment section
3. Type comment: "Test comment during Strike 2 cooldown"
4. Click "Send" or "Post Comment"

#### Expected Result: Comment Block Error
```
❌ Comment failed

You cannot comment during the cooldown period.

Your commenting privileges are temporarily suspended until 
[Date Time].

Strike count: 2

[Cooldown Timer: XX hours XX minutes remaining]

[View Community Guidelines] [OK]
```

#### 2C. Attempt to React (Heart)
1. Navigate to any post
2. Click heart/like button
3. **Expected:** Heart should work! ✅ No error

#### 3. Verify UI State
- [ ] Post button disabled/blocked
- [ ] Comment button disabled/blocked OR input field disabled
- [ ] Heart/reaction button ENABLED and functional
- [ ] Strike count shows "2" in errors
- [ ] Cooldown timer accurate

### Expected API Responses

**Post Creation:**
```json
{
  "error": "You cannot post during the cooldown period.",
  "restrictions": {
    "canPost": false,
    "canComment": false,
    "canReact": true,
    "isBanned": false,
    "strikeCount": 2
  },
  "cooldownEnd": "2025-12-05T00:12:28.420Z",
  "message": "..."
}
```

**Comment Creation:**
```json
{
  "error": "You cannot comment during the cooldown period.",
  "restrictions": {
    "canPost": false,
    "canComment": false,
    "canReact": true,
    "isBanned": false,
    "strikeCount": 2
  },
  "cooldownEnd": "2025-12-05T00:12:28.420Z",
  "message": "..."
}
```

---

## Test Scenario 3: Strike 3 - Read-Only Mode

### Objective
Verify that users with Strike 3 cannot post, comment, OR react (hearts). They are in read-only mode.

### Steps

#### 1. Setup
- Add third strike to test user
- Login as user with Strike 3

#### 2A. Attempt to Post
- **Expected:** Blocked with error (strike count: 3)

#### 2B. Attempt to Comment
- **Expected:** Blocked with error (strike count: 3)

#### 2C. Attempt to React (Heart)
1. Navigate to any post
2. Click heart button
3. **Expected:** ❌ Error! Heart should be blocked

**Expected Error:**
```
❌ Action restricted

You are in read-only mode during the cooldown period.

Strike count: 3
⚠️ Warning: One more violation will result in permanent ban.

[Cooldown Timer: XX hours XX minutes remaining]

[View Community Guidelines] [OK]
```

#### 3. Verify Read-Only UI
- [ ] All action buttons disabled (post, comment, heart)
- [ ] Clear visual indication of read-only mode
- [ ] Banner/alert showing "Read-Only Mode - Strike 3 Active"
- [ ] Warning about Strike 4 = permanent ban
- [ ] Can still browse, view profiles, read messages

### Expected API Response (React/Heart)
```json
{
  "error": "You cannot react during the cooldown period.",
  "restrictions": {
    "canPost": false,
    "canComment": false,
    "canReact": false,
    "isBanned": false,
    "strikeCount": 3
  },
  "cooldownEnd": "2025-12-05T00:12:28.420Z",
  "message": "..."
}
```

---

## Test Scenario 4: Strike 4 - Permanent Ban

### Objective
Verify that users with Strike 4 (banned) cannot access the platform at all.

### Steps

#### 1. Setup
- Add Strike 4 to test user OR use admin to ban user
- Attempt to login as banned user

#### 2. Login Attempt
**Expected:** Ban notice on login or redirect to ban page

```
🚫 Account Banned

Your account has been permanently banned due to repeated 
community guideline violations.

Strike count: 4

[Contact Support] [View Guidelines]
```

#### 3. If Logged In When Banned
**Expected:** Immediate logout or error on any action

```
🚫 Account Banned

Your account has been permanently banned due to repeated violations.

All actions are restricted.

[OK]
```

#### 4. Verify Complete Block
- [ ] Cannot create posts
- [ ] Cannot create comments
- [ ] Cannot react (hearts)
- [ ] Cannot send messages
- [ ] Cannot view content (optional - may allow browsing)
- [ ] All posts by user are hidden from other users

---

## Test Scenario 5: Cooldown Expiration

### Objective
Verify that restrictions are lifted after 24-hour cooldown period expires.

### Steps

#### 1. Setup - Fast-Forward Time Method
**Option A: Modify strike timestamp in database**
```javascript
// Connect to MongoDB
db.users.updateOne(
  { userId: "TEST_USER_ID" },
  {
    $set: {
      "strikes.$[].timestamp": new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    }
  }
)
```

**Option B: Wait 24 hours** (not practical for testing)

#### 2. Login and Test Actions
1. Login as user whose cooldown expired
2. Attempt to create post
3. **Expected:** ✅ Post created successfully!

#### 3. Verify Restrictions Lifted
- [ ] Can create posts
- [ ] Can create comments
- [ ] Can react (hearts)
- [ ] No error messages
- [ ] Strike count still shows (e.g., "1") but no active cooldown
- [ ] "Cooldown expired" badge/message (optional UX)

---

## Test Scenario 6: Strike Notification Modal

### Objective
Verify that users see a notification modal when they open the app after receiving a new strike.

### Steps

#### 1. Setup
- User receives a strike (via report system or admin action)
- User has NOT yet acknowledged the strike
- Logout and login again (or open app fresh)

#### 2. Open App
1. Login as user with unacknowledged strike
2. Navigate to home screen

#### 3. Expected: Strike Notification Modal
```
⚠️ Community Guideline Violation

You have received Strike 1

Reason: [Violation reason from report]
Example: "Your post was flagged for spam content"

Restrictions:
❌ Cannot create posts for 24 hours
✅ Can still comment and react

Cooldown ends: [Date/Time]
[Timer: XX hours XX minutes remaining]

Please review our Community Guidelines to avoid future strikes.

Strike 3 will result in read-only mode.
Strike 4 will result in permanent ban.

[View Community Guidelines] [Acknowledge]
```

#### 4. Acknowledge Strike
1. Click [Acknowledge] button
2. **Expected:** Modal closes
3. User can now use app (with restrictions)
4. Modal should NOT appear again on next login

#### 5. Verify Modal Behavior
- [ ] Modal appears on first app open after strike
- [ ] Modal is dismissible via [Acknowledge]
- [ ] Modal does NOT reappear after acknowledgment
- [ ] Strike count and reason displayed correctly
- [ ] Cooldown timer is accurate
- [ ] Links to community guidelines work

---

## Test Scenario 7: Profile Strike Indicator

### Objective
Verify that users can view their strike status in their profile.

### Steps

#### 1. Navigate to Profile
1. Login as user with active strike(s)
2. Navigate to profile page

#### 2. Expected: Strike Indicator Display
```
Profile Header:
  Username
  [⚠️ 1 Active Strike]  ← Badge/indicator
  
Profile Stats:
  Posts: 45
  Followers: 123
  Strikes: 1 (View History)
  
Restrictions Section:
  Current Restrictions:
  ❌ Cannot post (cooldown active)
  ✅ Can comment
  ✅ Can react
  
  Cooldown ends in: [Timer: 12h 34m]
```

#### 3. Verify Indicator
- [ ] Strike badge visible in profile
- [ ] Shows active strike count
- [ ] Cooldown timer displayed
- [ ] Restrictions clearly listed
- [ ] Link to strike history (optional)
- [ ] Expired strikes NOT shown as active

---

## Test Scenario 8: Admin Dashboard - Strike Management

### Objective
Verify that admins can view and manage user strikes.

### Steps

#### 1. Login to Admin Dashboard
1. Navigate to `/admin/login`
2. Login with admin credentials
3. Navigate to User Management

#### 2. View User Strikes
1. Find user with strikes in user table
2. **Expected:** Strike badge visible on user row
   - Shows strike count (e.g., "🚨 2")
   - Red/orange color coding
   - Banned users have "BANNED" badge

#### 3. View User Details
1. Click on user with strikes
2. **Expected:** Detailed strike information
   - Full strike history with timestamps
   - Expiration dates
   - Violation reasons
   - Related post IDs (if applicable)

#### 4. Restore Post (Remove Strike)
1. Navigate to Flagged Posts
2. Find a hidden post
3. Click "Restore Post"
4. **Expected:** 
   - Post unhidden
   - Author's most recent strike removed
   - Strike count decremented

#### 5. Ban User (Add Strike 4)
1. Navigate to User Management
2. Select user to ban
3. Click "Ban User"
4. **Expected:**
   - Strike 4 added
   - User marked as banned
   - All user's posts hidden

#### 6. Verify Admin UI
- [ ] Strike badges visible in user table
- [ ] Banned users clearly marked
- [ ] Strike history accessible
- [ ] Restore/ban actions work correctly
- [ ] Strike count updates in real-time

---

## Visual Reference: Error States

### Error Toast/Modal Design Checklist
- [ ] Clear error icon (❌, ⚠️, 🚫)
- [ ] Error title: "Post Failed" / "Action Restricted"
- [ ] Error message: Explains why (cooldown, strike)
- [ ] Strike count displayed
- [ ] Cooldown timer (countdown to end)
- [ ] Call to action: [View Guidelines] [OK]
- [ ] Consistent styling with app theme
- [ ] Mobile responsive
- [ ] Accessible (screen reader compatible)

### Example Error Message Formats

**Concise (Toast):**
```
⚠️ Cannot post - Strike 1 cooldown active
   12h 34m remaining
```

**Detailed (Modal):**
```
❌ Post Creation Failed

You cannot post during the cooldown period.

Strike count: 1 of 3
Cooldown ends: Dec 4, 2025 at 7:12 PM
Time remaining: 12 hours 34 minutes

Your posting privileges are temporarily suspended.
Please review our Community Guidelines.

[View Guidelines]  [OK]
```

---

## Testing Checklist

### ✅ Functionality
- [ ] Strike 1: Post blocked, comment allowed
- [ ] Strike 2: Post + comment blocked, react allowed
- [ ] Strike 3: All actions blocked (read-only)
- [ ] Strike 4: Complete ban
- [ ] Cooldown expiration restores access
- [ ] 30-day strike expiration works

### ✅ Error Handling
- [ ] API errors caught and displayed
- [ ] Error messages are clear and helpful
- [ ] Cooldown timers are accurate
- [ ] Strike counts displayed correctly

### ✅ User Experience
- [ ] Error messages are user-friendly
- [ ] Cooldown timers count down in real-time
- [ ] Strike notifications appear on app open
- [ ] Profile shows strike status
- [ ] Community guidelines linked

### ✅ Admin Dashboard
- [ ] Strikes visible in user management
- [ ] Strike history accessible
- [ ] Restore post removes strikes
- [ ] Ban adds Strike 4
- [ ] Strike counts accurate

---

## Common Issues and Troubleshooting

### Issue: Error says cooldown active, but 24 hours passed
**Cause:** Strike timestamp not updated, or timezone issues  
**Fix:** Check strike timestamp in database, verify server timezone

### Issue: Strike count incorrect
**Cause:** Expired strikes not filtering correctly  
**Fix:** Verify `getActiveStrikes()` logic, check expiration calculation

### Issue: Can still post during cooldown
**Cause:** Middleware not applied to route, or bypass in code  
**Fix:** Verify `checkPostingRestrictions` on POST /api/post/create

### Issue: Error modal not dismissing
**Cause:** Modal state not resetting after acknowledgment  
**Fix:** Check modal dismiss handler in frontend code

---

## Manual Test Report Template

```markdown
## Strike System Manual Test Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** Dev/QA/Production
**Build Version:** [Version]

### Test Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Strike 1 Post Block | ✅ Pass / ❌ Fail | [Details] |
| Strike 2 Comment Block | ✅ Pass / ❌ Fail | [Details] |
| Strike 3 Read-Only | ✅ Pass / ❌ Fail | [Details] |
| Strike 4 Ban | ✅ Pass / ❌ Fail | [Details] |
| Cooldown Expiration | ✅ Pass / ❌ Fail | [Details] |
| Strike Notification | ✅ Pass / ❌ Fail | [Details] |
| Profile Indicator | ✅ Pass / ❌ Fail | [Details] |
| Admin Dashboard | ✅ Pass / ❌ Fail | [Details] |

### Issues Found
1. [Issue description]
2. [Issue description]

### Screenshots
- [Attach error messages, UI states]

### Recommendations
- [Improvements or fixes needed]
```

---

**Last Updated:** December 3, 2025  
**Version:** 1.0  
**Related Docs:** [STRIKE-SYSTEM.md](./STRIKE-SYSTEM.md)
