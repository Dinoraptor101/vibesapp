# Vibes System

The vibes system is the core mechanism that drives VibesApp's community self-moderation and feature access. It's a **private karma score** that reflects user behavior and unlocks platform capabilities.

## Overview

### Starting Conditions

- **Initial vibes**: 195 points
- **Maximum vibes**: 399 points
- **Minimum vibes**: No hard minimum (but low vibes restrict access)

### Core Philosophy

- **Merit-based access** - Earn features through positive community participation
- **Self-regulation** - Community collectively determines content quality
- **Proximity matters** - Only nearby users (within 100 miles) affect your vibes
- **Privacy-first** - Vibes score is private, not a public status symbol

## Vibes Economy

### Actions That Cost Vibes

| Action          | Cost     | Rationale                                     |
| --------------- | -------- | --------------------------------------------- |
| Create Post     | -2 vibes | Prevents spam, encourages quality content     |
| Create Reply    | -1 vibe  | Lower barrier for conversation participation  |
| Give Dislike    | -3 vibes | Heavy penalty to discourage negative behavior |
| Send DM Request | -6 vibes | Significant cost to prevent harassment        |

### Actions That Earn Vibes

| Action       | Reward   | Rationale                                 |
| ------------ | -------- | ----------------------------------------- |
| Daily Login  | +1 vibe  | Encourages regular engagement             |
| Give Like    | +1 vibe  | Rewards positive community participation  |
| Receive Like | +4 vibes | Major reward for creating quality content |
| Delete Post  | +1 vibe  | Partial refund for removing content       |

### Actions That Lose Vibes

| Action          | Penalty   | Rationale                            |
| --------------- | --------- | ------------------------------------ |
| Receive Dislike | -10 vibes | Strong disincentive for poor content |

## Permission Thresholds

### 50+ Vibes: Basic Controls

- **Access to**: Standard app functionality
- **Purpose**: Entry-level threshold to prevent immediate spam
- **Features unlocked**: Basic post interactions, profile management

### 100+ Vibes: Group Chat Access

- **Access to**: Real-time messaging on posts
- **Purpose**: Ensures users understand community norms before participating in conversations
- **Features unlocked**:
  - Send messages in post group chats
  - Receive notifications for group chat activity
  - Participate in threaded conversations

### 200+ Vibes: Direct Messaging

- **Access to**: Private one-on-one conversations
- **Purpose**: High threshold prevents harassment and spam in private messages
- **Features unlocked**:
  - Send DM requests to other users
  - Accept/decline incoming DM requests
  - Private messaging capabilities

### 300+ Vibes: Omniverse Access

- **Access to**: Advanced platform features
- **Purpose**: Reward for highly engaged, trusted community members
- **Features unlocked**: Advanced content creation tools, expanded interaction options
- **Note**: Currently lowered to 100+ vibes temporarily due to user base size

## Proximity-Based Interactions

### Proximal Reactions

Only users within **100 miles** of the post creator can affect vibes through likes/dislikes:

```javascript
// Backend logic for vibes calculation
if (userDistanceFromPost <= 100) {
  // Reaction counts toward vibes
  post.proximal_likes += 1;
  user.vibes += 4; // If receiving a like
}
```

### Non-Proximal Reactions

Users outside the 100-mile radius can still interact, but it doesn't affect vibes:

- Reactions are recorded but don't impact karma
- Helps with content discovery without gaming the system
- Maintains local community focus

## Content Moderation

### Automatic Post Hiding

Posts are automatically hidden when they receive disproportionate negative feedback:

```javascript
// Auto-hide logic
if (post.proximal_dislikes > post.proximal_users / 3) {
  post.isHidden = true;
}
```

### Community Self-Regulation

- **Distributed moderation** - No central authority needed
- **Context-aware** - Local communities decide what's appropriate
- **Scalable** - System scales with user base automatically
- **Transparent** - Clear rules, predictable outcomes

## Strategic Considerations

### Preventing Gaming

- **Location verification** - GPS required for reactions
- **Proximity limits** - Distance-based reaction validity
- **Cost barriers** - Negative actions have immediate consequences
- **Maximum caps** - Prevents infinite vibes accumulation

### Encouraging Quality

- **Creation costs** - Users invest vibes in their content
- **Reward ratio** - Receiving positive feedback is more valuable than giving it
- **Progressive unlocking** - Advanced features reward consistent good behavior
- **Daily engagement** - Regular participation is rewarded

### Balancing Act

- **Not too restrictive** - 195 starting vibes allows immediate participation
- **Not too permissive** - Meaningful thresholds for advanced features
- **Recovery possible** - Users can rebuild vibes through positive behavior
- **Natural ceiling** - 399 max prevents extreme inequality

## Implementation Details

### Frontend Permission Checking

```typescript
// userPermissions.ts
export async function getPermissionGroupChat(): Promise<boolean> {
  const vibes = await getUserVibes();
  return vibes > 100;
}
```

### Backend Vibes Calculation

The backend handles all vibes calculations to prevent client-side manipulation:

- Secure vibes updates through API endpoints
- Validation of all user actions
- Proximity verification for reactions
- Automatic post hiding based on community feedback

### Real-time Updates

- Vibes changes are reflected immediately in the UI
- Permission-gated features update automatically
- User feedback shows when actions affect vibes
- Progressive disclosure of locked features

## Future Considerations

### Potential Enhancements

- **Vibes history** - Transaction log for transparency
- **Decay mechanisms** - Vibes slowly decrease without activity
- **Bonus multipliers** - Extra rewards for exceptional content
- **Community voting** - Meta-moderation for edge cases

### Scaling Challenges

- **Geographic expansion** - Maintaining local community feel
- **Feature creep** - Keeping system simple and understandable
- **Economic balance** - Adjusting rewards/penalties as user base grows
- **Edge cases** - Handling abuse, coordinated attacks, etc.
