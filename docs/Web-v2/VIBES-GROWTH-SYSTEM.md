# Vibes Growth System - Design Specification

## Overview

The Vibes Growth System visualizes user karma through an organic plant growth metaphor, embodying ZEN principles of simplicity, mindfulness, and positive reinforcement. This system replaces traditional point-based gamification with a **number-free, nature-inspired growth journey** that encourages positive community participation.

**Philosophy**: "Mostly carrot, occasional stick" - Vibes encourage good behavior through visible growth, while Strikes (separate system) handle violations invisibly.

---

## Core Principles

### 1. **Number-Free Design** 🚫🔢
- **NO numerical vibes scores visible anywhere**
- **NO +/- transaction amounts shown**
- **NO permission thresholds displayed (200 vibes for DM, etc.)**
- Growth is **felt, not calculated**

**Rationale**: Numbers create anxiety and comparison. Nature doesn't count leaves; it just grows.

### 2. **Organic Growth Metaphor** 🌱
- Plant progresses through **5 distinct growth stages**
- Visual height increases within each stage (taller plant = closer to evolution)
- Stage transitions feel **earned but inevitable** (like natural seasons)

**Rationale**: Aligns with Daoist wu-wei (effortless action). Growth happens through being, not forcing.

### 3. **Positive-Only Visualization** ✅
- Show **impact direction** (🟢 positive, 🔴 cost) without amounts
- Plants don't shrink stages (only lose visual health if declining)
- Daily momentum reflected in **poetic status messages**

**Rationale**: ZEN mindfulness focuses on presence, not punishment. Shame doesn't teach.

### 4. **Inline Progressive Disclosure** 📖
- All expansions happen **within the same page** (no navigation)
- "Learn more" sections reveal details **below**, not in modals
- Information architecture: Simple → Detailed, never overwhelming

**Rationale**: Aligns with ZEN "one action, one way" principle. Don't break flow.

---

## Plant Growth Stages

### Stage Progression (5 Stages)

| Stage | Name | Vibes Range | Visual | Description |
|-------|------|-------------|--------|-------------|
| 1 | **Seed** | 0-79 | 🌱 | "Just starting your journey" |
| 2 | **Sprout** | 80-159 | 🌿 | "Building positive momentum" |
| 3 | **Young Tree** | 160-239 | 🌳 | "Making consistent impact" |
| 4 | **Mature Tree** | 240-319 | 🌲 | "Cornerstone of the community" |
| 5 | **Flowering Tree** | 320-399 | 🌸 | "Wisdom and kindness bloom" |

**Within-Stage Progression**:
- Plant scales vertically (grows taller) as vibes increase within stage
- Example: 🌳 Small tree (160 vibes) → 🌳 Tall tree (239 vibes) → 🌲 Evolution (240 vibes)

**Stage Regression**:
- **Plants never shrink back to previous stages** (stage = highest achieved)
- Low vibes within current stage = **visual health degradation**:
  - Desaturated colors (grayscale filter)
  - Drooping leaves (CSS animation)
  - "Wilted" appearance
- Recovery: Colors restore and leaves perk up when vibes increase

---

## Visual Design

### Progress Indicator

**Style**: Circular ring around plant (Apple Watch-inspired)

```
     ╱───────╲
    ╱    🌳   ╲
   │  ████░░░  │  ← Ring fills as you progress to next stage
   │           │     (60% full in this example)
    ╲         ╱
     ╲───────╱
```

**Properties**:
- **No percentage labels** (visual-only)
- Ring color matches plant health:
  - Healthy: Green gradient (#10b981 → #059669)
  - Neutral: Gray (#6b7280)
  - Declining: Amber warning (#f59e0b)
- **Smooth animation**: Ring fills gradually (CSS transition: 800ms ease)

### Plant Animation

**Passive State (Always Active)**:
- **Gentle sway**: 2-second CSS keyframe loop
- Plant rocks ±2deg rotation
- Creates "alive" feeling without distraction

**Milestone Celebration (Stage Transition)**:
- **Brief bloom animation**: Petals unfold over 1.5 seconds
- **Particle effects**: 5-8 sparkles/leaves fall gently
- **Haptic feedback**: Single "success" vibration on mobile (navigator.vibrate(200))
- **Audio**: Soft chime (optional, respects system sound settings)

**Health State Animations**:
- **Healthy**: Normal sway, vibrant colors
- **Declining**: Slower sway (3-second loop), desaturated colors
- **Recovery**: Leaves "perk up" transition (spring animation, 1 second)

---

## Content Design

### Poetic Status Messages

**Location**: Above plant, centered, single line

**Updates**: Daily snapshot (reflects yesterday's net activity)

**Positive Momentum** (earning > spending):
- "Your tree is flourishing" 🌳
- "Growth comes naturally" 🌿
- "Kindness blooms" 🌸

**Neutral Momentum** (balanced):
- "Steady growth continues" 🌱
- "Rooted and strong" 🌳
- "Finding your rhythm" 🌿

**Negative Momentum** (spending > earning):
- "Your tree needs nourishment" 🌱
- "Rest and recharge" 🍂
- "Even trees shed leaves" 🍃

**Inactive** (no activity 7+ days):
- "Waiting for your return" 🌾
- "Patience, like a seed" 🌱

**Selection Logic**:
- Calculate net vibes change from previous day
- Positive (>5): Random positive message
- Neutral (-5 to +5): Random neutral message
- Negative (<-5): Random negative message
- No activity (7 days): Inactive message

---

## Recent Activity Feed

### Display Format

**Collapsed View** (Default - Shows 10 items):

```
Recent Activity
🟢 Positive impact from ❤️
🔴 Negative impact from post
🟢 Positive impact from comment
🔴 Negative impact from DM sent
🟢 Positive impact from ❤️ received
...

[Show more activity ↓]
```

**Expanded View** (Shows all 30 days, grouped):

```
💚 Kindness Received (24 times this month)
  • ❤️ Hearts on your posts
  • 💬 Supportive comments
  • 🫂 Follows from neighbors

💸 Energy Spent (18 times this month)
  • 📝 Posts shared
  • 💌 Messages sent
  • 💬 Replies given

[Collapse ↑]
```

**Grouping Categories**:
1. **Kindness Received** (💚): likeReceived, follows, positive interactions
2. **Energy Spent** (💸): createPost, createReply, sendDMRequest
3. **Actions Taken** (✨): likeGiven, comments made, engagement

**Properties**:
- Icons only, no numbers
- Real-time updates (WebSocket-triggered)
- Auto-scroll to top when new item added
- Smooth slide-in animation for new entries

---

## "How Vibes Work" Section

### Collapsed State (Default)

```
💡 How Vibes Work

Your plant grows through positive actions. Posting and 
messaging costs energy. Receiving love helps you flourish.
Balance your contributions with the community.

[Learn more about stages ↓]
```

**Copy Principles**:
- **Clear & practical** (not mystical or preachy)
- **2-3 sentences max** in collapsed state
- **Action-oriented language** ("grows through" not "is calculated by")
- **Community-focused** ("balance contributions" not "optimize vibes")

### Expanded State

```
💡 How Vibes Work

Your plant grows through positive actions. Posting and 
messaging costs energy. Receiving love helps you flourish.
Balance your contributions with the community.

🌱 Growth Stages

🌱 Seed (New member)
   Just starting your journey

🌿 Sprout (Growing)
   Building positive momentum

🌳 Young Tree (Active) ← You are here
   Making consistent impact

🌲 Mature Tree (Contributor)
   Cornerstone of the community

🌸 Flowering Tree (Elder)
   Wisdom and kindness bloom

Each stage reflects your journey with the community. Growth 
happens naturally through kindness, participation, and balance.

[Collapse ↑]
```

**Expansion Behavior**:
- Slides down with smooth 400ms ease transition
- Current stage highlighted with arrow (← You are here)
- No scroll jump (content pushes existing elements down)
- Collapse button appears at bottom

---

## Settings Tab Integration

### Tab Configuration

**Tab Name**: "Your Vibe" 🌱

**Tab Order**: 3rd position (after Account, before Notifications)
```
Settings Tabs:
1. Account
2. Privacy
3. Your Vibe 🌱  ← New tab
4. Notifications
5. Appearance
6. Safety (Strikes live here, separate)
```

**Rationale**: Early placement emphasizes growth, but not primary (account settings come first).

### Mobile Layout (95% of users)

**Full-screen scrollable page**:

```
┌─────────────────────────────────────┐
│  ← Settings          Your Vibe 🌱   │  ← Header
├─────────────────────────────────────┤
│                                     │
│         [Growing Plant Visual]      │  ← Large, centered
│              🌳                     │     Takes 40% of viewport
│         ┌─────────────┐            │
│         │ ████████░░░ │            │  ← Progress ring
│         └─────────────┘            │
│                                     │
│     "Your tree is flourishing"      │  ← Poetic status
│                                     │
├─────────────────────────────────────┤  ← Divider
│  Recent Activity                    │
│  🟢 Positive impact from ❤️         │
│  🔴 Negative impact from post       │
│  🟢 Positive impact from comment    │
│  ...                                │
│                                     │
│  [Show more activity ↓]             │
├─────────────────────────────────────┤  ← Divider
│  💡 How Vibes Work                  │
│                                     │
│  Your plant grows through positive  │
│  actions. Posting and messaging...  │
│                                     │
│  [Learn more about stages ↓]       │
└─────────────────────────────────────┘
   ↓ Scroll to see more
```

**Spacing**:
- Top padding: `space-6` (24px)
- Plant to status: `space-4` (16px)
- Section dividers: `space-8` (32px)
- Bottom safe area: `space-12` (48px) for iOS gesture bar

### Desktop Layout (Optional Enhancement)

**Maintain identical layout to mobile** (ZEN consistency principle)
- No split columns
- Same vertical scroll
- Larger plant visual (scales to 60% viewport instead of 40%)

**Rationale**: Responsive doesn't mean different. One experience = less confusion.

---

## Technical Specifications

### Data Requirements

**Backend API Endpoint** (NEW):
```
GET /api/users/me/vibes-summary

Response:
{
  currentVibes: 245,
  currentStage: 3, // Young Tree
  progressInStage: 0.65, // 65% to next stage
  recentActivity: [
    { type: "likeReceived", timestamp: "2025-12-05T10:30:00Z" },
    { type: "createPost", timestamp: "2025-12-05T09:15:00Z" },
    ...
  ],
  dailyMomentum: "positive" | "neutral" | "negative" | "inactive"
}
```

**Frontend Data Fetching**:
- React Query hook: `useVibesSummary()`
- Cache time: 60 seconds (frequent updates)
- Real-time updates via WebSocket when vibes change
- Optimistic updates on user actions

### Component Structure

```
<YourVibeTab>
  └── <PlantVisualization>
      ├── <PlantStage stage={3} progress={0.65} health="healthy" />
      ├── <ProgressRing progress={0.65} />
      └── <StatusMessage momentum="positive" />
  
  └── <RecentActivityFeed>
      ├── <ActivityItem type="positive" />
      └── <ExpandButton />
  
  └── <VibesExplanation>
      ├── <BriefDescription />
      └── <StagesGuide collapsed={true} />
</YourVibeTab>
```

### Accessibility

**ARIA Labels**:
```html
<div role="region" aria-label="Your growth visualization">
  <img src="plant.svg" alt="Young tree stage - flourishing" />
  <div role="progressbar" 
       aria-valuenow="65" 
       aria-valuemin="0" 
       aria-valuemax="100"
       aria-label="Progress to next growth stage">
  </div>
</div>
```

**Screen Reader Announcements**:
- Stage transition: "You've grown to Young Tree stage!"
- New activity: "New positive impact received"
- Status change: "Your tree is flourishing"

**Keyboard Navigation**:
- Tab through expandable sections
- Enter/Space to expand/collapse
- Focus management (trap focus in expanded sections)

### Performance

**Image Assets**:
- 5 SVG plant stages (~5KB each)
- Inline CSS animations (no external libraries)
- Total asset size: <30KB

**Animation Budget**:
- Passive sway: CSS-only (GPU accelerated)
- Stage transition: 1.5 seconds (runs once)
- Health changes: 1 second spring animation

**Lazy Loading**:
- Activity feed: Virtual scrolling for 30+ items
- Images preloaded: Next stage + previous stage (anticipate transitions)

---

## Implementation Phases

### Phase 1: MVP (4-6 hours) 🎯

**Priority: Launch-ready foundation**

- [x] Create 5 static plant stage SVGs
- [x] Build `<PlantVisualization>` component
  - Props: `stage`, `progress`, `health`
  - Renders plant + progress ring
- [x] Build `<RecentActivityFeed>` component
  - Shows 10 items (collapsed)
  - Expand/collapse toggle
- [x] Build `<VibesExplanation>` component
  - Brief description + stage guide
  - Inline expansion
- [x] Create `useVibesSummary()` React Query hook
- [x] Wire up Settings tab routing
- [x] Basic responsive layout (mobile-first)

**Deliverable**: Functional "Your Vibe" tab with static plants and real data

### Phase 2: Polish (2-3 hours) ✨

**Priority: Delightful interactions**

- [ ] Add plant sway CSS animation
- [ ] Implement stage transition celebration
  - Bloom animation (CSS keyframes)
  - Particle effects (5-8 sparkles)
  - Haptic feedback (mobile)
- [ ] Add health state animations
  - Desaturation filter (declining)
  - Perk-up spring (recovery)
- [ ] Implement grouped activity categories
  - Kindness Received (💚)
  - Energy Spent (💸)
  - Actions Taken (✨)
- [ ] Add poetic status messages (momentum-based)
- [ ] Real-time WebSocket updates

**Deliverable**: Smooth, animated, delightful experience

### Phase 3: Future - Personal Growth Integration (Long-term) 🌱

**Priority: Connect to MBTI goals system**

- [ ] Add "Daily Goals" section (MBTI-specific challenges)
- [ ] Weekly growth analytics chart (visual, no numbers)
- [ ] Achievement milestone badges (optional)
- [ ] Community leaderboard (by neighborhood, optional)

**Deliverable**: Full Personal Growth Tracker integration

---

## Relationship to Other Systems

### Vibes vs Strikes

| Aspect | Vibes (Your Vibe Tab) | Strikes (Safety Tab) |
|--------|----------------------|---------------------|
| **Location** | Settings > Your Vibe | Settings > Safety (or modal-only) |
| **Philosophy** | Carrot 🥕 (encourage) | Stick 🚨 (punish) |
| **Visibility** | Always visible, positive | Hidden until triggered |
| **Tone** | Growth, nature, ZEN | Warning, restriction, serious |
| **Updates** | Real-time celebration | Rare, somber notifications |

**Design Principle**: Keep them **completely separate**. Users visiting "Your Vibe" should feel encouraged, never reminded of punishment.

### Vibes & Personal Growth Tracker

**Current State**: Vibes system exists, Personal Growth Tracker is future feature

**Integration Path**:
1. **Phase 1**: "Your Vibe" shows plant + recent activity (what we're building now)
2. **Phase 2**: Add "Daily Goals" section (MBTI-based challenges)
   - Example: INTJ sees "Share strategic insight today" goal
   - Completing goals = positive vibes impact (shown as 🟢 in feed)
3. **Phase 3**: Weekly analytics (growth over time, still no numbers)

**Shared Principles**:
- Both use **organic metaphors** (plant growth = personal growth)
- Both are **number-free** (feel progress, don't calculate it)
- Both leverage **MBTI personality data** (personalized goals)
- Both reinforce **community values** (wu-wei, kindness, balance)

---

## Design System Alignment

### ZEN Principles Applied

**From `06-ux-design.md`**:

1. ✅ **Auto-Save Pattern**: Vibes update in real-time, no manual refresh needed
2. ✅ **One Action, One Way**: Single tab for growth, no duplicate paths
3. ✅ **Mobile-First**: Vertical scroll, thumb-friendly tap targets
4. ✅ **Loading Rules**: Plant loads instantly (SVG), activity feed has skeleton if >1s
5. ✅ **Offline-Ready**: Shows cached data, dims when offline (no functionality lost)

### Color Palette

**From `04-design-system.md`**:

**Plant Health Colors**:
```css
--vibe-healthy: #10b981;    /* Green - Flourishing */
--vibe-neutral: #6b7280;    /* Gray - Balanced */
--vibe-declining: #f59e0b;  /* Amber - Needs nourishment */
--vibe-critical: #ef4444;   /* Red - Wilted (rare) */
```

**Activity Impact Colors**:
```css
--impact-positive: #10b981; /* 🟢 Green dot */
--impact-negative: #ef4444; /* 🔴 Red dot */
```

**Progress Ring Gradient**:
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

### Typography

**Status Message** (Poetic):
- Font: `font-serif` (Georgia fallback)
- Size: `text-lg` (18px)
- Weight: `font-medium` (500)
- Color: `text-text-secondary` (muted, not primary)

**Section Headers** (Recent Activity, How Vibes Work):
- Font: `font-sans` (Inter)
- Size: `text-base` (16px)
- Weight: `font-semibold` (600)
- Color: `text-text-primary`

**Body Text** (Explanations):
- Font: `font-sans` (Inter)
- Size: `text-sm` (14px)
- Weight: `font-regular` (400)
- Line height: `leading-relaxed` (1.625)

---

## Content Guidelines

### Voice & Tone

**DO**:
- ✅ Use nature metaphors ("flourish", "bloom", "roots")
- ✅ Be encouraging and gentle ("Even trees shed leaves")
- ✅ Imply progress without pressure ("Growth comes naturally")
- ✅ Use community language ("balance contributions")

**DON'T**:
- ❌ Use gaming language ("level up", "XP", "points")
- ❌ Create urgency ("Hurry!", "Don't miss out!")
- ❌ Compare users ("Top 10%", "Rank #42")
- ❌ Shame low vibes ("You're falling behind")

### Accessibility Copy

**Alt Text for Plants**:
- Seed: "Seed stage - just beginning"
- Sprout: "Sprout stage - early growth"
- Young Tree: "Young tree stage - growing strong"
- Mature Tree: "Mature tree stage - established member"
- Flowering: "Flowering tree stage - wisdom blooms"

**Activity Type Descriptions** (for screen readers):
- 🟢: "Positive impact" (not "green circle")
- 🔴: "Energy spent" (not "red circle")

---

## Success Metrics (Post-Launch)

**Qualitative Indicators** (User feedback):
- Users report feeling "encouraged" not "pressured"
- Users understand vibes system without reading docs
- Users check "Your Vibe" tab regularly (engagement)

**Behavioral Indicators**:
- Increased positive actions (likes given, supportive comments)
- Decreased negative actions (reports, hostile language)
- Higher retention (users return to see plant growth)

**What NOT to measure**:
- ❌ Average vibes score (creates competition)
- ❌ Time spent on tab (not a engagement metric)
- ❌ Leaderboard rankings (antithetical to philosophy)

**Feedback Loop**:
- Monthly user interviews (5-10 random users)
- In-app survey: "Does your plant reflect your experience?"
- Admin dashboard: Track vibes distribution (ensure not too punishing)

---

## Future Enhancements (Ideas)

### Seasonal Plant Variations (Optional)
- Spring: Cherry blossoms on flowering stage
- Summer: Lush green leaves
- Fall: Amber/orange foliage
- Winter: Evergreen or bare branches

**Implementation**: CSS filter overlays, no new assets needed

### Plant Customization (Far Future)
- Unlock different plant species (cactus, bamboo, bonsai)
- Based on MBTI or personal preference
- Still follows same 5-stage growth pattern

**Rationale**: Personalization without competition (everyone's plant is unique)

### Community Garden (Exploration)
- View neighbors' plants in aggregate (forest view)
- Encourages local connection
- No individual comparison (just collective health)

**Rationale**: Reinforces "we grow together" community ethos

---

## Summary

The Vibes Growth System transforms karma from invisible currency into **visible, organic growth**. By removing numbers and embracing nature metaphors, we create a system that:

✅ **Encourages** positive behavior (carrot)  
✅ **Reflects** user journey authentically  
✅ **Teaches** through metaphor (not rules)  
✅ **Aligns** with Daoist wu-wei philosophy  
✅ **Respects** ZEN design principles  

This is not gamification. It's **growth visualization**. 🌱

---

**Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Approved for implementation  
**Related Docs**: 
- `04-design-system.md` (Colors, typography)
- `06-ux-design.md` (ZEN principles)
- `To-Do.md` (Implementation tasks)
