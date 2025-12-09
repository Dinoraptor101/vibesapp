# App Layout & Navigation - Manual Testing Checklist

**Date:** November 7, 2025  
**Phase:** 2.4 - App Layout & Navigation  
**URL:** http://localhost:5173/

---

## 🧪 Desktop Navigation Tests (> 768px width)

### TopNav Visibility & Layout
- [ ] TopNav is visible at top of screen
- [ ] TopNav is sticky (stays when scrolling)
- [ ] BottomNav is hidden
- [ ] Logo (🕊️) is visible on left
- [ ] "VibesApp" text visible next to logo (on lg+ screens)
- [ ] Nav links centered in middle
- [ ] Create button + User avatar on right

### TopNav Navigation Links
- [ ] Home link visible with house icon
- [ ] Activity link visible with bell icon
- [ ] Messages link visible with message icon
- [ ] Badge shows "3" on Activity
- [ ] Badge shows "5" on Messages
- [ ] Badges are red circular style
- [ ] On lg+ screens, text labels visible ("Home", "Activity", "Messages")

### TopNav Interactions
- [ ] Hover Home → background lightens
- [ ] Hover Activity → background lightens
- [ ] Hover Messages → background lightens
- [ ] Click Home → navigates to /
- [ ] Home link has purple background when on / route
- [ ] Click Activity → navigates to /activity
- [ ] Activity link has purple background when on /activity route
- [ ] Click Messages → navigates to /messages
- [ ] Messages link has purple background when on /messages route
- [ ] Only one link highlighted at a time

### Create Post Button
- [ ] Button is purple with white text
- [ ] Button shows plus icon
- [ ] On lg+ screens, shows "Post" text
- [ ] Hover → button darkens
- [ ] Click → navigates to /create-post

### User Menu
- [ ] User avatar visible in top right
- [ ] Avatar shows user's profile picture or initials
- [ ] Avatar is circular
- [ ] Focus ring appears when tabbing to avatar
- [ ] Click avatar → dropdown menu opens below
- [ ] Menu shows username
- [ ] Menu shows MBTI type
- [ ] Menu has "Profile" option with user icon
- [ ] Menu has "Settings" option with gear icon
- [ ] Menu has "Theme" option with sun/moon icon
- [ ] Menu has "Log out" option with logout icon (red text)
- [ ] Click outside menu → closes
- [ ] Press ESC → closes

### Theme Submenu
- [ ] Hover "Theme" → submenu opens to right
- [ ] Submenu shows three options: Light, Dim, Dark
- [ ] Light option has sun icon
- [ ] Dim option has sunrise icon
- [ ] Dark option has moon icon
- [ ] Active theme has checkmark
- [ ] Click Light → theme changes immediately
- [ ] Click Dim → theme changes immediately
- [ ] Click Dark → theme changes immediately
- [ ] Reload page → theme persists

---

## 📱 Mobile Navigation Tests (< 768px width)

### BottomNav Visibility & Layout
- [ ] BottomNav is visible at bottom of screen
- [ ] BottomNav is fixed (stays when scrolling)
- [ ] TopNav is hidden
- [ ] Five icons evenly spaced
- [ ] Labels visible under each icon
- [ ] Create button is elevated (larger, circular)

### BottomNav Icons
- [ ] Home icon (house) on far left
- [ ] Activity icon (bell) second from left
- [ ] Create icon (plus) in center (larger, purple circle)
- [ ] Messages icon (message) second from right
- [ ] Profile icon (user) on far right

### BottomNav Badges
- [ ] Badge shows "3" on Activity icon
- [ ] Badge shows "5" on Messages icon
- [ ] Badges are small red circles
- [ ] Positioned at top-right of icon

### BottomNav Active States
- [ ] On / route → Home is purple, icon filled
- [ ] On /activity → Activity is purple, icon filled
- [ ] On /messages → Messages is purple, icon filled
- [ ] On /profile/:id → Profile is purple, icon filled
- [ ] Inactive icons are gray

### BottomNav Interactions
- [ ] Tap Home → navigates to /
- [ ] Tap Activity → navigates to /activity
- [ ] Tap Create (plus) → navigates to /create-post
- [ ] Tap Messages → navigates to /messages
- [ ] Tap Profile → navigates to /profile/:userId

### Mobile Layout
- [ ] Content has bottom padding (doesn't hide under nav)
- [ ] Safe area respected on notched devices
- [ ] No layout jump when nav appears
- [ ] Scrolling smooth with fixed bottom nav

---

## 🖥️ Responsive Behavior Tests

### Breakpoint Transitions
- [ ] Start at desktop width (> 768px)
- [ ] Slowly resize to mobile width (< 768px)
- [ ] TopNav disappears smoothly
- [ ] BottomNav appears smoothly
- [ ] No flashing or jumping
- [ ] Content reflows correctly
- [ ] Resize back to desktop
- [ ] BottomNav disappears smoothly
- [ ] TopNav appears smoothly

### Tablet Width (768px - 1024px)
- [ ] TopNav visible
- [ ] BottomNav hidden
- [ ] Nav links show icons only (no text labels)
- [ ] Create button shows icon only (no "Post" text)
- [ ] Everything else works same as desktop

---

## 🎨 Theme Tests

### Light Theme
- [ ] Background is light gray/white
- [ ] TopNav/BottomNav has light surface color
- [ ] Text is dark/black
- [ ] Borders visible
- [ ] Active nav items purple
- [ ] Badges red and readable

### Dark Theme
- [ ] Background is black/very dark
- [ ] TopNav/BottomNav has dark surface color
- [ ] Text is white/light gray
- [ ] Borders visible (lighter than background)
- [ ] Active nav items purple
- [ ] Badges red and readable

### Dim Theme
- [ ] Background is medium dark gray
- [ ] TopNav/BottomNav has slightly lighter surface
- [ ] Text is white/light gray
- [ ] Borders visible
- [ ] Active nav items purple
- [ ] Badges red and readable

### Theme Persistence
- [ ] Set theme to Dark
- [ ] Reload page → still Dark
- [ ] Close tab, reopen → still Dark
- [ ] Clear localStorage → resets to Light

---

## ♿ Accessibility Tests

### Keyboard Navigation
- [ ] Can tab to all nav links
- [ ] Can tab to Create button
- [ ] Can tab to User avatar
- [ ] Each focused element has visible focus ring
- [ ] Enter key opens UserMenu
- [ ] Arrow keys navigate menu items
- [ ] Enter key activates menu items
- [ ] ESC key closes menu
- [ ] Tab out of menu closes it

### Screen Reader (Optional)
- [ ] Nav links announced correctly
- [ ] Badge counts announced ("3 unread")
- [ ] User menu announced as menu
- [ ] Menu items announced with role
- [ ] Active route state announced

### ARIA Attributes
- [ ] Nav has proper role="navigation"
- [ ] Links have aria-label when icon-only
- [ ] User menu button has aria-label
- [ ] Badges have aria-label with count
- [ ] Active links have aria-current="page"

---

## 🔐 Authentication Tests

### Unauthenticated Access
- [ ] Go to http://localhost:5173/
- [ ] Should redirect to /login
- [ ] No nav bars visible on login page
- [ ] Log in successfully
- [ ] Should redirect to /
- [ ] TopNav/BottomNav now visible

### Protected Routes
- [ ] Log out
- [ ] Try /activity → redirects to /login
- [ ] Try /messages → redirects to /login
- [ ] Try /create-post → redirects to /login
- [ ] Try /profile/:id → redirects to /login
- [ ] Try /settings → redirects to /login
- [ ] Log in → can access all routes

### User Menu Data
- [ ] User avatar shows correct image/initials
- [ ] Username displays correctly in menu
- [ ] MBTI type displays correctly
- [ ] Profile link goes to correct user ID
- [ ] Logout → clears user → redirects to login

---

## 🧪 Navigation Flow Tests

### Full User Journey
1. [ ] Start logged out at /
2. [ ] Redirected to /login
3. [ ] Log in
4. [ ] See HomePage with nav
5. [ ] Click Activity → see ActivityPage
6. [ ] Click Messages → see MessagesPage
7. [ ] Click Create (plus) → see CreatePostPage
8. [ ] Click Profile → see ProfilePage
9. [ ] Click user avatar → UserMenu opens
10. [ ] Click Settings → see SettingsPage
11. [ ] Click user avatar again
12. [ ] Click Log out → redirected to /login
13. [ ] No longer see nav bars

### Browser Navigation
- [ ] Navigate through several pages
- [ ] Press browser Back button → goes back
- [ ] Press browser Forward button → goes forward
- [ ] Active state updates correctly
- [ ] Direct URL access works (e.g., paste /activity in address bar)

---

## 🐛 Edge Cases

### Long Usernames
- [ ] Username longer than menu width → truncates with ellipsis
- [ ] Full username visible on hover (optional)

### No Profile Picture
- [ ] User without profile picture → shows initials
- [ ] Initials are readable and well-sized

### Badge Counts
- [ ] 0 unread → no badge shows
- [ ] 1-9 unread → shows number
- [ ] 10-99 unread → shows number
- [ ] 100+ unread → shows "99+"

### Mobile Landscape
- [ ] Rotate device to landscape
- [ ] BottomNav still visible and usable
- [ ] Content doesn't hide under nav
- [ ] All interactions still work

---

## ✅ Final Checklist

- [ ] All desktop navigation tests pass
- [ ] All mobile navigation tests pass
- [ ] All responsive tests pass
- [ ] All theme tests pass
- [ ] All accessibility tests pass
- [ ] All authentication tests pass
- [ ] All navigation flow tests pass
- [ ] All edge case tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript compiles without errors
- [ ] Dev server runs without errors

---

## 📝 Notes

**Tested by:** ___________  
**Date:** ___________  
**Browser:** ___________  
**OS:** ___________  
**Screen sizes tested:** ___________

**Issues found:**
- 
- 
- 

**Additional observations:**
- 
- 
