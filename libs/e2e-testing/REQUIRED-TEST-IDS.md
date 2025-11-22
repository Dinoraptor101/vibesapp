# Required data-testid Attributes for E2E Tests

This document lists all `data-testid` attributes referenced in the test suite. Use this as a checklist when implementing or updating Web V2 components.

## Navigation & Layout

```typescript
'nav-home'              // Home/Feed navigation button
'nav-messages'          // Messages navigation button
'nav-discover'          // Discover/Explore navigation button
'tab-activities'        // Activities tab
'tab-create-post'       // Create post tab/button
'user-menu-button'      // User menu dropdown trigger
'user-profile-button'   // Navigate to own profile
'theme-toggle-button'   // Theme switcher button
```

## Account Settings & Preferences

```typescript
'settings-menu-item'         // Settings option in user menu
'preferences-section'        // Preferences section in settings
'privacy-section'           // Privacy section in settings
'account-section'           // Account info section
'notifications-section'     // Notifications section (optional)

// Settings Fields
'proximity-input'           // Proximity range input
'mbti-visibility-toggle'    // Toggle MBTI display on profile
'location-sharing-toggle'   // Toggle location sharing
'like-notifications-toggle' // Toggle like notifications
'message-notifications-toggle'  // Toggle message notifications
'follow-notifications-toggle'   // Toggle follow notifications
'save-settings-button'      // Save settings button

// Account Info Display
'account-username'          // Username display
'account-pigeon-id'         // Pigeon ID display
'account-created-date'      // Account creation date
```

## Theme Switching

```typescript
'theme-toggle-button'    // Theme switcher button
'dark-theme-option'      // Dark theme option
'light-theme-option'     // Light theme option
```

Note: Theme is stored on `<html>` element as `data-theme` attribute

## Posts & Feed

```typescript
'post-{postId}'           // Individual post card (dynamic)
'post-username'           // Post author username
'create-post-button'      // Open create post modal
'heart-button'            // Like/heart button on post
'comment-input'           // Comment input field
'comment-card'            // Individual comment
```

## Messages & Conversations

```typescript
// DM Requests
'dm-requests-tab'         // DM requests tab
'dm-requests-list'        // Container for DM requests
'dm-request-{id}'         // Individual DM request (dynamic)
'requester-username'      // Username in request
'requester-avatar'        // Avatar in request
'request-message'         // Message in request
'accept-request-button'   // Accept DM request
'reject-request-button'   // Reject DM request
'dm-requests-empty-state' // Empty state for no requests

// Conversations
'conversations-tab'       // Conversations tab
'conversations-list'      // Container for conversations
'conversation-{id}'       // Individual conversation item (dynamic)
'conversation-username'   // Username in conversation preview
'conversation-last-message'   // Last message preview
'conversation-timestamp'  // Timestamp in conversation preview

// Conversation View
'conversation-view'       // Main conversation view container
'conversation-header'     // Conversation header
'message-{id}'            // Individual message (dynamic)
'message-input'           // Message input field
'send-message-button'     // Send message button
'message-status-sent'     // Sent status indicator
'message-timestamp'       // Message timestamp
'conversation-options-button'  // Conversation options menu
'end-conversation-button' // End conversation option
'confirm-end-conversation'    // Confirm end conversation
```

## Following & Social

```typescript
// User Cards & Profiles
'user-card-{userId}'      // User card in discover (dynamic)
'follow-button'           // Follow button
'unfollow-button'         // Unfollow button
'user-options-button'     // User options menu

// Following/Followers Lists
'following-tab'           // Following tab
'followers-tab'           // Followers tab
'following-list'          // Following list container
'followers-list'          // Followers list container
'following-user-{id}'     // Individual following user (dynamic)
'follower-user-{id}'      // Individual follower (dynamic)
'following-count'         // Following count display
'followers-count'         // Followers count display

// Confirm Dialogs
'confirm-unfollow-button' // Confirm unfollow action
```

## Privacy & Blocking

```typescript
'block-user-button'       // Block user option
'confirm-block-button'    // Confirm block action
'view-blocked-users-button'   // Open blocked users list
'blocked-users-list'      // Blocked users list container
'blocked-user-{id}'       // Individual blocked user (dynamic)
'unblock-button'          // Unblock button
'confirm-unblock-button'  // Confirm unblock action
```

## Login & Registration

```typescript
'pigeon-id-input'         // Pigeon ID input for login
'login-existing-button'   // Login button
'username-input'          // Username input for registration
'birthYear-selected'      // Birth year dropdown
'birthYear-option-{year}' // Birth year option (dynamic)
'birthMonth-selected'     // Birth month dropdown
'birthMonth-option-{month}'  // Birth month option (dynamic)
'sex-selected'            // Sex dropdown
'sex-option-{value}'      // Sex option (dynamic)
'register-button'         // Register button
```

## Activities

```typescript
'activity-list'           // Activities container
'activity-item'           // Individual activity item
```

## Toast Notifications

```typescript
'toast-success'           // Success toast notification
'toast-error'             // Error toast notification
'toast'                   // General toast notification
```

## Implementation Checklist

### Priority 1: Settings & Preferences
- [ ] Settings page with all sections
- [ ] Proximity input field
- [ ] MBTI visibility toggle
- [ ] Location sharing toggle
- [ ] Notification toggles
- [ ] Save button with success feedback

### Priority 2: Messaging
- [ ] DM requests tab and list
- [ ] Accept/reject buttons
- [ ] Conversations list
- [ ] Conversation view
- [ ] Message input and send
- [ ] Message timestamps and status

### Priority 3: Following System
- [ ] Follow/unfollow buttons
- [ ] Following/followers tabs
- [ ] Following/followers lists
- [ ] Follow counts display

### Priority 4: Privacy
- [ ] Block user functionality
- [ ] Blocked users list
- [ ] Unblock functionality

### Priority 5: Theme Switching
- [ ] Theme toggle button
- [ ] Theme persistence
- [ ] data-theme attribute on HTML element

## Testing Best Practices

1. **Unique IDs**: Use descriptive, unique test IDs
2. **Dynamic IDs**: For lists, use `data-testid="item-{id}"` pattern
3. **Consistency**: Use kebab-case for all test IDs
4. **Semantic Names**: Test ID should describe the element's purpose
5. **Stable Selectors**: Prefer test IDs over CSS classes or element types

## Example Implementation

```tsx
// ✅ Good
<button data-testid="follow-button" onClick={handleFollow}>
  Follow
</button>

// ✅ Good (dynamic)
<div data-testid={`conversation-${conversationId}`}>
  {/* conversation content */}
</div>

// ❌ Bad (no test ID)
<button className="follow-btn" onClick={handleFollow}>
  Follow
</button>

// ❌ Bad (unclear)
<button data-testid="btn1" onClick={handleFollow}>
  Follow
</button>
```

## Notes

- All test IDs should be added to components during implementation
- Tests will fail gracefully if elements are not found (timeout)
- Some tests check for element visibility conditionally
- Empty state handling is included in tests (e.g., no DM requests)
