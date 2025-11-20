# End Conversation Feature - Visual Mockups

## 🎨 Interface Illustrations

### 1. Conversation Header - Normal State

```
┌─────────────────────────────────────────────────────────┐
│  ←  👤 @sarah        INFJ      [End Conversation] 🔴   │
│                                                         │
│  Active conversation - you can send messages           │
└─────────────────────────────────────────────────────────┘
```

### 2. Hold-to-Confirm Animation Sequence

#### A. Initial Press (0%)
```
┌──────────────────────────┐
│  🔴 End Conversation    │  ← Red button, normal state
└──────────────────────────┘
```

#### B. Holding (25%)
```
┌──────────────────────────┐
│  [██░░░░░░░░░░░░]       │  ← Progress bar starts filling
│  Hold to confirm        │  ← Text changes
└──────────────────────────┘
```

#### C. Holding (50%)
```
┌──────────────────────────┐
│  [████████░░░░░░]       │  ← Halfway there
│  Hold to confirm        │
└──────────────────────────┘
```

#### D. Holding (75%)
```
┌──────────────────────────┐
│  [████████████░░]       │  ← Almost complete
│  Hold to confirm        │
└──────────────────────────┘
```

#### E. Complete (100%)
```
┌──────────────────────────┐
│  [████████████████]     │  ← Fully filled
│  Ending...              │  ← Action triggered
└──────────────────────────┘
```

#### F. Released Early
```
┌──────────────────────────┐
│  🔴 End Conversation    │  ← Resets back to initial
└──────────────────────────┘
```

---

## 3. Full Conversation View States

### A. ACTIVE CONVERSATION (Current)
```
╔═══════════════════════════════════════════════════════════╗
║  ←  👤 @sarah    INFJ         [End Conversation] 🔴     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   👤 Hey! How was your weekend?                          ║
║      2:14 PM                                             ║
║                                                           ║
║                       You did great! 😊                💬║
║                                  2:15 PM                 ║
║                                                           ║
║   👤 Thanks! Want to grab coffee?                        ║
║      2:16 PM                                             ║
║                                                           ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  💬 Type a message...                        [Send] ➤   ║ ← Active input
╚═══════════════════════════════════════════════════════════╝
       ↑ You can type and send messages
```

### B. ARCHIVED CONVERSATION (After Ending)
```
╔═══════════════════════════════════════════════════════════╗
║  ←  👤 @sarah    INFJ                                   ║ ← No "End" button
╠═══════════════════════════════════════════════════════════╣
║  ⚠️  This conversation has been ended                    ║ ← Warning banner
║      Send a new DM request to reconnect                  ║    (yellow bg)
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║   👤 Hey! How was your weekend?                          ║
║      2:14 PM                                             ║ ← All messages
║                                                           ║    still visible
║                       You did great! 😊                💬║    (read-only)
║                                  2:15 PM                 ║
║                                                           ║
║   👤 Thanks! Want to grab coffee?                        ║
║      2:16 PM                                             ║
║                                                           ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║  📭 Conversation ended                                   ║ ← Disabled input
║                                                           ║    (gray bg)
║  ┌─────────────────────────────────────────────────┐   ║
║  │         Send DM Request                         │   ║ ← Reconnect button
║  └─────────────────────────────────────────────────┘   ║    (blue/purple)
╚═══════════════════════════════════════════════════════════╝
       ↑ Input disabled, but can reconnect via button
```

---

## 4. Conversation List - Sorting Behavior

### BEFORE (All Active)
```
╔════════════════════════════════════════════════════════╗
║  Messages                                              ║
╠════════════════════════════════════════════════════════╣
║  ✅ Conversations (3)                                  ║
║                                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ 🟢 @john      ENTP                    2m      (2)│ ║ ← Unread
║  │ "Hey! Let's meet up..."                         │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ ⚪ @sarah     INFJ                    1h         │ ║ ← Read
║  │ "You: Thanks for the advice"                    │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ ⚪ @mike      ISTP                    2d         │ ║ ← Read
║  │ "You: See you tomorrow!"                        │ ║
║  └──────────────────────────────────────────────────┘ ║
║                                                        ║
║  📬 Requests (0)                                       ║
╚════════════════════════════════════════════════════════╝
```

### AFTER (Active + Archived)
```
╔════════════════════════════════════════════════════════╗
║  Messages                                              ║
╠════════════════════════════════════════════════════════╣
║  ✅ Conversations (3)                                  ║
║                                                        ║
║  ╔══════════════════════════════════════════════════╗ ║
║  ║ 🟢 @john      ENTP                    2m      (2)║ ║ ← ACTIVE
║  ║ "Hey! Let's meet up..."                         ║ ║   Unread
║  ╚══════════════════════════════════════════════════╝ ║   (bright)
║                                                        ║
║  ┌──────────────────────────────────────────────────┐ ║
║  │ ⚪ @mike      ISTP                    2d         │ ║ ← ACTIVE
║  │ "You: See you tomorrow!"                        │ ║   Read
║  └──────────────────────────────────────────────────┘ ║   (bright)
║                                                        ║
║  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ ║ ← Invisible
║                                                        ║   separator
║  ┌──────────────────────────────────────────────────┐ ║
║  │ 📦 @sarah     INFJ                    1h         │ ║ ← ARCHIVED
║  │ "You: Thanks for the advice"                    │ ║   (dimmed 60%)
║  │ ↳ Ended                                         │ ║   Status tag
║  └──────────────────────────────────────────────────┘ ║   No unread badge
║                                                        ║
║  📬 Requests (0)                                       ║
╚════════════════════════════════════════════════════════╝

Legend:
🟢 = Unread messages (blue indicator)
⚪ = No unread messages  
📦 = Archived (grayed out, dimmed)
═══ = Bright white background (active)
─── = Light gray background (active, read)
▒▒▒ = Invisible grouping separator
```

---

## 5. Sorting Logic Diagram

```
                    CONVERSATION LIST
                          │
                          ├─── ACTIVE CONVERSATIONS
                          │         │
                          │         ├─── Unread (🟢)
                          │         │      │
                          │         │      ├─── @john (2 unread) - 2m ago
                          │         │      └─── @alex (1 unread) - 5m ago
                          │         │
                          │         └─── Read (⚪)
                          │                │
                          │                ├─── @mike - 2d ago
                          │                └─── @emma - 1w ago
                          │
                          └─── [invisible separator]
                                    │
                                    └─── ARCHIVED CONVERSATIONS (📦)
                                             │
                                             ├─── @sarah - 1h ago
                                             ├─── @tom - 3d ago
                                             └─── @lisa - 1w ago

Sort Priority:
1. Status: Active first
2. Within Active: Unread first
3. Within same status: Most recent first
4. Archived: Always at bottom, sorted by recency
```

---

## 6. Mobile View (Compact)

### Active Conversation
```
┌─────────────────────────┐
│ ← @sarah  INFJ  [End]  │  ← Compact button
├─────────────────────────┤
│                         │
│  👤 Hey there!         │
│     2:14 PM            │
│                         │
│        Hi! 💬          │
│        2:15 PM         │
│                         │
├─────────────────────────┤
│ Type message...  [Send]│
└─────────────────────────┘
```

### Archived Conversation
```
┌─────────────────────────┐
│ ← @sarah  INFJ          │
├─────────────────────────┤
│ ⚠️ Conversation ended   │  ← Banner
├─────────────────────────┤
│                         │
│  👤 Hey there!         │
│     2:14 PM            │
│                         │
│        Hi! 💬          │
│        2:15 PM         │
│                         │
├─────────────────────────┤
│ 📭 Ended               │
│ [Send DM Request]      │  ← Full-width
└─────────────────────────┘
```

---

## 7. Button Press States (Color-Coded)

### Default (Red)
```
┌─────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  ← Solid red (#DC2626)
│   🔴 End Conversation   │     White text
└─────────────────────────┘
```

### Holding 25%
```
┌─────────────────────────┐
│ ████░░░░░░░░░░░░░░░░░░ │  ← Dark red fill progressing
│   Hold to confirm       │     Red background
└─────────────────────────┘
```

### Holding 75%
```
┌─────────────────────────┐
│ ██████████████████░░░░ │  ← Almost complete
│   Hold to confirm       │     
└─────────────────────────┘
```

### Complete (Triggering)
```
┌─────────────────────────┐
│ ████████████████████████│  ← Fully filled
│      Ending...          │     Darker red
└─────────────────────────┘
```

### Disabled (Gray)
```
┌─────────────────────────┐
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒ │  ← Gray (#9CA3AF)
│      Ending...          │     Lower opacity
└─────────────────────────┘
```

---

## 8. Comparison: Before vs After User Ends Conversation

### User's Perspective

#### BEFORE (Active)
```
Their Conversation List          Conversation View
┌──────────────────────┐         ┌──────────────────────────┐
│ 🟢 @sarah  (1)   5m │ ──────▶ │ ← @sarah [End] 🔴       │
│ "Hey there!"        │         │                          │
└──────────────────────┘         │ 👤 Hey there!           │
                                 │    5:00 PM              │
                                 │                          │
                                 │          Hi! 💬         │
                                 │          5:01 PM        │
                                 │                          │
                                 │ Type message...  [Send] │
                                 └──────────────────────────┘
                                 ↑ Can send messages
```

#### AFTER (Archived)
```
Their Conversation List          Conversation View
┌──────────────────────┐         ┌──────────────────────────┐
│ 📦 @sarah       5m  │ ──────▶ │ ← @sarah                 │
│ "Hey there!"        │         │ ⚠️ Conversation ended    │
│ ↳ Ended             │         │                          │
└──────────────────────┘         │ 👤 Hey there!           │
↑ Dimmed, at bottom             │    5:00 PM              │
  No unread badge                │                          │
                                 │          Hi! 💬         │
                                 │          5:01 PM        │
                                 │                          │
                                 │ 📭 Conversation ended   │
                                 │ [Send DM Request]       │
                                 └──────────────────────────┘
                                 ↑ Input disabled, can reconnect
```

---

## 9. Reconnection Flow

### Step 1: Archived State
```
┌────────────────────────────────────────┐
│ User views archived conversation       │
│ with @sarah                            │
│                                        │
│ ┌────────────────────────────────────┐│
│ │ ⚠️ Conversation ended              ││
│ │ Send a new DM request to reconnect ││
│ └────────────────────────────────────┘│
│                                        │
│ [Full message history visible]        │
│                                        │
│ 📭 Conversation ended                 │
│ ┌────────────────────────────────────┐│
│ │      Send DM Request               ││ ← User clicks
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

### Step 2: DM Request Modal Opens
```
┌────────────────────────────────────────┐
│   💬 Request DM with @sarah            │
│                                        │
│   ┌──────────────────────────────────┐│
│   │ Optional message...              ││ ← User types
│   │                                  ││
│   │ "Hey! Want to reconnect?"        ││
│   │                                  ││
│   └──────────────────────────────────┘│
│                                        │
│   [Cancel]          [Send Request]    │
└────────────────────────────────────────┘
```

### Step 3: Request Sent
```
┌────────────────────────────────────────┐
│ ✅ DM Request sent to @sarah           │
│                                        │
│ They can accept or decline your        │
│ request to reconnect                   │
└────────────────────────────────────────┘
```

### Step 4: @sarah Accepts
```
Backend: Finds archived conversation
         Sets status: 'archived' → 'approved'
         Reopens with full history intact

┌────────────────────────────────────────┐
│ ← @sarah   INFJ      [End] 🔴        │ ← Button returns
├────────────────────────────────────────┤
│                                        │
│ [Full message history from before]    │ ← History preserved!
│                                        │
│ 👤 Hey there!                         │
│    5:00 PM (from earlier)             │
│                                        │
│          Hi! 💬                       │
│          5:01 PM (from earlier)       │
│                                        │
│ 👤 Hey! Want to reconnect?            │ ← New messages
│    Just now                            │    continue
│                                        │
├────────────────────────────────────────┤
│ Type a message...           [Send] ➤  │ ← Active again
└────────────────────────────────────────┘
```

---

## 10. Interaction Timings

### Hold-to-Confirm Timeline
```
Time:   0ms        500ms      1000ms     1500ms     2000ms
        │           │           │           │           │
State:  [Start]    [25%]      [50%]      [75%]    [Complete]
        │           │           │           │           │
Visual: ░░░░░░     ██░░░░     ████░░     ██████     ████████
        │           │           │           │           │
User:   👇Press    Holding    Holding    Holding    ✅ Action
                                                      Triggered
        │←────────── Hold Required Duration ─────────→│
                      (2000ms = 2 seconds)

Release early → Progress resets to 0%, no action taken
Hold complete → Conversation archived, navigate back to list
```

---

## 11. Error & Edge Cases

### Scenario: Lost Connection During Hold
```
┌────────────────────────────────────┐
│ [██████████████░░░░]              │  ← Holding (75%)
│  Hold to confirm                   │
└────────────────────────────────────┘
         │
         ↓ Connection lost
┌────────────────────────────────────┐
│ 🔴 End Conversation               │  ← Resets, try again
└────────────────────────────────────┘
```

### Scenario: Navigate Away Mid-Hold
```
User:     Starts holding button
          ↓ (after 1 second)
System:   User swipes to go back
          ↓
Cleanup:  Timers cleared
          Progress reset
          No side effects
Result:   Safe navigation, no accidental archiving
```

---

## 12. Summary Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                FEATURE COMPARISON                           │
├─────────────────────┬───────────────┬───────────────────────┤
│                     │   BEFORE      │       AFTER           │
├─────────────────────┼───────────────┼───────────────────────┤
│ End Action          │ Confirmation  │ Hold-to-confirm (2s)  │
│                     │ Dialog        │ No dialog             │
├─────────────────────┼───────────────┼───────────────────────┤
│ Conversation State  │ Deleted/      │ Archived (visible,    │
│                     │ Hidden        │ read-only)            │
├─────────────────────┼───────────────┼───────────────────────┤
│ List Visibility     │ Removed       │ Moved to bottom       │
│                     │ completely    │ (dimmed)              │
├─────────────────────┼───────────────┼───────────────────────┤
│ Reconnection        │ Blocked       │ Allowed via DM        │
│                     │               │ request               │
├─────────────────────┼───────────────┼───────────────────────┤
│ Message History     │ Lost          │ Preserved & visible   │
├─────────────────────┼───────────────┼───────────────────────┤
│ Mobile Experience   │ Dialog        │ Touch hold gesture    │
│                     │ overlay       │ (native feel)         │
└─────────────────────┴───────────────┴───────────────────────┘
```

---

## 13. Key Visual Indicators

```
Symbol Guide:
═══════  Active conversation card (bright)
───────  Active conversation card (read)
▒▒▒▒▒▒▒  Invisible grouping separator
📦       Archived status icon
🟢       Unread indicator (blue dot)
⚪       Read (no indicator)
⚠️       Warning/info banner
📭       Disabled input state
🔴       End conversation button
↳        Status text prefix

Color Palette:
Red:    #DC2626 (end button, destructive)
Yellow: #FEF3C7 (warning banner background)
Gray:   #F3F4F6 (disabled input)
Blue:   #3B82F6 (primary action buttons)
Dim:    60% opacity (archived conversations)
```

This design maintains **visual continuity** while clearly communicating state changes, uses the familiar **hold-to-confirm pattern**, and provides an **easy reconnection path** - all without losing conversation history! 🎨
