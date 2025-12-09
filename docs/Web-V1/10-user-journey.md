# User Journey

This document maps out the complete user experience in VibesApp, from initial discovery to becoming an engaged community member. It covers onboarding, feature discovery, and the progression through vibes levels.

## User Lifecycle Overview

```
Discovery → Onboarding → First Use → Feature Unlocking → Community Engagement → Advanced Features
```

## Phase 1: Discovery & Landing

### Initial User Experience

**Entry Points:**

- Direct URL visit (vibesapp.net)
- Word-of-mouth referrals
- Social media sharing
- App store discovery (future mobile app)

**Landing Page Goals:**

- Communicate core value proposition
- Build trust and credibility
- Encourage sign-up without overwhelming
- Set expectations for location-based features

**Key Messages:**

- "Social network without the media nonsense"
- "Connect with real people nearby"
- "Community-driven, ad-free experience"
- "Earn your way to better features"

## Phase 2: Onboarding Process

### Step 1: Pigeon ID Creation

**Purpose**: Establish user identity without traditional email/password

**User Experience:**

```
Welcome Screen
├── "What's a Pigeon ID?"
├── Input: Create unique Pigeon ID
├── Validation: Check availability
└── Success: ID reserved
```

**Key Features:**

- Simple, memorable identifier
- No email required initially
- Instant availability checking
- Clear explanation of privacy benefits

**Success Metrics:**

- 90%+ successful ID creation
- < 30 seconds to complete
- Low abandonment rate

### Step 2: Basic Profile Setup

**Purpose**: Gather essential information for community matching

**Required Information:**

- Display name (userName)
- Birth year and month
- MBTI personality type
- Polarity (yin/yang)
- Sex/gender

**User Experience:**

```
Profile Setup
├── Personal Information
│   ├── Display Name
│   ├── Birth Year/Month
│   └── Gender
├── Personality
│   ├── MBTI Type (with helper)
│   └── Polarity Selection
└── Review & Confirm
```

**Design Considerations:**

- Progressive disclosure (one section at a time)
- Optional MBTI quiz for unsure users
- Clear explanations for each field
- Skip options for sensitive information

### Step 3: Location Permission

**Purpose**: Enable location-based features while respecting privacy

**Permission Flow:**

```
Location Request
├── Explanation of Benefits
│   ├── "See posts from nearby users"
│   ├── "Your reactions count more"
│   └── "Build local community"
├── Privacy Assurance
│   ├── "General location only"
│   ├── "No real-time tracking"
│   └── "You control sharing"
├── Permission Request
└── Fallback Options
```

**Graceful Degradation:**

- Manual location entry option
- Limited functionality explanation
- Re-request permission later
- City/zip code alternatives

### Step 4: App Introduction

**Purpose**: Set user expectations and highlight key features

**Guided Tour:**

1. **Feed Overview** - "Posts from your area"
2. **Vibes System** - "Earn your way to new features"
3. **Creating Content** - "Share with your community"
4. **Interactions** - "Like and reply to connect"

**Interactive Elements:**

- Sample posts with explanations
- Simulated interactions
- Progress indicators
- Skip option for experienced users

## Phase 3: First Use Experience

### Initial App State

**Starting Conditions:**

- 195 vibes (sufficient for basic use)
- Empty personalized feed
- Basic controls unlocked
- Welcome post from system

**First Session Goals:**

- Create first post successfully
- Understand vibes system
- Discover nearby content
- Experience basic interactions

### Creating First Post

**Guided Experience:**

```
Create First Post
├── Content Prompt
│   ├── "Introduce yourself"
│   ├── "Share something local"
│   └── "What's on your mind?"
├── Image Upload
│   ├── Camera option
│   ├── Photo library
│   └── Sample images
├── Location Tagging
└── Post Success
```

**Success Factors:**

- Simple, intuitive interface
- Clear visual feedback
- Immediate post visibility
- Vibes cost explanation

### Discovering Content

**Feed Curation for New Users:**

- Highlighted popular local posts
- Diverse content types
- Engaging, positive content
- Distance indicators

**Learning Interactions:**

- Tooltips on first use
- Vibes change notifications
- Permission explanations
- Community guidelines

## Phase 4: Feature Discovery & Vibes Progression

### Vibes Level 1: Basic Use (50+ vibes)

**Available Features:**

- Creating posts and replies
- Liking posts
- Basic profile viewing
- Feed browsing

**User Goals:**

- Understand vibes mechanics
- Build local network
- Create quality content
- Learn community norms

**Success Metrics:**

- Daily post creation
- Positive reaction ratio
- Return visits
- Time spent in app

### Vibes Level 2: Group Chat Access (100+ vibes)

**Feature Unlock Experience:**

```
Group Chat Unlock
├── Celebration Animation
├── Feature Explanation
│   ├── "Real-time conversations"
│   ├── "Connect with post creators"
│   └── "Build deeper relationships"
├── First Use Tutorial
└── Encouragement to Try
```

**New Capabilities:**

- Group chat participation
- Real-time messaging
- Threaded conversations
- Message notifications

**User Behavior Changes:**

- Increased engagement time
- More meaningful interactions
- Community participation
- Relationship building

### Vibes Level 3: Direct Messaging (200+ vibes)

**Milestone Achievement:**

- Major feature unlock
- Significant time investment reached
- Demonstrated community value
- Trusted member status

**New Capabilities:**

- Private conversations
- DM request system
- Personal networking
- Deeper connections

**User Experience:**

```
DM Feature Unlock
├── Achievement Celebration
├── Trust & Safety Education
│   ├── Respectful communication
│   ├── Blocking & reporting
│   └── Privacy controls
├── First DM Tutorial
└── Connection Suggestions
```

### Vibes Level 4: Omniverse Access (300+ vibes)

**Elite User Status:**

- Long-term community member
- High-quality contributor
- Positive community impact
- Advanced feature access

**Advanced Features:**

- Enhanced content creation tools
- Community moderation capabilities
- Special recognition
- Beta feature access

## Phase 5: Long-term Engagement

### Community Integration

**Established User Patterns:**

- Daily app usage
- Regular content creation
- Active community participation
- Local relationship building

**Advanced Use Cases:**

- Event organization
- Local business promotion
- Community leadership
- Mentoring new users

### Retention Strategies

**Engagement Mechanisms:**

- Regular feature updates
- Community challenges
- Local event integration
- Achievement recognition

**Progression Paths:**

- Content creator recognition
- Community moderator roles
- Local ambassador programs
- Feature beta testing

## User Personas & Journeys

### Persona 1: The Local Explorer

**Profile:**

- Age 25-35
- New to area
- Seeking community connections
- Tech-comfortable

**Journey:**

1. **Discovery**: Searching for local community apps
2. **Onboarding**: Quick setup, interested in local features
3. **First Use**: Posts about new neighborhood
4. **Growth**: Discovers local events, makes connections
5. **Retention**: Becomes local information hub

**Pain Points:**

- Doesn't know local hotspots
- Overwhelmed by information
- Needs social validation

**Success Factors:**

- Location-relevant content
- Welcoming community response
- Easy event discovery

### Persona 2: The Community Builder

**Profile:**

- Age 30-50
- Long-time local resident
- Naturally helpful
- Moderate tech skills

**Journey:**

1. **Discovery**: Recommended by friend
2. **Onboarding**: Careful about privacy, needs reassurance
3. **First Use**: Shares local knowledge
4. **Growth**: Becomes regular contributor
5. **Retention**: Mentors new users

**Pain Points:**

- Privacy concerns
- Technology learning curve
- Time management

**Success Factors:**

- Clear privacy controls
- Recognition for contributions
- Simple interface

### Persona 3: The Social Connector

**Profile:**

- Age 18-28
- Highly social
- Tech-native
- Event-focused

**Journey:**

1. **Discovery**: Social media referral
2. **Onboarding**: Fast completion, excited to connect
3. **First Use**: Multiple posts, active engagement
4. **Growth**: Organizes meetups, builds network
5. **Retention**: Community leader

**Pain Points:**

- Impatience with limitations
- Wants instant gratification
- FOMO on features

**Success Factors:**

- Fast vibes progression
- Social features prominence
- Event organization tools

## Critical Success Moments

### Onboarding Completion

**Definition**: User completes profile setup and location permission
**Target**: 80% completion rate
**Optimization**: Streamlined flow, clear value proposition

### First Post Creation

**Definition**: User successfully creates and publishes first post
**Target**: 70% of users create post within first session
**Optimization**: Guided creation flow, content suggestions

### First Positive Interaction

**Definition**: User receives first like or positive reply
**Target**: 90% receive positive feedback within 24 hours
**Optimization**: Community welcoming practices, content promotion

### Feature Unlock

**Definition**: User reaches new vibes threshold and unlocks features
**Target**: 60% reach group chat level within first week
**Optimization**: Clear progression indicators, engagement incentives

### Return Visit

**Definition**: User returns to app within 7 days of registration
**Target**: 50% return rate within first week
**Optimization**: Push notifications, email reminders, content freshness

## Conversion Funnel

### Registration Funnel

```
Landing Page Views: 100%
    ↓
Start Registration: 40%
    ↓
Complete Profile: 70%
    ↓
Grant Location: 60%
    ↓
Complete Onboarding: 85%
    ↓
Create First Post: 50%
```

### Engagement Funnel

```
New Users: 100%
    ↓
Day 1 Return: 60%
    ↓
Day 7 Return: 40%
    ↓
Day 30 Return: 25%
    ↓
Group Chat Unlock: 20%
    ↓
DM Unlock: 10%
```

## Experience Optimization

### Friction Points

1. **Location Permission**: Users hesitant to share location
2. **First Post**: Uncertainty about what to share
3. **Vibes Understanding**: Complex karma system
4. **Community Finding**: Empty feed for new users

### Optimization Strategies

1. **Better Education**: Clear explanations and benefits
2. **Guided Experiences**: Tutorials and progressive disclosure
3. **Social Proof**: Examples and testimonials
4. **Quick Wins**: Immediate positive feedback

### Success Metrics

- **Onboarding completion rate**: 60%+ target
- **First week retention**: 40%+ target
- **Feature unlock rate**: 70% reach group chat
- **Content creation rate**: 2+ posts per active user
- **Community engagement**: 80% receive positive interactions

## Future Journey Enhancements

### Planned Improvements

- **Personalized onboarding** based on user type
- **Achievement system** for progression gamification
- **Community matching** for better connections
- **Local event integration** for real-world meetups
- **Mentorship program** for new user guidance

### Advanced Features

- **Voice introductions** for personal touch
- **Video content** for richer sharing
- **Live events** for real-time community building
- **Business integration** for local commerce
- **Neighborhood champions** for community leadership
