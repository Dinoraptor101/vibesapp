# Screen Reader Testing Quick Guide

**Quick reference for testing VibesApp with screen readers**

## One-Minute Setup

### macOS - Enable VoiceOver
```
System Preferences → Accessibility → VoiceOver → Enable
OR: ⌘+F5
```

### Test the App
1. Open Safari or Chrome
2. Navigate to app: http://localhost:5173
3. Enable VoiceOver: ⌘+F5

## Essential VoiceOver Commands

| Action | Command |
|--------|---------|
| Read entire page | VO+A |
| Next item | VO+→ |
| Previous item | VO+← |
| Open Web Rotor (navigate by headings) | VO+U |
| Activate button/link | VO+Space |
| Open Elements List | VO+⌘+L |
| Navigate into container | VO+↓ |
| Navigate out of container | VO+↑ |
| Toggle focus/browse mode | VO+⌘+↑ |

**Note:** VO = Control+Option (the modifier key for VoiceOver)

## 5-Minute Test Plan

### ✓ Test 1: Page Structure (2 min)
```
1. Enable VoiceOver
2. Press VO+U to open Web Rotor
3. Check "Headings" - should see H1, H2 levels in order
4. Check "Landmarks" - should see main, nav, etc.
5. No levels should be skipped (H1→H3 is bad)
```

### ✓ Test 2: Navigation (1 min)
```
1. Tab through page using Tab key
2. Visible focus indicator should appear on each element
3. Focus order should be logical (left-right, top-bottom)
4. No focus traps except in modals
```

### ✓ Test 3: Forms (1 min)
```
1. Tab to text input field
2. VoiceOver should announce: "[Label], text input, [required if applicable]"
3. Type some text
4. Tab to next field
5. If error occurs, should announce: "[Field] has error: [message]"
```

### ✓ Test 4: Buttons & Links (1 min)
```
1. Tab to button
2. Should hear: "[Label], button"
3. Tab to link
4. Should hear: "[Purpose], link"
5. Never just "Click here, link" or "button, button"
```

## Red Flags 🚩

These indicate accessibility problems:

| Symptom | Problem |
|---------|---------|
| Button announced as just "button" | Missing aria-label |
| Focus indicator not visible | CSS hiding focus outline |
| Link announces "click here, link" | Generic link text |
| Error appears but not linked to field | Missing aria-describedby |
| Modal doesn't trap focus | Missing role="dialog" |
| New message not announced | Missing aria-live region |
| Content only red/green to show status | Color alone for meaning |

## What to Check for Each Component

### 🔗 Links
- Purpose clear from text alone
- Not just "Click here", "Read more", "Link"
- Has proper href attribute
- ✅ Good: "View Sarah's profile"
- ❌ Bad: "Click here to see more"

### 🔘 Buttons
- Has descriptive aria-label for icon buttons
- State announced (aria-pressed, aria-expanded, etc.)
- ✅ Good: `<button aria-label="Like post">❤️</button>`
- ❌ Bad: `<button>❤️</button>`

### 📝 Form Fields
- Associated with `<label>` or aria-label
- Type announced (email, password, etc.)
- Required fields marked
- Errors linked with aria-describedby
- ✅ Good: `<input aria-label="Email" type="email" required />`
- ❌ Bad: `<input placeholder="Email" />`

### 🖼️ Images
- Descriptive alt text (not "image1.png")
- Decorative images marked alt=""
- Not redundant with surrounding text
- ✅ Good: `<img alt="Sarah's profile photo" src="..." />`
- ❌ Bad: `<img alt="photo" src="..." />`

### 📱 Modals
- Announced as dialog
- Title linked with aria-labelledby
- Focus trapped inside
- Escape key closes it
- ✅ Good: `<div role="dialog" aria-labelledby="title" aria-modal="true">`
- ❌ Bad: `<div class="modal-popup">`

### 🔔 Notifications
- Announced with live region
- Added to aria-live region
- Not too rapid (queue them)
- ✅ Good: `<div aria-live="polite" aria-atomic="true">`
- ❌ Bad: Text changes silently

## Quick Fix Commands

### Missing Button Label?
```jsx
// ❌ Before
<button>🔍</button>

// ✅ After - Option 1: aria-label
<button aria-label="Search">🔍</button>

// ✅ After - Option 2: Span with sr-only
<button>
  <span className="sr-only">Search</span>
  <span aria-hidden="true">🔍</span>
</button>
```

### Form Validation Error?
```jsx
// ❌ Before
<input type="email" />
{error && <span>{error}</span>}

// ✅ After
<input type="email" aria-describedby="email-error" />
{error && <span id="email-error" role="alert">{error}</span>}
```

### Modal Dialog?
```jsx
// ❌ Before
<div className="modal">
  <h2>Delete?</h2>
</div>

// ✅ After
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Delete?</h2>
  <button onClick={onClose} aria-label="Close dialog">×</button>
</div>
```

## Testing Scenarios

### Login Page
- [ ] Email label announced
- [ ] Password field announced as password input
- [ ] Error message linked to field
- [ ] Login button clearly labeled
- [ ] Can submit with keyboard (Enter key)
- [ ] Focus moves after successful login

### Feed/Post Browse
- [ ] Post structure clear
- [ ] Like button announces "Like post, button" or "Unlike post, button, pressed"
- [ ] Comment button announced
- [ ] All images have alt text
- [ ] User name announced with post
- [ ] Infinite scroll announced (new posts added)

### Create Post
- [ ] Caption input labeled
- [ ] Image upload button clear
- [ ] File name announced when selected
- [ ] Publish button labeled
- [ ] Required field indicators announced
- [ ] Success message announced after posting

### Direct Messages
- [ ] Sender/recipient clear
- [ ] Message thread structure logical
- [ ] Timestamp announced
- [ ] New messages announced
- [ ] Send button clear
- [ ] Text input labeled

## Troubleshooting

### "VoiceOver keeps reading everything"
- Press VO+A to stop (read all command)
- Use VO+→ and VO+← to move item by item
- Press VO+↑ to exit a container

### "I can't see the focus indicator"
- Might be hidden by CSS
- Check for `outline: none` without replacement
- Should be visible, contrasting color (usually blue)

### "Focus disappeared"
- May have moved to a hidden element
- Press VO+U to see where you are
- Tab backwards to get back

### "Screen reader says 'button' but nothing else"
- Missing aria-label
- Add `aria-label="Purpose of button"`
- E.g., `<button aria-label="Delete post">🗑</button>`

## Resources

- **VoiceOver Help**: Press VO+H to open help menu
- **WCAG 2.1 Checklist**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Examples**: https://www.w3.org/WAI/ARIA/apg/
- **Test in CI**: Add axe-core or pa11y to automated tests

## Report Issues

Found a problem?
1. Note the component/page
2. Describe what screen reader says (or doesn't say)
3. Describe what it should say
4. Add to SCREEN-READER-TESTING-REPORT.md

Example:
```
Component: PostCard Like Button
Problem: Announces "button" without purpose
Should be: "Like post, button" or "Unlike post, button, pressed"
```

---

**Last Updated:** November 24, 2025
**See Full Report:** SCREEN-READER-TESTING-REPORT.md
