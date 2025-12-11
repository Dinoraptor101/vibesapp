# Required data-testid Attributes for E2E Tests

This document lists all `data-testid` attributes referenced in the test suite. Use this as a checklist when implementing or updating Web V2 components.

## Admin Dashboard

```typescript
// Dashboard Page
'admin-dashboard-title'        // Dashboard page title
'admin-dashboard-loading'      // Loading spinner on dashboard
'admin-metrics-container'      // Container for metrics cards
'admin-metrics-refresh'        // Refresh button for metrics (optional)
'admin-activity-chart'         // Activity chart component

// Metrics Cards
'metric-card-active-users'     // Active users metric card
'metric-card-posts-today'      // Posts today metric card
'metric-card-reports-today'    // Reports today metric card
'metric-card-auto-hidden'      // Auto-hidden posts metric card
'metric-card-title'            // Title within a metric card
'metric-card-value'            // Value within a metric card
'metric-card-subtitle'         // Subtitle within a metric card (optional)
'metric-card-trend'            // Trend indicator within a metric card (optional)

// Admin Navigation
'admin-header'                 // Admin layout header
'admin-nav-dashboard'          // Dashboard nav link
'admin-nav-dashboard-text'     // Dashboard nav link text (hidden on mobile)
'admin-nav-flagged-posts'      // Flagged Posts nav link
'admin-nav-users'              // Users nav link
'admin-nav-settings'           // Settings nav link
```

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

// Support Tab
'support-section'           // Support section tab button
'support-tab-content'       // Support tab content container
'support-telegram-button'   // Telegram support button

// Feedback Form (in Support Tab)
'feedback-type-bug'         // Bug type label
'feedback-type-feature'     // Feature type label
'feedback-type-toggle'      // Toggle button between bug/feature
'feedback-priority-select'  // Priority dropdown (bug reports only)
'feedback-title-input'      // Title input field
'feedback-description-input' // Description textarea
'feedback-screenshot-input' // Screenshot upload input (bug reports only)
'feedback-submit-button'    // Submit feedback button
'feedback-success-message'  // Success message after submission
'feedback-error-message'    // Error message on submission failure
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
'decline-request-button'  // Decline DM request
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
'conversation-back-button'    // Back button in conversation
'conversation-avatar'     // Avatar in conversation header
'conversation-username'   // Username in conversation header (also used in preview)
'end-conversation-button' // Hold-to-confirm end conversation button
'message-{id}'            // Individual message (dynamic)
'message-content'         // Message content bubble
'message-timestamp'       // Timestamp on message
'message-input'           // Message input field
'send-message-button'     // Send message button
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

## Admin - Flagged Posts Management

```typescript
// Page Structure
'flagged-posts-title'           // Page title/header
'flagged-posts-list'            // Container for flagged posts list
'flagged-posts-empty'           // Empty state when no flagged posts
'flagged-posts-loading'         // Loading indicator
'flagged-posts-error'           // Error state display
'retry-button'                  // Retry button for error state

// Flagged Post Card
'flagged-post-card-{postId}'    // Individual flagged post card (dynamic)
'post-thumbnail'                // Post thumbnail image container
'post-caption'                  // Post caption (HTML rich text)
'report-count-badge'            // Badge showing 🚩 X reports
'report-breakdown'              // Report breakdown by reason (pornographic, spam, hate_speech)
'post-checkbox'                 // Checkbox for bulk selection
'post-detail-link'              // Clickable link to post detail page

// Filter Dropdown
'filter-dropdown'               // Filter dropdown trigger
'filter-option-all'             // "All" filter option
'filter-option-auto-hidden'     // "Auto-Hidden" filter option
'filter-option-under-review'    // "Under Review" filter option

// Sort Dropdown
'sort-dropdown'                 // Sort dropdown trigger
'sort-option-most-reports'      // "Most Reports" sort option
'sort-option-most-recent'       // "Most Recent" sort option
'sort-option-oldest-first'      // "Oldest First" sort option

// Actions
'delete-post-button'            // Delete single post button
'dismiss-reports-button'        // Dismiss reports button
'confirm-delete-button'         // Confirm single delete in modal
'confirm-dismiss-button'        // Confirm dismiss in modal

// Bulk Selection
'select-all-checkbox'           // Select/deselect all posts checkbox
'bulk-action-bar'               // Bulk action bar (appears when posts selected)
'selection-count'               // Display selected posts count
'bulk-delete-button'            // Bulk delete button
'confirm-bulk-delete-button'    // Confirm bulk delete in modal

// Detail Page
'flagged-post-detail'           // Flagged post detail page container
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

## Admin User Management

```typescript
// Users Page
'users-table'                 // Main users table container (NEW)
'users-search-input'          // Search users by username
'users-filter-select'         // Filter dropdown (all, active, banned)
'users-loading'               // Loading state indicator
'users-empty-state'           // Empty state when no users match
'select-all-checkbox'         // Select all users checkbox (table header)
'sort-userName'               // Sort by username button (NEW)
'sort-mbtiPersonality'        // Sort by MBTI button (NEW)
'sort-masculineFeminineScale' // Sort by polarity button (NEW)
'sort-isBanned'               // Sort by status button (NEW)
'sort-postCount'              // Sort by post count button (NEW)

// User Card/Row (Table Layout)
'user-row-{userId}'           // Individual user table row (dynamic)
'user-username'               // User username display (clickable - view details)
'user-post-count'             // Post count (clickable - view posts) (NEW)
'online-indicator'            // Online status indicator (NEW)
'user-banned-badge'           // Badge indicating user is banned
'toggle-ban-button'           // Toggle ban on/off button
'regenerate-password-button'  // Regenerate user password button
'view-user-details-button'    // Navigate to user detail page

// User Detail Page
'user-detail-header'          // User detail page header
'user-detail-username'        // Username on detail page
'user-detail-pigeon-id'       // Pigeon ID on detail page
'user-posts-section'          // Section showing user's posts
'user-activity-summary'       // User activity/stats summary
'user-strike-count'           // Display of user's strike count
'full-ban-button'             // Apply full ban (Strike 4)
'delete-all-posts-button'     // Delete all user posts button
'soft-delete-user-button'     // Soft delete user button
'back-to-users'               // Back to users list button

// Confirmation Dialogs
'confirm-regenerate-dialog'   // Confirm password regeneration
'confirm-regenerate-button'   // Confirm button in dialog
'new-password-modal'          // Modal showing new password
'generated-password'          // Display of generated password
'confirm-delete-posts-dialog' // Confirm delete all posts
'cancel-delete-posts-button'  // Cancel delete posts
'confirm-soft-delete-dialog'  // Confirm soft delete user
'cancel-soft-delete-button'   // Cancel soft delete
'confirm-full-ban-dialog'     // Confirm full ban (Strike 4)
'confirm-full-ban-button'     // Confirm full ban button

// Admin Post Management
'admin-post-{postId}'         // Individual admin post card (dynamic)
'post-hidden-indicator'       // Indicator that post is hidden
'restore-post-button'         // Restore hidden post button
'confirm-restore-dialog'      // Confirm restore post dialog
'confirm-restore-button'      // Confirm restore button

// Pagination
'pagination-controls'         // Pagination controls container
'pagination-info'             // Page info display (e.g., "Page 1 of 5")
'pagination-next'             // Next page button
'pagination-prev'             // Previous page button
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

### Priority 6: Admin User Management
- [ ] Users list page with search and filters
- [ ] User card with username, pigeon ID, banned status
- [ ] Toggle ban button (simple on/off)
- [ ] Regenerate password with modal showing new password
- [ ] User detail page with posts and actions
- [ ] Delete all posts confirmation dialog
- [ ] Soft delete user confirmation dialog
- [ ] Full ban (Strike 4) with confirmation
- [ ] Restore hidden post functionality
- [ ] Pagination controls for users list

### Priority 7: Admin Flagged Posts Management
- [ ] Flagged posts list page with title and list container
- [ ] FlaggedPostCard with thumbnail, caption (HTML rich text), badges
- [ ] Report count badge (🚩 X reports format)
- [ ] Report breakdown by reason (pornographic, spam, hate_speech)
- [ ] Filter dropdown (All, Auto-Hidden, Under Review)
- [ ] Sort dropdown (Most Reports, Most Recent, Oldest First)
- [ ] Delete single post with confirmation dialog
- [ ] Dismiss reports functionality
- [ ] Bulk selection with checkboxes
- [ ] Select all checkbox functionality
- [ ] Bulk action bar with selection count
- [ ] Bulk delete with confirmation dialog
- [ ] Navigation to post detail page (/admin/flagged/:postId)
- [ ] Loading and error states with retry button

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
