## 📋 Task Tracker

> **🔍 Code Cleanup Required**: See [development-log/Code-Cleanup-Report.md](./development-log/Code-Cleanup-Report.md) for ~780 lines of cleanup identified across 6 files.

> **🔧 Backend Refactoring (Deferred)**: See [controller-refactoring-summary.md](../controller-refactoring-summary.md). Requires comprehensive E2E test coverage before re-attempting.


### UI/UX Polish
- [ ] Update initial loading animation and login screen with gradient background
- [ ] Implement Account Deletion UI - Add "Delete Account" button in Settings
- [ ] Implement browser notifications - Add Web Notifications API respecting user preferences
- [ ] Add page transition animations - Implement fade/slide for smoother navigation
- [ ] Add message arrival sound - Audio notification when messages arrive

### Core Features
- [ ] Implement Strike System frontend - Warning modal, cooldown timer, history view
- [ ] Implement Vibes Growth System UI - Build "Your Vibe" Settings tab per VIBES-GROWTH-SYSTEM.md
- [ ] Implement username search - Add case-insensitive exact username matching
- [ ] Implement hashtag extraction/search - Parse hashtags, store as array, enable queries
- [ ] Daily Post Caps - Enforce frugality through post limits
- [ ] Build JSON-based rich text editor - Replace contentEditable with JSON document model
- [ ] Refactor comments into Comment collection - Separate model, migrate data, update endpoints
- [ ] Email notifications for Admin Panel

### Security & Infrastructure
- [ ] PRIORITY: Resolve security issue where API token is leaking in devtools
- [ ] Track/flag accounts by IP/location - Detect multiple accounts via middleware
- [ ] Audit MongoDB Atlas security - Review access, encryption, IP whitelist, rate limiting
- [ ] Implement data encryption layer - Encrypt PII before storage
- [ ] Restrict location requests - Only GPS during signup/Settings, cache elsewhere
- [ ] Research OAuth integration - Google/Facebook OpenID Connect

### Future Features
- [ ] Vibes Growth System - Number-free visualization with plant growth metaphor (🌱→🌿→🌳→🌲→🌸)
- [ ] Personal Growth Tracker (Carrot) - MBTI-driven with Strength/Rounding paths
- [ ] Wu-Wei Flow Score - Harmony tracking via compassionate/frugal/humble actions
- [ ] Regional Group Chats - City-based spaces moderated by verified residents
- [ ] Group Chat Invites - Add friends to existing conversations
- [ ] OAuth Enforcement - Google/Facebook auth for 1 person = 1 account
- [ ] Anti-Materialism Features - "Treasure Challenges" rewarding simple local shares

---

## 📖 Reference Details

### UI/UX Polish (Detailed)
- **Account Deletion UI**: Add "Delete Account" button and confirmation modal in `apps/web-v2/src/components/settings/AccountTab.tsx` that calls existing backend `/api/users/delete-account` endpoint.
- **Browser Notifications**: Add Web Notifications API integration to `apps/web-v2/src/hooks/useActivities.ts` that triggers native browser notifications when new activities arrive, respecting user's activity configuration preferences.
- **Vibes Growth System UI**: Build "Your Vibe" Settings tab following [VIBES-GROWTH-SYSTEM.md](./VIBES-GROWTH-SYSTEM.md) design specification. Backend karma engine already exists (`apps/api/src/controllers/karma.js`), need to create:
  1. **Frontend Components**: `YourVibeTab.tsx`, `PlantVisualization.tsx`, `RecentActivityFeed.tsx`, `VibesExplanation.tsx`
  2. **Backend API**: `GET /api/users/me/vibes-summary` endpoint returning currentVibes, currentStage, progressInStage, recentActivity, dailyMomentum
  3. **Plant Assets**: 5 SVG plant stages (🌱 Seed → 🌿 Sprout → 🌳 Young Tree → 🌲 Mature Tree → 🌸 Flowering)
  4. **React Query Hook**: `useVibesSummary()` with 60s cache, WebSocket real-time updates
  5. **Settings Integration**: Add "Your Vibe 🌱" tab as 3rd position in Settings navigation
- **Urgent UI/UX Polish (Dec 2, 2025)**:
  - Fix "Moment" timestamp caching issue - Activities show cached timestamps until page refresh
  - User Menu smooth animations - Add fade/slide transitions
  - Reduce mobile padding on Profile page - iPhone screen width is narrow
  - Add age/sex honesty advisory - Gentle message about accuracy
  - Build ethos messaging system - Keep as placeholder for now

### Core Features (Detailed)
- **Refactor Comments into Separate Collection** - Currently comments stored as Posts with `commentOn` field. Create dedicated `Comment` model in `apps/api/src/models/Comment.js` with fields: `_id`, `postId`, `userId`, `text`, `replyToCommentId`, `reactions[]`, `reports[]`, `createdAt`, `isDeleted`. Write migration script to move Posts with `commentOn` to new collection. Update `/api/comments` endpoints and remove comment filtering from feed queries. (Est: 2-3 hours)

- **Build JSON-based Rich Text Editor** - Replace contentEditable in `apps/web-v2/src/components/posts/TextEditor.tsx` with proper JSON document model supporting paragraphs, lists, marks (bold/underline), and reliable input handling. Define node types, operations (insertText, deleteText, splitBlock, toggleMark, wrapInList), and rendering layer. (Est: 2-4 weeks)

- **Implement Username Search** - Update `apps/api/src/controllers/searchController.js` to add case-insensitive exact username matching alongside caption search.

- **Implement Hashtag Extraction & Search** - Add hashtag parsing on post creation in `apps/api/src/models/Post.js`, store as lowercase array field, update search endpoint to query hashtags specifically.

- **Implement Strike System Frontend UI** - Build Strike Warning Modal, posting restriction checks, cooldown timer display, and strike history view in Settings consuming existing backend `User.getCurrentRestrictions()` data. Display: strike count (X/3), violation reason, cooldown duration, appeal information. Backend returns `canPost`, `canComment`, `strikeCount`, `cooldownEnd` - just consume in frontend.

### Security & Infrastructure (Detailed)
- **Data Encryption Layer** - Add encryption for PII (location, identification) in `apps/api/src/utils/encryption.js`, encrypt before storage in database, decrypt on retrieval.

- **Track/Flag Accounts by IP/Location** - Add IP tracking middleware in `apps/api/src/middleware/` and location clustering logic to detect multiple accounts, store flags in User model, expose in admin dashboard.

- **Audit MongoDB Atlas Security** - Review API access patterns, implement connection string encryption, enable IP whitelist, add rate limiting middleware in `apps/api/src/middleware/rateLimiter.js`.

- **Restrict Location Requests** - Remove browser GPS calls from `apps/web-v2/src/hooks/useLocation.ts` everywhere except SignupWizard and Settings AccountTab, use cached database location for all other features. Prevents constant GPS tracking and respects user privacy.

- **Research OAuth Integration** - Replace current auth with Google/Facebook OpenID Connect providers to enforce 1 user per account policy, update `apps/api/src/middleware/authMiddleware.js`.

### Future Features (Detailed)
- **Personal Growth Tracker (Carrot Principle)**: MBTI-driven platform with Strength/Rounding paths, actionable daily goals, progress tracking, community reinforcement via ADKAR approach. Add to `apps/api/src/models/User.js` for MBTI type, growth path, goals. Build dashboard in `apps/web-v2/src/components/growth/`.

- **Wu-Wei Flow Score Mechanism**: Replace punitive carrots/sticks with fluid "Flow Score" tracking effortless harmony. Users gain points for compassionate comments, frugal shares, humble actions. Low scorers receive gentle prompts, redemption via "Sinner Circles" for open dialogue. Explore small LLM integration for automated scoring. No punishments, focus on natural alignment with ethos.

- **Regional Group Chats**: City-based public groups with verified resident moderators. Goal is to create spaces that feel like gathering with neighbors rather than shouting into crowds.

- **Group Chat Invite System**: Implement invite flow in Messages section allowing users to add friends to existing conversations, update `apps/api/src/models/GroupChat.js` schema.

- **Anti-Materialism Safeguards**: Combat materialism by limiting posts to geo-tagged photos of everyday life (no luxury flexing), AI nudging toward "simple shares", introduce "Treasure Challenges" based on Dao De Jing, reward visibility boosts rather than tokens. Implement "Duality Views" pairing opposing local opinions without upvote wars.

### Technical Notes
- ✅ Birth date collection already exists in SignupWizard Step 4 (year/month selectors with validation)
- ✅ Vibes Score (Karma engine) backend exists in `apps/api/src/controllers/karma.js`
- ✅ Strike System backend fully implemented with restrictions and cooldowns
- Comments refactoring should happen before Activity system improvements
- Rich text editor should happen before daily post caps
- 1-person-per-account policy should use OAuth enforcement (best practice)

### Deployment Checklist
- Verify Heroku CLI installed (`heroku --version`)
- Connect GitHub to Heroku apps via Dashboard
- Upload environment variables to both dynos
- Run database migration scripts via Heroku CLI
- Trigger deployments
- Verify everything works


-------  more details here.

