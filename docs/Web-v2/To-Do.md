## 📋 Task Tracker (Generated Dec 3, 2025)

### Required For Release
- [x] Enhance UserMenu animations - Improve `apps/web-v2/src/components/layout/UserMenu.tsx` with custom CSS transitions or framer-motion overlays beyond current Radix fade-in defaults for smoother menu appearance.
- [x] Reduce mobile padding on Profile page - Adjust horizontal padding in `apps/web-v2/src/pages/ProfilePage.tsx` specifically for mobile viewports without affecting other pages.
- [X] Add age/sex honesty advisory - Insert gentle reminder message during signup in `apps/web-v2/src/components/signup/SignupWizard.tsx` or on profile edit encouraging honest demographic information.


### UI/UX Polish (Quick Wins)
- [ ] Fix Activity timestamp caching - Update `formatRelativeTime` in `apps/web-v2/src/utils/dateUtils.ts` to recalculate on component render instead of caching, or reduce React Query staleTime in `useActivities` hook from 60s to prevent stale "X minutes ago" displays.
- [ ] Add page transition animations - Implement fade/slide transitions in `apps/web-v2/src/components/navigation/PersistentPages.tsx` using framer-motion or CSS transitions for smoother navigation between Home, Activities, CreatePost pages.
- [ ] Implement browser notifications for activities - Add Web Notifications API integration to `apps/web-v2/src/hooks/useActivities.ts` that triggers native browser notifications when new activities arrive, respecting user's activity configuration preferences.
- [ ] Add message arrival sound notification - Integrate audio playback in `apps/web-v2/src/contexts/SocketContext.tsx` when new messages arrive via Socket.IO events.
- [ ] Implement Account Deletion UI - Add "Delete Account" button and confirmation modal in `apps/web-v2/src/components/settings/AccountTab.tsx` that calls existing backend `/api/users/delete-account` endpoint.

### Core Features (High Priority)
- [ ] Design and implement Vibes Score (Karma) system - Define scoring algorithm, add database schema to `apps/api/src/models/User.js`, create backend endpoints, and build frontend display components.
- [ ] Refactor comments into separate Comment collection - Create new `Comment` model in `apps/api/src/models/Comment.js`, write migration script to move Posts with `commentOn` field, update `/api/comments` endpoints, and remove comment filtering from feed queries.
- [ ] Build JSON-based rich text editor - Replace contentEditable in `apps/web-v2/src/components/posts/TextEditor.tsx` with custom JSON document model supporting paragraphs, lists, marks (bold/underline), and reliable input handling.
- [ ] Implement username search - Update `apps/api/src/controllers/searchController.js` to add case-insensitive exact username matching alongside caption search.
- [ ] Implement hashtag extraction and search - Add hashtag parsing on post creation in `apps/api/src/models/Post.js`, store as lowercase array field, and update search endpoint to query hashtags specifically.
- [ ] Implement Strike System frontend UI - Build Strike Warning Modal, posting restriction checks, cooldown timer display, and strike history view in Settings consuming existing backend `User.getCurrentRestrictions()` data.

### Security & Infrastructure
- [ ] Track and flag accounts by IP/location - Add IP tracking middleware in `apps/api/src/middleware/` and location clustering logic to detect multiple accounts, store flags in User model, expose in admin dashboard.
- [ ] Audit and enhance MongoDB Atlas security - Review API access patterns, implement connection string encryption, enable IP whitelist, add rate limiting middleware in `apps/api/src/middleware/rateLimiter.js`.
- [ ] Implement data encryption layer - Add encryption for PII (location, identification) in `apps/api/src/utils/encryption.js`, encrypt before storage in database, decrypt on retrieval.
- [ ] Restrict location requests to signup and Settings - Remove browser GPS calls from `apps/web-v2/src/hooks/useLocation.ts` everywhere except SignupWizard and Settings AccountTab, use cached database location for all other features.
- [ ] Research and integrate OAuth (Google/Facebook) authentication - Replace current JWT auth with OpenID Connect providers to prevent multiple accounts per person, update `apps/api/src/middleware/authMiddleware.js`.

### Future Features (Long-term)
- [ ] Build group chat invite system - Implement invite flow in Messages section allowing users to add friends to existing conversations, update `apps/api/src/models/GroupChat.js` schema.
- [ ] Design regional group chat moderation system - Create city-based public groups with verified resident moderators, add moderation tools in admin dashboard.
- [ ] Design Wu-Wei Flow Score mechanism - Define scoring rules (compassionate comments, frugal shares, humble actions), explore small LLM integration for automated scoring, create database schema.
- [ ] Implement daily post cap - Add post count tracking per user per day in backend, enforce limit in `apps/api/src/controllers/postController.js`, show friendly UI message when limit reached.

### Notes
- ✅ Birth date collection already exists in SignupWizard Step 4 (year/month selectors with validation)
- Comments refactoring should happen before Activity system improvements
- Rich text editor should happen before daily post caps

---

## 🔥 Urgent UI/UX Polish (Dec 2, 2025)

- **Fix "Moment" timestamp caching issue** - Activities show cached timestamps (e.g., "7 minutes ago") until page refresh reveals actual time (7 hours ago). Need real-time or proper cache invalidation.

- **Smooth page transitions** - Add easing/fade when navigating between Home, Activities, Create Post, etc. Currently feels abrupt.

- **User Menu smooth animations** - Menu appears/disappears instantly. Add fade or slide transition for pleasant open/close experience.

- **Browser notifications for Activities** - Whatever appears in Activities feed should trigger native browser notifications (governed by existing activity configuration).

- **Reduce mobile padding on Profile page** - iPhone screen width is narrow, left/right padding on user profile page is too large. Other pages are fine, don't standardize.

- **Add age/sex honesty advisory** - Gentle message advising users to be honest about age and sex to avoid unpleasant interactions (not threatening, just helpful).

- **Build ethos messaging system** - (Keep as placeholder, will refine later)

- **Add message arrival sound** - Currently no audio notification when new message arrives. Add generic pleasant sound.

- **Implement Account Deletion UI** - Design and implement a user-facing "Delete Account" button in Settings that allows users to permanently delete their account. Backend should handle full account deletion (or anonymization) including renaming their posts to "deleted-xxx" and removing personal data while preserving content for community context.

---

## 🎯 High Priority Features

- We are yet to implement a Vibes Score (Karma engine) into Web-V2 and how to better represent it

- **Refactor Comments into Separate Collection** - Currently comments are stored as Posts with a `commentOn` field. This causes architectural issues:
  1. **Problem**: Every feed query needs to filter out comments (`!post.commentOn`), activity notifications can't easily distinguish photos from comments, schema bloat (comments carry unused fields like `proximal_users`), Posts collection grows 10-100x faster than needed.
  2. **Solution**: Create dedicated `Comment` model/collection with fields: `_id`, `postId` (ref to parent Post), `userId`, `text`, `replyToCommentId` (for nested replies), `reactions[]`, `reports[]`, `createdAt`, `isDeleted`.
  3. **Migration**: Write script to move existing `Post` documents with `commentOn` to new `Comment` collection, update references.
  4. **API Changes**: `/api/comments/:postId` already exists - just needs to query new collection. Feed endpoints no longer need comment filtering.
  5. **Activity System**: Can use dedicated `comment` activity type without ambiguity.
  
  Estimated: 2-3 hours refactor + testing. This is proper data modeling that prevents future bugs.

- **Build In-House JSON-Based Rich Text Editor** - Replace current contentEditable + execCommand approach (deprecated, unreliable) with a proper JSON document model:
  1. **Document Model**: Define node types (paragraph, bulletList, listItem, text) with optional marks (bold, underline)
  2. **Operations/Commands**: insertText, deleteText, splitBlock, toggleMark, wrapInList, unwrapFromList - each transforms JSON predictably
  3. **Rendering Layer**: JSON model → React components → DOM with cursor/selection sync
  4. **Input Handling**: Keyboard events → operations, paste handling, IME support
  5. **Serialization**: JSON ↔ HTML conversion for storage compatibility
  
  This fixes bullet points, nested lists, and eliminates browser inconsistencies. Estimated: 2-4 weeks focused work. No external dependencies - we own it forever.

- **Enhanced Search Functionality** - Currently search only finds posts by caption text. Need to implement:
  1. **Search by Username** - Exact match (case-insensitive). Searching "kindness" should find all posts by user "Kindness", but "kind" should NOT match "kindness".
  2. **Hashtag Extraction & Search** - Extract hashtags from post captions on creation, store as lowercase array field. Searching `#travel` should specifically query the hashtags field. All hashtags stored in lowercase for consistency.
  3. Update search placeholder to "Search posts, users, or hashtags..."

- We need a technology approach that will enforce 1 user per account policy... maybe we can track users created using the exact same location or the exact same IP, and flag them with a unique identifier, and then group them under the User Management Admin Dashboard

- We should consider how secure our database is from hacking we do use Atlas MongoDB but is our API access to it best in class? 

- Security Upgrade (Encryption) in the future is needed, can't risk the locations of people being shared, especially if we start collecting real identification in the future, that stuff should probably be encrypted when stored in DB ( PII, financial info, passwords, and location data ). that means building an encryption layer....

- **Location Data Privacy Enhancement** - Location data should be obtained from cache or database only, NOT from browser GPS on every action. Location should only be requested from browser using the location component tool in two places:
  1. During signup (initial account creation)
  2. In Settings > Account Tab (when user manually updates location)
  This prevents constant GPS tracking, respects user privacy, and reduces battery drain. All other features (posts, nearby users, etc.) should use the cached location from user's profile in the database. 

- **Add birth date collection step to signup process** - Currently SignupWizard has `birthYear` and `birthMonth` fields with default values (defaults to 20 years old, month 1), but there's NO UI step where users actually input their birth date. Need to add a dedicated signup step (probably between steps 3-4) where users select their birth month and year. This is important for age verification and profile completeness.

- **Implement Strike System Frontend UI** - The backend has a complete graduated consequence system (strikes, 24h cooldowns, permanent bans) but there's NO frontend interface to display it to users. Need to implement:
  1. **Strike Warning Modal** - Shows when user opens app after receiving a strike, displays strike count (X/3), violation reason, cooldown duration, and links to community guidelines
  2. **Posting Restriction Checks** - Prevent posting/commenting during cooldown periods, show user-friendly error messages
  3. **Cooldown Timer Display** - Show countdown timer when user tries to post during restriction
  4. **Strike History in Settings** - Display active strikes, reasons, and expiration dates (30-day sliding window)
  5. **Banned User Screen** - Full-screen modal for Strike 4 (permanent ban) with appeal information
  Backend API already returns `canPost`, `canComment`, `strikeCount`, and `cooldownEnd` from `User.getCurrentRestrictions()` method - just need to consume it in the frontend.

- Return of the group chats, they're awesome but they have to provide a big coverage so... two solutions (both of these are just ideas because Telegram already exists for private convos, but public group chats largely depend on the community joining... so far group chats SUCK! can we make a version that doesn't suck? I don't know... Facebook tried and failed LOL. a lot of this depends on cultivating the ethos of encouraging people to use proper language and be kind. )
1. Create the grouped (conversations) where people invite more of their friends into the conversation. 
2. **Regional groups organized and moderated by verified residents of each city**. The goal is to create spaces that feel more like gathering with neighbors than shouting into a crowd. <--- this sounds awesome!


Wu-Wei Scoring Mechanism (Idea and Theory)
- **Wu-Wei Scoring Mechanism**: Replace punitive carrots/sticks with a fluid "Flow Score" that tracks effortless harmony. Users gain points for:
  1. **Compassionate Comments**: Supportive replies that foster understanding.
  2. **Frugal Shares**: Sharing local, non-commercial tips (e.g., free events).
  3. **Humble Actions**: Anonymous acts of kindness or yielding in discussions.

  There are no punishments. Instead, low scorers receive gentle prompts like "Embrace humility: share without seeking likes," which fade as users naturally align with the ethos. Redemption is facilitated through "Sinner Circles," opt-in local groups for open dialogue where all voices coexist without blocks, promoting acceptance and balance in the spirit of Daoist non-interference.

  Hmm: I cannot be the person decising which comment is compasionate and which post is frugal, or which actions (deeds with real life impact) translate to humble actions, maybe a small LLM can do this?
  -----


## Anti-Materialism Safeguards (Important)
Combat materialism by limiting posts to geo-tagged photos of everyday life (no luxury flexing via filters or ads), with AI nudging users toward "simple shares" like neighborhood walks or communal meals. Introduce "Treasure Challenges": daily quests based on Dao De Jing, e.g., "Practice frugality: recommend a free local resource," rewarding with visibility boosts in local feeds rather than tokens. Political dogma dissolves through "Duality Views," pairing opposing local opinions side-by-side without upvote wars, encouraging wu wei reflection over debate.​
---- possible but we don't do algorithims, we need a simple organic approach to this. incuring Wu-Wei reflection over debate?? interesting. difficult... gotta think about this more...---

Some ideas to embody DAOIST principles
Tech Basics: Use GPS for hyper-local (1-5km) feeds; cap daily posts to enforce frugality. - ​ (By ZipCode sounds like a better idea ), I like daily post caps. but allow comments and messages with no limits.

Launch MVP: Test in Chesterfield, VA, with your LLC, focusing on picture posts + Flow prompts. - hmm maybe. we already enforce pictures and have no filters.

Growth: Partner with kindness apps for cross-promos, avoiding VC greed. Measure success by real-world meetups, not DAUs.​ - Kindess Apps? maybe build my own kindness elements into this one? what does Personal Grown social network look like?

## Idea to avoid multiple accounts per person
Enforce registering using a popular Social Network OpenID like Google or Facebook.

## HUMAN ROLE (DEPLOYMENT TO QA)
(BACKUP MONGODB Databases for QA and PROD)
Verify Heroku CLI installed (heroku --version)
Connect GitHub to Heroku apps via Dashboard
Upload environment variables to both dynos
Run database migration scripts via Heroku CLI
Trigger deployments
Verify everything works