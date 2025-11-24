# Login Screen - Manual Testing Checklist

**Date:** November 7, 2025  
**Phase:** 2.3 - Login Screen  
**URL:** http://localhost:5173/login

---

## 🧪 Functional Tests

### Basic Form Rendering
- [ ] Navigate to http://localhost:5173/login
- [ ] Page loads without errors in console
- [ ] "Welcome Back" heading visible
- [ ] "Enter your Pigeon ID to continue" subtext visible
- [ ] Single input field labeled "Pigeon ID" visible
- [ ] Helper text "Your unique Pigeon ID is your password" visible
- [ ] Eye icon (password toggle) visible in input
- [ ] "Lost your Pigeon ID?" link visible
- [ ] "Log In" button visible and enabled
- [ ] "Don't have an account? Sign up" link visible at bottom

### Form Interaction
- [ ] Click input field - receives focus
- [ ] Type text - appears as dots (password masked)
- [ ] Click eye icon - password becomes visible
- [ ] Click eye icon again - password hidden again
- [ ] Tab key moves focus to next element
- [ ] Enter key submits form (when field has value)

### Validation
- [ ] Click "Log In" with empty field - shows error "Please enter your Pigeon ID"
- [ ] Error message has red background and AlertCircle icon
- [ ] Type in field - error disappears
- [ ] Enter invalid Pigeon ID - shows "Invalid Pigeon ID" error after API call

### Login Flow (with valid Pigeon ID)
- [ ] Enter valid Pigeon ID from database/signup
- [ ] Click "Log In" button
- [ ] Button shows loading spinner
- [ ] Button text changes to "Logging in..."
- [ ] Input field becomes disabled
- [ ] After success, redirects to home page (/)
- [ ] Check browser DevTools → Application → Cookies
- [ ] Cookie `vibesUserId` is set with correct user ID

### Forgot Password Modal
- [ ] Click "Lost your Pigeon ID?" link
- [ ] Modal opens with overlay
- [ ] Modal title: "Lost Your Pigeon ID?"
- [ ] Modal shows 4-step admin contact instructions
- [ ] Modal has gray info box with detailed steps
- [ ] Modal has security note at bottom
- [ ] Click "Got it" button - modal closes
- [ ] Click outside modal - modal closes
- [ ] Press ESC key - modal closes

### Navigation
- [ ] Click "Sign up" link
- [ ] Navigates to /signup page
- [ ] Press browser back button
- [ ] Returns to /login page

---

## 🎨 UI/UX Tests

### Layout & Spacing
- [ ] Form is centered vertically on screen
- [ ] Form is centered horizontally on screen
- [ ] Card has max-width constraint (~400px)
- [ ] Card has proper padding (16px)
- [ ] All elements have proper spacing (gaps)
- [ ] No elements overlap
- [ ] Background is theme surface color

### Typography
- [ ] Heading is large and bold (3xl)
- [ ] Heading color is brand purple
- [ ] Subtext is muted secondary color
- [ ] Error text is readable and properly sized
- [ ] Helper text is smaller and muted

### Colors & Theme
- [ ] Card has visible border
- [ ] Input has clear border
- [ ] Button is primary purple color
- [ ] Error box has red background
- [ ] All text is readable against backgrounds

### Interactive States
- [ ] Hover input - border changes color
- [ ] Focus input - has focus ring
- [ ] Hover "Log In" button - background darkens
- [ ] Hover links - underline appears
- [ ] Disabled button - looks visually disabled
- [ ] Loading button - cursor shows waiting state

### Responsive Design
- [ ] Form looks good at desktop width (1920px)
- [ ] Form looks good at tablet width (768px)
- [ ] Form looks good at mobile width (375px)
- [ ] Card never exceeds screen width
- [ ] Padding maintains on small screens
- [ ] Text remains readable at all sizes

---

## 🌓 Theme Tests

### Light Theme
- [ ] Switch to light theme (if not default)
- [ ] Background is light gray
- [ ] Card is white
- [ ] Text is dark/black
- [ ] Input border is visible
- [ ] Error box has light red background
- [ ] All elements contrast properly

### Dark Theme
- [ ] Switch to dark theme
- [ ] Background is dark gray/black
- [ ] Card is dark with lighter border
- [ ] Text is white/light gray
- [ ] Input border is visible
- [ ] Error box has dark red background
- [ ] All elements contrast properly

### Dim Theme
- [ ] Switch to dim theme
- [ ] Background is medium dark
- [ ] Card stands out from background
- [ ] Text is readable
- [ ] All elements have proper contrast

---

## ♿ Accessibility Tests

### Keyboard Navigation
- [ ] Can reach all interactive elements with Tab
- [ ] Focus order is logical (input → forgot link → button → signup link)
- [ ] Each focused element has visible focus ring
- [ ] Enter key on input submits form
- [ ] Enter key on forgot link opens modal
- [ ] Escape key closes modal
- [ ] Tab inside modal stays trapped

### Screen Reader (Optional)
- [ ] Input has proper label association
- [ ] Error messages are announced
- [ ] Loading state is announced ("Logging in...")
- [ ] Modal title is announced when opened
- [ ] "Got it" button is announced as button

### ARIA Attributes
- [ ] Input has `aria-invalid` when error present
- [ ] Input has `aria-describedby` for helper text
- [ ] Error div has `role="alert"`
- [ ] Modal has proper ARIA labels

---

## 🔐 Security Tests

### Password Handling
- [ ] Password field has `type="password"` attribute
- [ ] Password is masked by default (shows dots)
- [ ] Toggle icon allows showing plain text
- [ ] Password is hidden again when toggling off
- [ ] Password never logged to console
- [ ] Password sent securely over HTTPS (in production)

### Form Attributes
- [ ] Input has `autocomplete="current-password"`
- [ ] Form prevents default submission (no page reload)
- [ ] No XSS vulnerabilities in error messages

---

## 🐛 Error Handling Tests

### Network Errors
- [ ] Disconnect internet
- [ ] Try to log in
- [ ] Shows appropriate error message
- [ ] Reconnect internet
- [ ] Can retry login successfully

### Backend Errors
- [ ] Backend returns 401 - shows "Invalid Pigeon ID"
- [ ] Backend returns 500 - shows generic error
- [ ] Error persists until user types again
- [ ] Multiple failed attempts don't crash app

---

## 📊 Performance Tests

### Loading Times
- [ ] Page loads in < 1 second
- [ ] No visible layout shift
- [ ] Images/icons load smoothly
- [ ] No flickering during theme switch

### Interactions
- [ ] Typing in input is responsive
- [ ] Button click responds immediately
- [ ] Modal opens smoothly (no lag)
- [ ] Theme switch is instant

---

## ✅ Final Checklist

- [ ] All functional tests pass
- [ ] All UI/UX tests pass
- [ ] All theme tests pass
- [ ] All accessibility tests pass
- [ ] All security tests pass
- [ ] All error handling tests pass
- [ ] All performance tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] TypeScript compiles without errors
- [ ] Build succeeds (npm run build)
- [ ] Dev server runs without errors

---

## 📝 Notes

**Tested by:** ___________  
**Date:** ___________  
**Browser:** ___________  
**OS:** ___________

**Issues found:**
- 
- 
- 

**Additional comments:**
- 
- 
