# Technical Debt & UX Improvements

This document tracks known issues, UX improvements, and technical debt items that need to be addressed in future phases.

---

## Signup Flow Issues

### 1. Skip Button Redundancy
**Priority:** Medium  
**Category:** UX Improvement  
**Status:** ⏳ Pending

**Issue:**  
The "Skip" and "Next" buttons perform the same action on optional steps. This violates the Zen principle of "one way to do one thing."

**Current Behavior:**
- Optional steps (Avatar, Bio) show both "Skip" and "Next" buttons
- Both buttons advance to the next step without any difference

**Desired Behavior:**
- Remove the "Skip" button entirely
- Keep only the "Next" button on all steps
- Users can advance without filling optional fields

**Impact:**
- Reduces cognitive load
- Cleaner, more predictable UX
- Follows design consistency principles

**Location:**
- `apps/web-v2/src/features/auth/components/SignupWizard.tsx`

**Effort Estimate:** 15 minutes

---

### 2. Profile Picture Upload Failure
**Priority:** Medium  
**Category:** Bug  
**Status:** ⏳ Pending Investigation

**Issue:**  
Clicking "Upload Photo" in the signup flow shows "Failed to upload image. Please try again."

**Current Behavior:**
- File picker opens successfully
- User selects an image
- Error message appears: "Failed to upload image. Please try again."
- No image preview shown

**Suspected Causes:**
1. S3 presigned URL endpoint might not be returning correct format
2. Image compression might be failing
3. CORS issue with S3 bucket
4. CloudFront URL construction issue

**Investigation Needed:**
- Check browser console for detailed error
- Verify S3 presigned URL response from `/api/s3Url`
- Test image compression with `compressImage()` utility
- Verify S3 bucket CORS configuration

**Location:**
- `apps/web-v2/src/features/auth/components/SignupWizard.tsx` (line ~107-145)
- `apps/web-v2/src/features/posts/api/s3Service.ts`
- `apps/web-v2/src/features/posts/utils/imageUtils.ts`

**Workaround:**
- Step 6 (Avatar) is optional, users can skip
- Profile picture can be added later from profile settings

**Effort Estimate:** 2-4 hours (includes investigation and testing)

---

### 3. Pigeon ID Shown Too Early (Account Creation Timing)
**Priority:** High  
**Category:** UX Issue / Security  
**Status:** ⏳ Pending

**Issue:**  
Pigeon ID (password) is generated and shown at Step 2, but the account is only created after completing all steps. This creates several problems:

**Problems:**
1. **Incomplete Signups:** If user abandons signup after seeing Pigeon ID, the ID is wasted but no account exists
2. **Confusing UX:** User receives "password" before account is created
3. **Security Risk:** User might try to login with Pigeon ID before account exists
4. **Poor Conversion:** Early password presentation may overwhelm users

**Current Flow:**
```
Step 1: Welcome
Step 2: Generate & Show Pigeon ID ❌ (Too Early!)
Step 3: Username
Step 4: MBTI
Step 5: Location
Step 6: Avatar
Step 7: Bio
Final: Account Created ✅
```

**Desired Flow:**
```
Step 1: Welcome
Step 2: Username
Step 3: MBTI
Step 4: Location
Step 5: Avatar (optional)
Step 6: Bio (optional)
Step 7: Generate & Show Pigeon ID + Create Account ✅
```

**Benefits:**
1. Account is created immediately when user confirms they saved Pigeon ID
2. No wasted Pigeon IDs from abandoned signups
3. Better UX: password comes at the end after user is committed
4. Reduces drop-off rate (smaller commitment upfront)

**Implementation Notes:**
- Move Pigeon ID generation to final step
- Create account immediately when user clicks "I've Saved It"
- Auto-login user after account creation
- Remove separate "Next" button (see issue #4)

**Location:**
- `apps/web-v2/src/features/auth/components/SignupWizard.tsx`

**Effort Estimate:** 1-2 hours

---

### 4. Redundant "Next" Button After Pigeon ID Confirmation
**Priority:** Low  
**Category:** UX Improvement  
**Status:** ⏳ Pending

**Issue:**  
After generating Pigeon ID, user must click "I've Saved It" AND then click "Next". This is unnecessary friction.

**Current Behavior:**
1. User sees Pigeon ID on Step 2
2. User clicks "I've Saved It" button
3. User must then click "Next" button
4. Total: 2 clicks to proceed

**Desired Behavior:**
1. User sees Pigeon ID on final step
2. User clicks "I've Saved It"
3. Account is created immediately
4. User is auto-logged in and redirected to home
5. Total: 1 click to complete signup

**Benefits:**
- Reduces friction (50% fewer clicks)
- More decisive action ("I've Saved It" = completion)
- Better conversion rate
- Follows principle: one action, one result

**Implementation Notes:**
- This should be implemented together with Issue #3
- "I've Saved It" becomes the final CTA
- No "Next" button on Pigeon ID step
- Clicking "I've Saved It" triggers account creation

**Location:**
- `apps/web-v2/src/features/auth/components/SignupWizard.tsx`

**Effort Estimate:** 30 minutes (when combined with Issue #3)

---

## Summary Statistics

**Total Issues:** 4  
**High Priority:** 1  
**Medium Priority:** 2  
**Low Priority:** 1  

**Estimated Total Effort:** 4-8 hours

---

## Next Steps

1. **Phase 3.5 or 3.6:** Address High priority items (Issue #3)
2. **Phase 4.x:** Address Medium priority items (Issues #1, #2)
3. **Polish Sprint:** Address Low priority items (Issue #4)

---

## Related Documents
- [REBUILD-ACTION-PLAN.md](../../docs/REBUILD-ACTION-PLAN.md) - Phase planning
- [PHASE-3.4-IMPLEMENTATION-LOG.md](./PHASE-3.4-IMPLEMENTATION-LOG.md) - Recent changes
- [REBUILD-LEARNINGS.md](../../docs/REBUILD-LEARNINGS.md) - Design principles
