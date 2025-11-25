# Tech Debt: E2E Automation Coverage

> Last Updated: November 25, 2025

This document tracks areas of the application that require automated test coverage but are not yet implemented.

---

## 🚨 Priority 1: Admin Dashboard

### Admin Authentication
| Test Case | Status | Notes |
|-----------|--------|-------|
| Should display admin login page | ❌ Missing | |
| Should show error for empty password | ❌ Missing | |
| Should show error for invalid password | ❌ Missing | |
| Should redirect to dashboard on successful login | ❌ Missing | |
| Should persist admin session across page refresh | ❌ Missing | |
| Should auto-logout after session expiry (1 hour) | ❌ Missing | |
| Should include reCAPTCHA v3 verification | ❌ Missing | Phase 3.4 addition |

### Admin Dashboard Page
| Test Case | Status | Notes |
|-----------|--------|-------|
| Should display dashboard page with title | ❌ Missing | |
| Should display key metrics cards (users, posts, reports) | ❌ Missing | |
| Should show loading state initially | ❌ Missing | |
| Should display activity chart | ❌ Missing | |
| Should navigate to Flagged Posts page | ❌ Missing | |
| Should navigate to Users page | ❌ Missing | |
| Should navigate to Settings page | ❌ Missing | |
| Should be responsive on mobile viewport | ❌ Missing | Icons replace text labels |
| Should handle metric refresh | ❌ Missing | |

### Flagged Posts Management
| Test Case | Status | Notes |
|-----------|--------|-------|
| Should display list of reported posts | ❌ Missing | Uses `/admin/reported-posts` endpoint |
| Should show report count badge on each post | ❌ Missing | |
| Should show report breakdown by reason | ❌ Missing | pornographic, spam, hate_speech |
| Should filter by "All" posts | ❌ Missing | |
| Should filter by "Auto-Hidden" posts | ❌ Missing | |
| Should filter by "Under Review" posts | ❌ Missing | |
| Should sort by "Most Reports" | ❌ Missing | |
| Should sort by "Most Recent" | ❌ Missing | |
| Should sort by "Oldest First" | ❌ Missing | |
| Should delete a single post | ❌ Missing | |
| Should bulk delete selected posts | ❌ Missing | |
| Should dismiss reports (clears reports array) | ❌ Missing | Post removed from flagged list |
| Should navigate to post detail page | ❌ Missing | |
| Should display post thumbnail and caption | ❌ Missing | Caption is HTML rich text |

### User Management
| Test Case | Status | Notes |
|-----------|--------|-------|
| Should display list of users | ❌ Missing | |
| Should search users by username | ❌ Missing | |
| Should filter by banned status | ❌ Missing | |
| Should toggle ban on user | ❌ Missing | |
| Should regenerate user password | ❌ Missing | |
| Should view user detail page | ❌ Missing | |
| Should delete all posts for a user | ❌ Missing | |
| Should soft delete user | ❌ Missing | Renames to [deleted-xxx] |

---

## 🚨 Priority 2: Ban Mechanism (Community Moderation)

### Strike System
| Test Case | Status | Notes |
|-----------|--------|-------|
| User receives strike when post is auto-hidden | ❌ Missing | 3+ nearby reports triggers |
| Strike expires after 30 days | ❌ Missing | |
| Strike 4 triggers permanent ban | ❌ Missing | 100-year expiry |
| User enters 24-hour cooldown after strike | ❌ Missing | |

### Cooldown Restrictions
| Test Case | Status | Notes |
|-----------|--------|-------|
| User in cooldown cannot create posts | ❌ Missing | Returns 403 |
| User in cooldown cannot comment | ❌ Missing | Returns 403 |
| User in cooldown CAN still react (hearts) | ❌ Missing | |
| Cooldown ends after 24 hours | ❌ Missing | |

### Banned User Restrictions
| Test Case | Status | Notes |
|-----------|--------|-------|
| Banned user cannot create posts | ❌ Missing | Returns 403 |
| Banned user cannot comment | ❌ Missing | Returns 403 |
| Banned user cannot react | ❌ Missing | Returns 403 |
| Banned user can still view feed | ❌ Missing | Read-only access |
| Banned user sees appropriate error message | ❌ Missing | "Account permanently banned" |

### Admin Ban Actions
| Test Case | Status | Notes |
|-----------|--------|-------|
| Admin can toggle ban on user | ❌ Missing | Simple on/off |
| Admin full ban hides ALL user posts | ❌ Missing | Strike 4 + hide posts |
| Admin can restore hidden post | ❌ Missing | Unhides + removes strike |
| Restoring post unbans user if at Strike 4 | ❌ Missing | |

---

## 🚨 Priority 3: Report Post Flow

### User Reporting
| Test Case | Status | Notes |
|-----------|--------|-------|
| User can report post for "pornographic" | ❌ Missing | |
| User can report post for "spam" | ❌ Missing | |
| User can report post for "hate_speech" | ❌ Missing | |
| User cannot report own post | ❌ Missing | Returns 403 |
| User cannot report same post twice | ❌ Missing | Returns 409 |
| Reported post hidden from reporter immediately | ❌ Missing | `hiddenForUsers` array |
| Post auto-hidden after 3 nearby reports | ❌ Missing | Within 50 miles |

### Post Author Notifications
| Test Case | Status | Notes |
|-----------|--------|-------|
| Author receives `post_hidden` activity notification | ❌ Missing | |
| Author notified of strike received | ❌ Missing | |

---

## 📋 Test Data Requirements

### Admin Test User
```
Password: Set via ADMIN_PASSWORD env var
Session: 1-hour expiry, stored in cookies
```

### Test Scenarios Setup
- User with 0 strikes (normal)
- User with 1-3 strikes (cooldown scenarios)
- User with 4+ strikes (banned)
- Post with 1-2 reports (under review)
- Post with 3+ reports (auto-hidden)

---

## 🔧 Technical Notes

### API Endpoints for Admin
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/login` | POST | Admin authentication |
| `/api/admin/reported-posts` | GET | Fetch reported posts (Phase 3.4) |
| `/api/admin/posts/:postId/dismiss-reports` | POST | Clear reports |
| `/api/admin/posts` | DELETE | Bulk delete posts |
| `/api/admin/users` | GET | List users |
| `/api/admin/users/:userId/toggle-ban` | POST | Toggle ban |
| `/api/admin/users/:userId/ban` | POST | Full ban (Strike 4) |
| `/api/admin/posts/:postId/restore` | POST | Restore hidden post |

### Authentication Notes
- Admin routes excluded from Pigeon ID middleware
- Admin uses separate token auth (cookie-based)
- Session expires after 1 hour

---

## 📊 Coverage Summary

| Area | Tests Needed | Tests Written | Coverage |
|------|--------------|---------------|----------|
| Admin Auth | 7 | 0 | 0% |
| Admin Dashboard | 9 | 0 | 0% |
| Flagged Posts | 14 | 0 | 0% |
| User Management | 8 | 0 | 0% |
| Strike System | 4 | 0 | 0% |
| Cooldown | 4 | 0 | 0% |
| Banned User | 5 | 0 | 0% |
| Admin Ban Actions | 4 | 0 | 0% |
| Report Flow | 7 | 0 | 0% |
| **TOTAL** | **62** | **0** | **0%** |

---

## 🎯 Next Steps

1. Create admin login page object for reuse across tests
2. Set up test fixtures for admin authentication
3. Implement flagged posts tests first (highest user impact)
4. Add ban mechanism tests for community safety
5. Create helper utilities for strike/cooldown simulation
