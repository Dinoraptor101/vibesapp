## 📋 Task Tracker

> **🔍 Code Cleanup Required**: See [Code-Cleanup-Report.md](./Code-Cleanup-Report.md) for ~780 lines of cleanup identified across 6 files.

> **🔧 Backend Refactoring (Deferred)**: See [controller-refactoring-summary.md](../controller-refactoring-summary.md). Requires comprehensive E2E test coverage before re-attempting.

> **✅ Completed Tasks**: See [development-log/completed-dec-2025.md](./development-log/completed-dec-2025.md) for UI/UX polish, infrastructure, and security fixes completed in December 2025.

---

### Testing & CI/CD
- [ ] Add E2E tests to PR checks - Create GitHub Actions workflow for Playwright on every PR
- [ ] DRY Playwright configs - Refactor to extend base config, eliminate ~40 lines duplication

### UI/UX Polish
- [ ] Implement Account Deletion UI - Add "Delete Account" button in Settings
- [ ] Implement browser notifications - Add Web Notifications API respecting user preferences
- [ ] Fix Activity timestamp caching - Recalculate relative times on render instead of caching
- [ ] Add page transition animations - Implement fade/slide for smoother navigation
- [ ] Add message arrival sound - Audio notification when messages arrive

### Core Features
- [ ] Implement Vibes Growth System UI - Build "Your Vibe" Settings tab per VIBES-GROWTH-SYSTEM.md
- [ ] Refactor comments into Comment collection - Separate model, migrate data, update endpoints
- [ ] Build JSON-based rich text editor - Replace contentEditable with JSON document model
- [ ] Implement username search - Add case-insensitive exact username matching
- [ ] Implement hashtag extraction/search - Parse hashtags, store as array, enable queries
- [ ] Implement Strike System frontend - Warning modal, cooldown timer, history view
- [ ] Email notifications for Admin Panel

### Security & Infrastructure
- [ ] Track/flag accounts by IP/location - Detect multiple accounts via middleware
- [ ] Audit MongoDB Atlas security - Review access, encryption, IP whitelist, rate limiting
- [ ] Implement data encryption layer - Encrypt PII before storage
- [ ] Restrict location requests - Only GPS during signup/Settings, cache elsewhere
- [ ] Research OAuth integration - Google/Facebook OpenID Connect

### Future Features
- [ ] Build group chat invite system - Add friends to existing conversations
- [ ] Design regional moderation - City-based groups with verified moderators
- [ ] Build Personal Growth Tracker - MBTI-driven with strength/rounding paths
- [ ] Design Wu-Wei Flow Score - Compassionate/frugal/humble action scoring
- [ ] Implement daily post cap - Enforce limit with friendly UI message

---

## Ideas & Philosophy

**Vibes Growth System** - Number-free visualization with organic plant growth metaphor (🌱→🌿→🌳→🌲→🌸)

**Personal Growth Tracker (Carrot Principle)** - MBTI-driven platform with Strength Path (double down on strengths) or Rounding Path (develop balanced personality)

**Wu-Wei Flow Score** - Replace punishment with harmony tracking via compassionate comments, frugal shares, humble actions

**Regional Group Chats** - City-based public spaces moderated by verified residents, creating neighborhood-like gatherings

**OAuth Enforcement** - Google/Facebook auth to enforce 1 person = 1 account policy

**Anti-Materialism** - Combat luxury flexing via geo-tagged everyday photos, "Treasure Challenges" rewarding simple local shares

**Daily Post Caps** - Enforce frugality through post limits while allowing unlimited comments/messages
