# End Conversation Feature - Design Specification

## Overview
Users can end conversations using a hold-to-confirm button (like Pigeon ID regeneration). Ended conversations become **archived** (read-only) and move to the bottom of the list.

---

## Design Philosophy

### Key Concepts
- **Archived ≠ Deleted**: Conversations remain visible but read-only
- **Visual Continuity**: Users see their full conversation history
- **Reversible**: Can reconnect via new DM request
- **No Confirmation Dialog**: Hold-to-confirm provides clear intent
- **Natural Sorting**: Active conversations at top, archived at bottom

---

## UI Flow Illustration

### Step 1: Conversation View (Active State)

```
┌─────────────────────────────────────────┐
│  ←  👤 @sarah        INFJ        ⋮     │ ← Three-dot menu
├─────────────────────────────────────────┤
│                                         │
│  👤 Hey! How was your weekend?          │
│     2:14 PM                             │
│                                         │
│                    You did great! 😊  💬│
│                             2:15 PM     │
│                                         │
│  👤 Thanks! Want to grab coffee?        │
│     2:16 PM                             │
│                                         │
├─────────────────────────────────────────┤
│  Type a message...              [Send] │ ← Active input
└─────────────────────────────────────────┘
```

### Step 2: Three-Dot Menu Opened

```
┌─────────────────────────────────────────┐
│  ←  👤 @sarah        INFJ        ⋮     │
├─────────────────────────────────────────┤
│                            ┌──────────┐ │
│  👤 Hey! How was your    │ 🔴 End   │ │ ← Hold-to-confirm
│     2:14 PM              │Conversation│ │   button
│                          └──────────┘ │
│                    You did great! 😊  💬│
│                             2:15 PM     │
│                                         │
│  👤 Thanks! Want to grab coffee?        │
│     2:16 PM                             │
│                                         │
├─────────────────────────────────────────┤
│  Type a message...              [Send] │
└─────────────────────────────────────────┘
```

### Step 3: Hold-to-Confirm in Progress

```
┌─────────────────────────────────────────┐
│  ←  👤 @sarah        INFJ        ⋮     │
├─────────────────────────────────────────┤
│                            ┌──────────┐ │
│  👤 Hey! How was your    │ 🔴 End   │ │ ← Filling progress
│     2:14 PM              │[████░░░░]│ │   (2 seconds)
│                          │Hold to   │ │
│                          │confirm   │ │
│                          └──────────┘ │
│                    You did great! 😊  💬│
│                             2:15 PM     │
│                                         │
│  👤 Thanks! Want to grab coffee?        │
│     2:16 PM                             │
│                                         │
├─────────────────────────────────────────┤
│  Type a message...              [Send] │
└─────────────────────────────────────────┘
```

### Step 4: Conversation Archived (Read-Only State)

```
┌─────────────────────────────────────────┐
│  ←  👤 @sarah        INFJ             │ ← No menu
├─────────────────────────────────────────┤
│  ⚠️ This conversation has been ended   │ ← Status banner
│     Send a new DM request to reconnect │
├─────────────────────────────────────────┤
│                                         │
│  👤 Hey! How was your weekend?          │
│     2:14 PM                             │
│                                         │
│                    You did great! 😊  💬│
│                             2:15 PM     │
│                                         │
│  👤 Thanks! Want to grab coffee?        │
│     2:16 PM                             │
│                                         │
├─────────────────────────────────────────┤
│  📭 Conversation ended                  │ ← Disabled input
│     [Send DM Request]                   │ ← Action button
└─────────────────────────────────────────┘
```

---

## Conversation List Sorting

### Before: All Active

```
┌─────────────────────────────────────┐
│  Messages                           │
├─────────────────────────────────────┤
│  ✅ Conversations (3)               │
│                                     │
│  🟢 @john        ENTP         2m   │ ← Unread (2)
│  "Hey! Let's meet up..."            │
│                                     │
│  ⚪ @sarah       INFJ        1h   │
│  "You: Thanks for the advice"       │
│                                     │
│  ⚪ @mike        ISTP        2d   │
│  "You: See you tomorrow!"           │
│                                     │
│  📬 Requests (0)                    │
└─────────────────────────────────────┘
```

### After: Active + Archived (Sorted)

```
┌─────────────────────────────────────┐
│  Messages                           │
├─────────────────────────────────────┤
│  ✅ Conversations (3)               │
│                                     │
│  🟢 @john        ENTP         2m   │ ← Active, unread
│  "Hey! Let's meet up..."            │
│                                     │
│  ⚪ @mike        ISTP        2d   │ ← Active, read
│  "You: See you tomorrow!"           │
│                                     │
│  📦 @sarah       INFJ        1h   │ ← Archived (greyed)
│  "You: Thanks for the advice"       │   No unread badge
│  ↳ Ended                            │   Status indicator
│                                     │
│  📬 Requests (0)                    │
└─────────────────────────────────────┘
```

**Sorting Logic:**
1. **Active conversations** (unread first, then read)
2. **Invisible separator** (no visual line)
3. **Archived conversations** (sorted by last message time)

---

## Visual Design Specifications

### Hold-to-Confirm Button

#### Default State
```css
Background: #DC2626 (red-600)
Text: white
Icon: X (lucide-react)
Border: none
Border-radius: 8px
Padding: 8px 12px
Font-size: 14px
```

#### Holding State
```css
Background: Linear gradient overlay
- Base: #DC2626
- Progress: rgba(220, 38, 38, 0.6)
Progress bar: Left-to-right fill (2 seconds)
Text: "Hold to confirm"
```

#### Disabled State (while archiving)
```css
Background: #9CA3AF (gray-400)
Text: "Ending..."
Cursor: not-allowed
Opacity: 0.6
```

### Archived Conversation Card

#### List View
```css
Opacity: 0.6
Background: No hover effect
Border: 1px solid #E5E7EB (gray-200)
Icon: 📦 (archive box emoji or icon)
Status text: "Ended" in gray-500
No unread badge
Pointer events: none on card body
Click: Opens read-only view
```

#### Detail View Banner
```css
Background: #FEF3C7 (yellow-50)
Border: 1px solid #FCD34D (yellow-300)
Icon: ⚠️ (warning)
Text color: #92400E (yellow-900)
Padding: 12px 16px
Font-size: 14px
```

### Message Input (Archived State)

```css
Disabled: true
Background: #F3F4F6 (gray-100)
Border: 1px solid #E5E7EB (gray-200)
Placeholder: "📭 Conversation ended"
Color: #9CA3AF (gray-400)
Cursor: not-allowed
```

**Action Button:**
```css
Button: "Send DM Request"
Variant: primary
Width: 100%
Margin-top: 8px
```

---

## Technical Implementation Overview

### Backend Changes

#### 1. Update Conversation Model
```javascript
// apps/api/src/models/Conversation.js

status: {
  type: String,
  enum: ['pending', 'approved', 'closed', 'archived'],  // Add 'archived'
  default: 'pending',
}
```

#### 2. Update endConversation Controller
```javascript
// Set status to 'archived' instead of 'closed'
conversation.status = 'archived';
await conversation.save();
```

#### 3. Update getConversations Controller
```javascript
// Include archived conversations
const conversations = await Conversation.find({
  $or: [{ user1Id: user.userId }, { user2Id: user.userId }],
  status: { $in: ['approved', 'archived'] }  // Include both
});

// Sort: approved first, then archived
const sortedConversations = conversations.sort((a, b) => {
  if (a.status === 'approved' && b.status === 'archived') return -1;
  if (a.status === 'archived' && b.status === 'approved') return 1;
  // Same status - sort by last message
  return getLastMessageTime(b) - getLastMessageTime(a);
});
```

#### 4. Update acceptDMRequest
```javascript
// Find archived or closed conversation
const conversation = await Conversation.findOne({
  $or: [...],
  status: { $in: ['closed', 'archived'] }
});

if (conversation) {
  conversation.status = 'approved';  // Reopen
  await conversation.save();
}
```

### Frontend Changes

#### 1. ConversationView Component

**Add State:**
```typescript
const [endProgress, setEndProgress] = useState(0);
const endTimerRef = useRef<number | null>(null);
const endIntervalRef = useRef<number | null>(null);
```

**Hold-to-Confirm Handlers:**
```typescript
const handleEndMouseDown = () => {
  if (endMutation.isPending) return;
  
  setEndProgress(0);
  const startTime = Date.now();
  const holdDuration = 2000;
  
  endIntervalRef.current = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min((elapsed / holdDuration) * 100, 100);
    setEndProgress(progress);
  }, 50);
  
  endTimerRef.current = setTimeout(() => {
    clearInterval(endIntervalRef.current!);
    setEndProgress(100);
    endMutation.mutate(conversationId);
  }, holdDuration);
};

const handleEndMouseUp = () => {
  if (endTimerRef.current) clearTimeout(endTimerRef.current);
  if (endIntervalRef.current) clearInterval(endIntervalRef.current);
  setEndProgress(0);
};
```

**Replace Menu with Button:**
```tsx
{activeConversation?.status !== 'archived' && (
  <button
    type="button"
    onMouseDown={handleEndMouseDown}
    onMouseUp={handleEndMouseUp}
    onMouseLeave={handleEndMouseUp}
    onTouchStart={handleEndMouseDown}
    onTouchEnd={handleEndMouseUp}
    disabled={endMutation.isPending}
    className="relative px-3 py-1.5 text-sm font-medium text-white bg-red-600 
               rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors overflow-hidden"
  >
    {/* Progress overlay */}
    {endProgress > 0 && (
      <div 
        className="absolute inset-0 bg-red-400/40 transition-all"
        style={{ width: `${endProgress}%` }}
      />
    )}
    
    <span className="relative z-10 flex items-center gap-1.5">
      <X className="h-4 w-4" />
      {endMutation.isPending 
        ? 'Ending...' 
        : endProgress > 0 
        ? 'Hold to confirm' 
        : 'End Conversation'
      }
    </span>
  </button>
)}
```

**Archived State Banner:**
```tsx
{activeConversation?.status === 'archived' && (
  <div className="px-4 py-3 bg-yellow-50 border-b border-yellow-300 
                  flex items-center gap-2 text-sm text-yellow-900">
    <span className="text-lg">⚠️</span>
    <div className="flex-1">
      <p className="font-medium">This conversation has been ended</p>
      <p className="text-xs text-yellow-800">
        Send a new DM request to reconnect
      </p>
    </div>
  </div>
)}
```

**Disabled Input:**
```tsx
{activeConversation?.status === 'archived' ? (
  <div className="p-4 bg-gray-50 border-t border-gray-200">
    <div className="flex items-center justify-center gap-2 py-3 
                    bg-gray-100 border border-gray-200 rounded-lg
                    text-gray-400 cursor-not-allowed">
      <span className="text-lg">📭</span>
      <span className="text-sm">Conversation ended</span>
    </div>
    <Button
      variant="primary"
      size="md"
      className="w-full mt-2"
      onClick={() => {/* Open DM request modal */}}
    >
      Send DM Request
    </Button>
  </div>
) : (
  <MessageInput onSend={handleSendMessage} disabled={sendMessageMutation.isPending} />
)}
```

#### 2. ConversationList Component

**Sorting Logic:**
```typescript
const sortedConversations = useMemo(() => {
  if (!conversations) return [];
  
  const active = conversations.filter(c => c.status === 'approved');
  const archived = conversations.filter(c => c.status === 'archived');
  
  // Sort active: unread first, then by time
  active.sort((a, b) => {
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    return getLastMessageTime(b) - getLastMessageTime(a);
  });
  
  // Sort archived by time
  archived.sort((a, b) => getLastMessageTime(b) - getLastMessageTime(a));
  
  return [...active, ...archived];
}, [conversations]);
```

**Archived Card Style:**
```tsx
<button
  key={conversation._id}
  onClick={() => navigate(`/messages/${conversation._id}`)}
  className={`flex w-full items-center gap-3 rounded-lg border p-3 transition-all
    ${conversation.status === 'archived'
      ? 'opacity-60 border-gray-200 bg-gray-50 cursor-default' 
      : 'border-gray-200 bg-white hover:border-brand-primary hover:bg-gray-50'
    }`}
>
  {/* Avatar */}
  <Avatar 
    src={otherUser?.profilePictureUrl} 
    alt={otherUser?.username || 'User'} 
    size="md"
    className={conversation.status === 'archived' ? 'grayscale' : ''}
  />
  
  {/* Content */}
  <div className="flex-1 overflow-hidden text-left">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${
          conversation.status === 'archived' ? 'text-gray-500' : 'text-gray-900'
        }`}>
          {otherUser?.username || 'Unknown'}
        </span>
        
        {conversation.status === 'archived' && (
          <span className="text-xs text-gray-400">📦 Ended</span>
        )}
      </div>
      
      {lastMessage && conversation.status !== 'archived' && (
        <span className="text-xs text-gray-500">
          {formatRelativeTime(lastMessage.timestamp)}
        </span>
      )}
    </div>
    
    {/* Last message preview */}
    {lastMessage && (
      <p className={`truncate text-sm ${
        conversation.status === 'archived' ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {lastMessage.senderId === user?._id && 'You: '}
        {lastMessage.body}
      </p>
    )}
  </div>
  
  {/* Unread badge (only for active) */}
  {conversation.status !== 'archived' && unreadCount > 0 && (
    <Badge variant="notification" size="sm">
      {unreadCount}
    </Badge>
  )}
</button>
```

---

## User Experience Flow

### Scenario 1: User Ends Conversation

1. User opens conversation with @sarah
2. Sees "End Conversation" button in header
3. Presses and holds button for 2 seconds
4. Progress bar fills (visual feedback)
5. After 2 seconds, conversation archived
6. Banner appears: "This conversation has been ended"
7. Input disabled, shows "Send DM Request" button
8. Returns to messages list
9. @sarah's conversation at bottom, greyed out, marked "📦 Ended"

### Scenario 2: User Wants to Reconnect

1. User sees archived conversation in list
2. Clicks on it to view history
3. Sees banner about ending and reconnection option
4. Clicks "Send DM Request" button
5. DM Request modal opens (existing component)
6. Sends request to @sarah
7. @sarah accepts request
8. Conversation reopens (status → 'approved')
9. Moves back to top of list
10. Input enabled again
11. Full message history intact

### Scenario 3: Other User Initiates Reconnection

1. @sarah wants to reconnect with user
2. Goes to user's profile
3. Clicks "Message" button
4. System finds archived conversation
5. Opens DM Request modal (not blocked)
6. @sarah sends request
7. User accepts
8. Backend reopens archived conversation
9. Both see active conversation with full history

---

## Edge Cases & Considerations

### 1. Both Users End Conversation
- First user archives it → moves to bottom for both
- Second user sees archived state when they open it
- Either can send DM request to reconnect

### 2. Message Sending While Archiving
- Disable "End Conversation" button during message send
- Prevent race conditions

### 3. Hold Interaction on Mobile
- Touch events (`onTouchStart`, `onTouchEnd`)
- Haptic feedback when complete (if available)
- Clear visual progress

### 4. Accidental Release
- Progress resets if released early
- No confirmation dialog needed (hold is the confirmation)

### 5. Navigate Away During Hold
- Clean up timers on unmount
- No side effects if user navigates mid-hold

### 6. Multiple Devices
- If archived on device A, reflects on device B via API
- Real-time sync via query invalidation

---

## Accessibility

### Hold-to-Confirm Button
```tsx
<button
  type="button"
  aria-label="Hold to end conversation"
  aria-describedby="end-conversation-hint"
  // ... handlers
>
  <span id="end-conversation-hint" className="sr-only">
    Press and hold for 2 seconds to end this conversation. 
    You can reconnect later by sending a new DM request.
  </span>
</button>
```

### Archived State Banner
```tsx
<div role="alert" aria-live="polite">
  This conversation has been ended. 
  Send a new DM request to reconnect.
</div>
```

### Disabled Input
```tsx
<div 
  role="textbox" 
  aria-disabled="true"
  aria-label="Conversation ended, messaging disabled"
>
  📭 Conversation ended
</div>
```

---

## Benefits of This Design

### ✅ No Confirmation Dialog
- Cleaner UX (no modal interruption)
- Hold-to-confirm prevents accidents
- Consistent with Pigeon ID regeneration

### ✅ Visual Continuity
- Users see full conversation history
- No confusion about "where did it go?"
- Archived state clearly marked

### ✅ Natural Sorting
- Active conversations prioritized
- Archived stays accessible but out of the way
- Like Gmail's read vs unread grouping

### ✅ Reversible
- Easy reconnection path
- "Send DM Request" button right there
- No data loss

### ✅ Mobile-Friendly
- Hold gesture works on touch
- No complex menu navigation
- Clear visual feedback

---

## Summary

This design provides a **natural, reversible, and user-friendly** way to end conversations while maintaining history and enabling easy reconnection. The hold-to-confirm pattern prevents accidents without dialog interruptions, and the archived state keeps conversations accessible but de-emphasized.

**Key Innovation:** Treating ended conversations like "archived emails" rather than deleted ones - they're still there, just moved down and read-only until both parties want to reconnect.
