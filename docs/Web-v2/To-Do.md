## 📋 Task Tracker

> **🔍 Code Cleanup Required**: See [development-log/Code-Cleanup-Report.md](./development-log/Code-Cleanup-Report.md) for ~780 lines of cleanup identified across 6 files.

> **🔧 Backend Refactoring (Deferred)**: See [controller-refactoring-summary.md](../controller-refactoring-summary.md). Requires comprehensive E2E test coverage before re-attempting.

> **✅ Completed Tasks**: See [development-log/completed-dec-2025.md](./development-log/completed-dec-2025.md) for UI/UX polish, infrastructure, and security fixes completed in December 2025.

---

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
