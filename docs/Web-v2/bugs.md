# Web-V2 Bug List

---

## Bug Fixing Workflow

### Before Starting
Create a list of the bugs we're going to tackle for the session.

### Steps
1. **Research** - Investigate root cause, research how big tech companies solved similar issues
2. **Summary & Proposal** - Present findings and ask for preferred fix approach
3. **Implementation** - Implement the fix and present for review (may iterate based on feedback)
4. **Approval & Commit** - Once approved, run `npm run precommit` in web-v2, commit changes, and move to next bug

### Copilot Prompt for Bug Fixing Sessions

```
We're going to fix bugs from docs/Web-V2/bugs.md. Follow this workflow for each bug:

1. RESEARCH: Investigate the root cause in the codebase. Research how major tech companies (Apple, Google, Meta) solve similar issues. Check MDN, web.dev, and official documentation.

2. SUMMARY: Present your findings:
   - What's causing the bug
   - How others have solved it
   - Your recommended approach(es)
   Then ask: "How would you like me to fix this?"

3. IMPLEMENT: Make the fix based on my direction. Show me the changes for review. Be ready to iterate if I request changes.

4. COMMIT: Only after I say "Approve":
   - Run: cd apps/web-v2 && npm run precommit
   - Commit with message: "fix(web-v2): [brief description] - closes #[bug number]"
   - Mark the bug as FIXED in bugs.md
   - Move to the next bug

Let's start. Which bug(s) are we tackling today?
```

---

**Reported:** November 28, 2025  
**Source:** QA Tester Feedback  
**Status:** In Progress (18/22 Fixed)

---

## Navigation & Layout

### 1. ✅ Navbar Not Centered
- **Priority:** Medium
- **Status:** FIXED
- **Description:** The navbar is not true center based on the create post button
- **Location:** Global navigation

### 2. ✅ iOS Menu Bar Overlap
- **Priority:** High
- **Status:** FIXED (commit `d4d20bc`)
- **Description:** Raise the navbar to account for iOS menu bar button (safe area insets)
- **Location:** Global navigation on iOS devices
- **Proposed Solution:**
  1. Add `viewport-fit=cover` to the viewport meta tag in `index.html`
  2. Use CSS `env(safe-area-inset-bottom)` for navbar bottom padding/margin
  3. Apply to any fixed-position elements at screen edges
  4. Sources: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/layout), [WebKit Blog](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)

### 3. ✅ Overall Mobile Width Too Wide
- **Priority:** High
- **Status:** FIXED (commit `ca4240e`)
- **Description:** Overall width in mobile view is too wide for default iPhone 15 Pro experience. Need to adjust padding to make mobile view fit smaller width by approximately 50px
- **Action:** Review official iOS guidelines for proper sizing
- **Location:** Global mobile layout
- **Proposed Solution:**
  1. iPhone 15 Pro viewport: 393 CSS pixels (points) wide
  2. Add proper horizontal padding (16-20px per side)
  3. Set `max-width: 100vw` and `overflow-x: hidden` on container elements
  4. Use CSS `box-sizing: border-box` globally
  5. Sources: [Apple Device Specifications](https://developer.apple.com/design/human-interface-guidelines/layout#Specifications), [BrowserStack Device Guide](https://www.browserstack.com/guide/iphone-15-pro-screen-size)

---

## Posts & Feed

### 4. ✅ Offline Mode - Disable Post Button
- **Priority:** Medium
- **Status:** FIXED (commit `3fef2e6`)
- **Description:** In offline mode, disable the Post button in create post screen
- **Location:** Create Post page

### 5. ✅ Post Button Width on Mobile
- **Priority:** Low
- **Status:** FIXED
- **Description:** Make Post button wide as the viewport when in mobile view
- **Location:** Create Post page

### 6. ✅ User Cannot Delete Own Post
- **Priority:** High
- **Status:** FIXED (commit `829faae`)
- **Description:** Users should be able to delete their own posts
- **Location:** Post actions/options
- **Proposed Solution:**
  1. Backend: Implement `DELETE /api/v1/posts/:postId` endpoint with ownership verification
  2. Frontend: Add delete option to post menu (only visible for own posts)
  3. Add confirmation dialog before deletion
  4. Implement soft delete (mark as deleted) vs hard delete based on business requirements

### 7. ✅ User Profile Post Padding Inconsistency
- **Priority:** Medium
- **Status:** FIXED (commit `2c370de`)
- **Description:** The horizontal padding/margins for posts in user profile is bigger than it is for PostFeed. Should use PostFeed layout but load different content (DRY the code instead of duplicating)
- **Location:** User Profile page vs PostFeed

### 8. ✅ Add Comment Count to Posts
- **Priority:** Medium
- **Status:** FIXED (commit `fce6d62`)
- **Description:** Add a comment count next to the comments button in posts (both feed and details page)
- **Location:** Post component (feed view and detail view)

---

## Messaging

### 9. ✅ Long Messages Break Layout
- **Priority:** High
- **Status:** FIXED (commit `20c9a42`)
- **Description:** When messages are too long in the conversation detail page, the page becomes wider than it should be, exceeding mobile viewport
- **Note:** This issue affects single line, no-spaces long text
- **Test strings:** 
  - `AaksjddddjddjsjsjjdAaksjddddjddjsjsjjdfjfkdjcjdjcj`
  - `Ddllsslckfkkdkdckdkdkfkdkckdkckdkdkdkfjdkdkkdkddkkddkdkdkfkfjfjffjjjjgkfkfkdkdk`
- **Location:** Conversation Detail page
- **Fix:** Add `word-break: break-word` or `overflow-wrap: break-word` CSS
- **Proposed Solution:**
  1. Apply `overflow-wrap: break-word` (preferred, breaks at word boundaries when possible)
  2. Add `word-break: break-word` as fallback for older browsers
  3. Set `max-width: 100%` on message containers
  4. CSS: `overflow-wrap: break-word; word-break: break-word; max-width: 100%;`
  5. Source: [MDN overflow-wrap](https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap)

---

## Theming (Dim Theme Support)

### 10. ✅ Conversation List - No Dim Theme
- **Priority:** Medium
- **Status:** FIXED
- **Description:** Conversation list doesn't support dim theme
- **Location:** Conversation List page

### 11. ✅ Conversation Detail - No Dim Theme
- **Priority:** Medium
- **Status:** FIXED
- **Description:** Conversation detail page doesn't support dim theme
- **Location:** Conversation Detail page

### 12. ✅ Admin Dashboard - No Dim Theme
- **Priority:** Low
- **Status:** FIXED
- **Description:** Admin dashboard doesn't support dim theme
- **Location:** Admin Dashboard

---

## UI Consistency & Glass Effects

### 13. ✅ Conversation Detail Header/Footer Glass Blur
- **Priority:** Medium
- **Status:** FIXED (commit `0939e97`)
- **Description:** Conversation details page header and footer should use Glass Blur effect (like the nav bars) for consistency
- **Location:** Conversation Detail page
- **Solution:** Used fixed positioning for header/footer with `bg-surface-elevated/95 backdrop-blur-md` so messages scroll behind them with glass blur effect

### 14. ✅ Glass Tint for Readability
- **Priority:** Medium
- **Status:** FIXED
- **Description:** Have all glass effects slightly tint dark or tint white to help reading the fonts
- **Location:** All glass blur components
- **Solution:** Created a unified Glass Effect System with:
  - CSS variables for theme-specific glass backgrounds (`--glass-bg`, `--glass-border`, `--glass-shadow`)
  - `.glass` utility class in globals.css with `backdrop-filter: blur(12px)`
  - Theme-specific opacity values: Light (70%), Dim (75%), Dark (80%)
  - Applied consistently across TopNav, BottomNav, ConversationView, UserMenu, PostDetailPage, and AdminLayout

### 21. ✅ Conversation Header Not Fixed on Scroll
- **Priority:** Medium
- **Source:** Kindness
- **Status:** FIXED (commit `edb8c7c`)
- **Description:** On the conversation detail page, when scrolling, the header should remain fixed at the top and not move up with the content
- **Location:** Conversation Detail page
- **Solution:** Used `h-dvh` (dynamic viewport height) and `overscroll-contain` to prevent iOS Safari's collapsing UI from affecting the header position

---

## Post Details Page

### 15. ✅ Sticky Comment Input Padding
- **Priority:** High
- **Status:** FIXED (commit `ce65c7c`)
- **Description:** Since we added a sticky comment input in mobile view, we need to account for that in padding the Post Details Page so comments at the bottom of the page don't end up hidden under the input field
- **Location:** Post Details page (mobile view)
- **Proposed Solution:**
  1. Add `padding-bottom` to the comments container matching sticky input height
  2. Use CSS variable for input height to keep values in sync
  3. Include safe area inset: `padding-bottom: calc(var(--sticky-input-height) + env(safe-area-inset-bottom))`
  4. Alternative: Use `scroll-padding-bottom` for scroll-into-view behavior

### 20. ✅ Comment Input Not Sticky on Scroll
- **Priority:** Medium
- **Source:** Kindness
- **Status:** FIXED (commit `f157c83`)
- **Description:** On the post detail page, when scrolling, the comment input should remain sticky at the bottom and not move with the content
- **Location:** Post Details page
- **Solution:** Used React Portal to render comment input at document.body level, escaping the scroll container

---

## Article Editor

### 16. ✅ Bullet Points Not Working
- **Priority:** High
- **Status:** FIXED (commit `9c1278b`) - Button removed pending editor rebuild
- **Description:** In article editor, bullets aren't working. They should work similar to indentation:
  - Make the current line bulleted based on cursor position (not text selection)
  - If text is selected, apply the bullet to the selected line(s)
  - Current state: button is simply not working
- **Additional consideration:** Support nested bullets using tabs or indentations
- **Location:** Article Editor
- **Solution:** Removed the broken bullet button from the toolbar. The full rich text editor will be rebuilt with a JSON-based document model (documented in To-Do.md). No point keeping broken UX in the meantime.

---

## PWA (Progressive Web App)

### 17. ✅ PWA Install Prompt
- **Priority:** Low
- **Status:** FIXED (commit `9c1278b`)
- **Description:** If person is using browser, suggest them to save the app as PWA on their home screen
- **Location:** App-wide (browser detection)
- **Solution:** Created `PWAInstallPrompt` component with:
  - Full-screen modal with platform-specific instructions (iOS Safari / Android Chrome)
  - Mobile phones only (excludes tablets/desktop via user agent + screen width)
  - 7-day dismissal period (localStorage)
  - "Continue in browser" link (small, grey, top center)
  - Follows ZEN principles: helpful, non-coercive guidance

### 18. ✅ PWA Logo Not Displaying
- **Priority:** High
- **Status:** FIXED (commit `2276086`)
- **Description:** The PWA doesn't display our logo as it should. Instead, the Vite logo appears
- **Location:** PWA manifest/icons configuration
- **Proposed Solution:**
  1. Generate PWA icons using `@vite-pwa/assets-generator`
  2. Required sizes: 192x192, 512x512 (minimum), plus maskable versions
  3. Update `vite.config.ts` manifest icons array with correct paths
  4. Replace favicon.ico and apple-touch-icon in public folder
  5. Run: `npx @vite-pwa/assets-generator --preset minimal public/logo.svg`
  6. Source: [Vite PWA Guide](https://vite-pwa-org.netlify.app/guide/pwa-minimal-requirements.html)

---

## Signup Wizard

### 19. ✅ Signup Wizard Mobile Layout Issues
- **Priority:** High
- **Status:** FIXED
- **Description:** The signup wizard is looking poor on iPhone - all crammed up around the back and next buttons:
  - MBTI selector is crammed up
  - Labels start squeezing out of the boxes
  - Info screen layout is compressed/distorted
- **Location:** Signup Wizard (all steps)
- **Proposed Solution:**
  1. Use mobile-first CSS with flexbox column layout
  2. Set proper `min-height` on wizard container (account for viewport height)
  3. Use `gap` property for consistent spacing between elements
  4. Apply `clamp()` for responsive font sizes: `font-size: clamp(14px, 4vw, 18px)`
  5. Ensure buttons have adequate touch targets (minimum 44x44px per Apple HIG)
  6. Use `overflow-y: auto` on content area, keep buttons fixed at bottom
  7. Source: [web.dev Responsive Design](https://web.dev/articles/responsive-web-design-basics)

---

## Activity & Notifications

### 22. ✅ Incorrect Activity Text for Comments
- **Priority:** Medium
- **Source:** Kindness
- **Status:** FIXED (commit `ea9b258`)
- **Description:** When someone posts a comment, the activity notification that other people receive incorrectly says "posted a photo" instead of "commented"
- **Location:** Activity feed / Notifications
- **Solution:** Modified `getActivityMessage()` in ActivityCard to check if `activity.target.thumbnail` exists - photos have thumbnails, comments don't. Long-term fix (separate Comment collection) documented in To-Do.md.

---

## Summary

| Priority | Open | Fixed |
|----------|------|-------|
| High     | 0    | 8     |
| Medium   | 0    | 11    |
| Low      | 0    | 3     |
| **Total**| **0**| **22**|

---

## Notes

- Many issues relate to mobile responsiveness, particularly for iPhone 15 Pro viewport
- ~~Dim theme support needs to be extended to messaging and admin sections~~ ✅ **DONE** - Full dim theme support added to:
  - Conversation List & Detail pages
  - Message bubbles and input
  - Admin Layout (header, nav, footer)
  - Admin Login page
  - Flagged Posts page (including sort dropdown)
  - User Management page (table, filters, search)
  - Admin Settings page (all cards and inputs)
  - Card UI component
- ~~Glass blur effects need consistency across the app~~ ✅ **DONE** - Unified Glass Effect System implemented with CSS variables and `.glass` utility class
- PWA configuration needs attention for proper branding
