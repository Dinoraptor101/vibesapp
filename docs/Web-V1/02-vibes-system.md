# Hearts System

The hearts system is the core engagement mechanism that drives VibesApp's community interaction and content appreciation. It's a simple, positive feedback system that allows users to show appreciation for posts.

## Overview

### Core Philosophy

- **Positive engagement** - Focus on appreciation rather than criticism
- **Simple interactions** - Easy to understand and use
- **Community building** - Encourages meaningful connections
- **No negative feedback** - Hearts only, no dislikes to prevent toxicity

### How It Works

Users can heart posts to show they like or appreciate the content. Each heart is counted and displayed on the post. Users cannot heart their own posts.

### Features

- **Instant feedback** - Hearts are applied immediately with optimistic UI updates
- **Count display** - Shows number of hearts (formatted as K/M for large numbers)
- **Visual indicators** - Filled heart icon when user has hearted
- **Accessibility** - Proper ARIA labels and keyboard navigation

## Technical Implementation

### Frontend Components

The hearts functionality is implemented in the `PostActions` component:

```typescript
// PostActions.tsx - Heart functionality
const handleHeart = () => {
  const newHasHearted = !hasHearted;
  setHasHearted(newHasHearted);
  setHearts((prev) => prev + (newHasHearted ? 1 : -1));
  onHeart?.(postId);
};
```

### API Integration

Hearts are managed through the posts API with optimistic updates:

- **Heart action**: `POST /api/posts/{postId}/heart`
- **Unheart action**: `DELETE /api/posts/{postId}/heart`
- **State sync**: Real-time count updates from server

### UI States

- **Not hearted**: Outline heart icon
- **Hearted**: Filled heart icon with pink/red color
- **Own post**: Disabled state (cannot heart own posts)
- **Loading**: Disabled during API calls

## User Experience

### Interaction Flow

1. User sees post with heart count
2. Clicks heart button
3. Immediate visual feedback (icon fill, count update)
4. API call in background
5. Success: State persists
6. Error: Reverts to previous state with silent error handling

### Mobile Optimization

- Large touch targets for heart buttons
- Clear visual feedback on tap
- Prevents accidental double-taps

## Content Moderation Integration

While hearts are positive, the system includes reporting for inappropriate content:

- **Report button**: Flag posts for admin review
- **Admin panel**: Dedicated interface for moderating flagged content
- **Soft delete**: Users can be banned without permanent data loss

## Future Enhancements

### Potential Features

- **Heart reactions** - Different heart types (like, love, laugh, etc.)
- **Heart streaks** - Recognition for consistently hearted content
- **Heart analytics** - Insights for content creators
- **Heart notifications** - Real-time alerts for received hearts

### Scaling Considerations

- **Performance** - Efficient database queries for heart counts
- **Caching** - Redis caching for popular post heart counts
- **Analytics** - Tracking engagement metrics
- **Moderation** - Automated detection of heart manipulation
