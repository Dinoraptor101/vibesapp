# Accessibility Fixes Tracker

**Status:** 📋 Ready for Implementation  
**Created:** November 24, 2025  
**Last Updated:** November 24, 2025

---

## Priority 1: CRITICAL (Do First) 🔴

### Issue #1: Icon Button Labels - ARIA Labels Missing

**Severity:** CRITICAL  
**Impact:** Makes icon-only buttons inaccessible to screen reader users  
**WCAG Criterion:** 1.1.1 Non-text Content (Level A)

#### Files to Modify

- [ ] `apps/web-v2/src/components/PostCard.tsx`
  - [ ] Like button
  - [ ] Comment button  
  - [ ] Share button
  - [ ] Delete button
  - [ ] Menu button

- [ ] `apps/web-v2/src/components/FeedPost.tsx`
  - [ ] Like button
  - [ ] Comment button
  - [ ] Share button

- [ ] `apps/web-v2/src/components/LikeButton.tsx`
  - Add aria-label
  - Add aria-pressed

- [ ] `apps/web-v2/src/components/FollowButton.tsx`
  - Add aria-label
  - Add aria-pressed

#### Implementation Required
```jsx
// Add to ALL icon-only buttons:
aria-label="[Action] [Object]"
// Examples:
aria-label="Like post"
aria-label="Comment on post"
aria-label="Share post"
aria-label="Delete post"
aria-label="Post options menu"
```

#### Testing
```
Run: npm run dev
Open VoiceOver (⌘F5)
Tab to each button
Should hear: "[Action] post, button"
```

---

### Issue #2: Form Validation Errors - Error Linking

**Severity:** CRITICAL  
**Impact:** Form errors not associated with fields  
**WCAG Criterion:** 3.3.1 Error Identification (Level A)

#### Files to Modify

- [ ] `apps/web-v2/src/components/LoginForm.tsx`
  - [ ] Link email error
  - [ ] Link password error

- [ ] `apps/web-v2/src/components/CreatePostForm.tsx`
  - [ ] Link caption error
  - [ ] Link image/file error
  - [ ] Link any other validation errors

- [ ] All form components using error messages
  - Search for: `const [.*Error, set.*Error]`

#### Implementation Required
```jsx
// 1. Add id to error message
<span id="email-error" role="alert">{error}</span>

// 2. Add aria-describedby and aria-invalid to input
<input 
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
```

#### Testing
```
Enter invalid email
Tab away
Should hear: "Email, email input, invalid, [error message]"
```

---

### Issue #3: Modal/Dialog Semantics - Missing Dialog Role

**Severity:** CRITICAL  
**Impact:** Modals not announced as dialogs  
**WCAG Criterion:** 4.1.3 Status Messages (Level AA)

#### Files to Modify

- [ ] `apps/web-v2/src/components/Modal.tsx`
  - Add role="dialog"
  - Add aria-labelledby
  - Add aria-modal="true"
  - Implement focus trapping

- [ ] `apps/web-v2/src/components/Dialog.tsx` (if exists)
  - Same changes as Modal.tsx

- [ ] Any other modal/dialog components
  - Search for: `className.*modal`

#### Implementation Required
```jsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  tabIndex={-1}
>
  <h2 id="modal-title">Title</h2>
  {/* content */}
</div>
```

#### Testing
```
Click button that opens modal
Should hear: "Dialog: [Title]"
Tab should cycle within modal
Escape should close modal
```

---

### Issue #4: Generic Link Text - Link Purpose

**Severity:** CRITICAL  
**Impact:** Link purpose unclear  
**WCAG Criterion:** 1.3.1 Info and Relationships (Level A)

#### Files to Modify

Search for these patterns:

```
// Search for:
"Click here" → Replace or add aria-label
"Read more" → Add context
"View" → Specify what to view
"Link" → Remove, use real text
">" arrow → Add aria-label
```

#### Common Components
- [ ] User profile links (in posts, comments, messages)
- [ ] Post links
- [ ] Navigation links with generic text
- [ ] "View more" links
- [ ] Action links with only icons

#### Implementation Required
```jsx
// Option 1: Use descriptive text
<a href="/user/123">View Sarah's profile</a>

// Option 2: Keep text, add aria-label
<a href="/user/123" aria-label="View Sarah's profile">
  Click here
</a>

// Option 3: Icon with context
<a href="/posts/456" aria-label="View Sarah's post from Nov 24">
  <span aria-hidden="true">→</span> Read post
</a>
```

#### Testing
```
Tab through links
Each should announce purpose from text alone
No "click here", "read more", "view" without context
```

---

## Priority 2: MAJOR (Do Next) 🟠

### Issue #5: Live Regions - Notifications Not Announced

**Files:**
- [ ] `apps/web-v2/src/components/NotificationCenter.tsx`
- [ ] `apps/web-v2/src/components/Toast.tsx`
- [ ] Any real-time update components

**Fix:**
```jsx
<div aria-live="polite" aria-atomic="true" role="status">
  {/* notification content */}
</div>
```

---

### Issue #6: Button States - aria-pressed

**Files:**
- [ ] `apps/web-v2/src/components/LikeButton.tsx`
- [ ] `apps/web-v2/src/components/FollowButton.tsx`

**Fix:**
```jsx
<button aria-pressed={isActive}>
  {/* button content */}
</button>
```

---

### Issue #7: Input Labels - Missing/Hidden Labels

**Files:** All form components

**Fix:** Every input needs either:
- Associated `<label>` with `htmlFor`
- OR `aria-label` attribute
- NOT just `placeholder`

---

### Issue #8: Color-Only Information

**Search for:**
- Status indicators (red/green only)
- Priority indicators (color only)
- Any communication via color alone

**Fix:** Add text or icon in addition to color

---

### Issue #9: Skip Navigation Link

**Files:**
- [ ] `apps/web-v2/src/app/App.tsx` or main layout

**Fix:**
```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
<main id="main-content">
  {/* content */}
</main>
```

---

## Priority 3: MINOR (Polish) 🟡

### Issue #10: Heading Hierarchy
**Search for:** Heading levels that skip (H1 → H3)  
**Fix:** Make sequential (H1 → H2 → H3)

### Issue #11: Required Field Labels
**Add:** `aria-required="true"` to required inputs

### Issue #12: Gallery Navigation
**Add:** Image count and clear navigation labels

---

## Verification Checklist

### For Each File Modified

- [ ] **Added accessibility attributes** (aria-label, aria-describedby, etc.)
- [ ] **Tested with VoiceOver** (⌘F5 on macOS)
- [ ] **Tested keyboard navigation** (Tab, Enter, Escape)
- [ ] **No console errors** after change
- [ ] **Visual appearance unchanged** (only accessibility improvements)
- [ ] **Tested in both light and dark themes**
- [ ] **Backward compatible** with existing functionality

### After All Fixes

- [ ] Run full accessibility audit
- [ ] Test with axe-core (`npm run lint:a11y` if configured)
- [ ] VoiceOver test of entire app flow
- [ ] NVDA test (if Windows available)
- [ ] Update test checklist
- [ ] Mark as WCAG AA compliant

---

## Implementation Timeline

### Sprint 1: Critical Issues (IMMEDIATE)
```
Time Estimate: 2-3 hours
Issues: #1, #2, #3, #4
Status: NOT STARTED
```

- [ ] Issue #1: Icon buttons (30 min)
- [ ] Issue #2: Form errors (45 min)
- [ ] Issue #3: Modals (45 min)
- [ ] Issue #4: Generic links (30 min)

### Sprint 2: Major Issues (NEXT)
```
Time Estimate: 1-2 hours
Issues: #5, #6, #7, #8, #9
Status: NOT STARTED
```

- [ ] Issue #5: Live regions (30 min)
- [ ] Issue #6: Button states (20 min)
- [ ] Issue #7: Labels (30 min)
- [ ] Issue #8: Color-only (20 min)
- [ ] Issue #9: Skip link (10 min)

### Sprint 3: Polish (LATER)
```
Time Estimate: 30 minutes
Issues: #10, #11, #12
Status: NOT STARTED
```

---

## Files Requiring Review

### CRITICAL (Must Review)
```
apps/web-v2/src/components/
  ├── PostCard.tsx ⚠️
  ├── FeedPost.tsx ⚠️
  ├── LoginForm.tsx ⚠️
  ├── CreatePostForm.tsx ⚠️
  ├── Modal.tsx ⚠️
  ├── Dialog.tsx ⚠️
  └── Button components
    ├── LikeButton.tsx ⚠️
    └── FollowButton.tsx ⚠️
```

### MAJOR (Should Review)
```
apps/web-v2/src/
  ├── components/
  │   ├── NotificationCenter.tsx ⚠️
  │   ├── Toast.tsx ⚠️
  │   └── Navigation/Navbar.tsx
  ├── features/
  │   └── messaging/
  │       └── MessageThread.tsx ⚠️
  ├── pages/
  │   └── SearchPage.tsx ⚠️
  └── app/
      └── App.tsx (add skip link)
```

### MINOR (Nice to Review)
```
All heading structures
Form labels throughout app
Gallery/carousel components
Status indicator components
```

---

## Useful Grep Commands

Find components that might need fixes:

```bash
# Find icon-only buttons (no text content)
grep -r "<button>" apps/web-v2/src/components/ | grep -E "❤️|💬|⋮|🗑|↗"

# Find form errors
grep -r "error" apps/web-v2/src/components/ | grep -i form

# Find modals
grep -r "role=\"modal\"" apps/web-v2/src/

# Find generic link text
grep -r "Click here\|Read more\|View" apps/web-v2/src/

# Find placeholder-only inputs
grep -r "placeholder=" apps/web-v2/src/ | grep -v "label\|aria-label"

# Find inputs without labels
grep -r "<input" apps/web-v2/src/ | grep -v "aria-label\|label"

# Find color-based indicators
grep -r "backgroundColor.*red\|backgroundColor.*green" apps/web-v2/src/
```

---

## Testing Commands

```bash
# Run the app
npm run start:web-v2

# Run linting
npm run lint

# Run tests (if configured)
npm run test

# Check for accessibility issues (if axe configured)
npm run lint:a11y

# Type check
npm run type-check
```

---

## Notes

- **Do NOT create new test files** - testing handled manually with VoiceOver
- **Do NOT break existing functionality** - accessibility only adds attributes
- **Do test in VoiceOver regularly** - (⌘F5 on macOS)
- **Do document any additional issues found** - add to this file

---

## Sign-Off

- [ ] All critical issues fixed
- [ ] All major issues fixed
- [ ] VoiceOver testing complete
- [ ] WCAG AA compliance verified
- [ ] Ready for production

---

**Tracker Status:** 📋 Ready for Development  
**Next Step:** Assign developers to Priority 1 issues  
**Review Frequency:** Weekly during implementation

---

*Use this tracker to monitor progress on accessibility improvements. Update status as you work.*
