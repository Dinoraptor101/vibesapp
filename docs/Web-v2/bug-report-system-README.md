# Bug Report & Feature Request System

**Status:** ✅ Complete  
**Date:** 10 December 2025

## Overview

VibesApp's feedback system uses **GitHub Issues as backend** with VibesApp as a transparent UI proxy. Users submit bugs and feature requests through the app, which creates GitHub issues via the Octokit API. Users never see GitHub and never need GitHub accounts.

## Architecture

```
User (in VibesApp) 
  → Settings → Support → "Submit Feedback"
  → FeedbackForm component
  → POST /api/feedback/submit
  → Backend (with GitHub PAT)
  → Octokit API
  → GitHub Issues (vibesapp repo)
  → User sees confirmation
```

## Features

### User Capabilities
- ✅ Submit bug reports with priority levels (critical/high/medium/low)
- ✅ Submit feature requests
- ✅ View all submitted feedback (transparency)
- ✅ See status (open/closed)
- ✅ Expand items to read full descriptions
- ✅ Dark/dim mode support

### Technical Features
- ✅ GitHub Issues integration via Octokit
- ✅ Priority labels sync with project board workflow
- ✅ Authenticated submissions (pigeonAuth)
- ✅ Pagination support
- ✅ Comprehensive error logging
- ✅ TypeScript type safety
- ✅ E2E test IDs

## Implementation

### Backend (`apps/api/src`)

**config/github.js**
- Octokit client initialization
- Repository configuration (env-based)
- GITHUB_PAT authentication

**controllers/feedback.js**
- `submitFeedback`: Creates GitHub issue with metadata
- `listFeedback`: Fetches issues with user-feedback label
- Priority mapping to GitHub labels
- Error logging with context

**routes/feedback.js**
- POST `/api/feedback/submit` - Create feedback
- GET `/api/feedback/list` - List all feedback
- Both require `pigeonAuth` middleware

### Frontend (`apps/web-v2/src/features/feedback`)

**types.ts**
- `FeedbackItem`: Issue representation
- `Priority`: Type-safe priority levels
- `SubmitFeedbackRequest`: Submission payload

**api/feedbackService.ts**
- `submitFeedback()`: POST to backend
- `listFeedback()`: GET from backend

**components/FeedbackForm.tsx**
- Type selection (bug/feature)
- Priority dropdown with emoji indicators
- Title + description inputs
- React Query mutation
- Success/error feedback

**components/FeedbackList.tsx**
- React Query for data fetching
- Expandable items
- Priority badges with colors
- Status indicators (open/completed)

**pages/FeedbackPage.tsx**
- Toggle between form and list
- Navigation controls

### Integration Points

**Router** (`apps/web-v2/src/app/Router.tsx`)
- Route: `/feedback`
- Protected with auth

**Settings** (`apps/web-v2/src/features/settings/components/SupportTab.tsx`)
- "Submit Feedback or Report Bug" button
- Links to `/feedback`
- Maintains Telegram contact option

## Environment Setup

### Required Environment Variables

```bash
# apps/api/.env
GITHUB_PAT=github_pat_xxxxxxxxxxxxx  # Requires 'repo' scope

# Optional (defaults shown)
GITHUB_REPO_OWNER=Dinoraptor101
GITHUB_REPO_NAME=vibesapp
```

### GitHub Setup (One-Time)

1. **Create Personal Access Token**
   - Go to https://github.com/settings/tokens
   - Generate new token (classic)
   - Scope: `repo` (full control of private repos)
   - Copy token → Add to `.env` as `GITHUB_PAT`

2. **Create Labels in Repository**
   - `user-feedback` (identifies all user submissions)
   - `bug` (bug reports)
   - `feature` (feature requests)
   - `priority:critical` - 🔴 Red (#B60205)
   - `priority:high` - 🟠 Orange (#D93F0B)
   - `priority:medium` - 🟡 Yellow (#FBCA04)
   - `priority:low` - 🟢 Green (#0E8A16)

## API Reference

### POST /api/feedback/submit

**Request:**
```json
{
  "title": "Brief summary",
  "description": "Detailed description",
  "type": "bug" | "feature",
  "priority": "critical" | "high" | "medium" | "low",
  "screenshotUrl": "optional S3 URL",
  "appVersion": "2.0.0",
  "userAgent": "Mozilla/5.0..."
}
```

**Response:**
```json
{
  "success": true,
  "issueNumber": 123
}
```

### GET /api/feedback/list

**Query Params:**
- `page` (optional, default: 1)
- `per_page` (optional, default: 100, max: 100)

**Response:**
```json
{
  "feedback": [
    {
      "id": 123,
      "title": "Like button not responding",
      "type": "bug",
      "priority": "high",
      "status": "open",
      "description": "Full description...",
      "createdAt": "2025-12-10T20:00:00Z",
      "closedAt": null
    }
  ]
}
```

## Security Considerations

### Rate Limiting
**Status:** ⚠️ Not implemented (consistent with project pattern)

The feedback routes follow the project's established pattern:
- Authentication via `pigeonAuth` middleware provides base protection
- No dedicated rate limiting middleware exists project-wide
- Future enhancement: Consider adding rate limiting to prevent abuse

**Recommendation:** Add rate limiting middleware in future sprint if abuse occurs.

### Data Privacy

**What's Captured:**
- ✅ Username (display name only)
- ✅ App version
- ✅ User agent (browser/device)
- ✅ Timestamp
- ✅ Screenshot URL (if uploaded)

**What's NEVER Captured:**
- ❌ pigeonId (auth credential)
- ❌ GPS coordinates
- ❌ Email address
- ❌ Internal user ID

## Testing

### Manual Testing Checklist
- [ ] Navigate to Settings → Support
- [ ] Click "Submit Feedback or Report Bug"
- [ ] Select bug type, set priority
- [ ] Enter title and description
- [ ] Submit form
- [ ] Verify success message
- [ ] Click "Back to list"
- [ ] Verify new item appears in list
- [ ] Click item to expand description
- [ ] Verify GitHub issue created in repo

### E2E Test IDs
```typescript
// Form
"feedback-type-bug"
"feedback-type-feature"
"feedback-priority-select"
"feedback-title-input"
"feedback-description-input"
"feedback-submit-button"
"feedback-success-message"
"feedback-error-message"

// List
"feedback-item-{id}"
"feedback-priority-{id}"
"feedback-status-{id}"
"feedback-description-{id}"

// Navigation
"show-feedback-form-button"
"back-to-feedback-list-button"
"support-feedback-button" // In SupportTab
```

## Future Enhancements

### Not Included (Intentionally Simple)
- ❌ Voting - Adds complexity
- ❌ Comments - Users can't discuss
- ❌ Filters - Just chronological list
- ❌ Status updates UI - Managed via GitHub
- ❌ Admin panel - Use GitHub's native UI
- ❌ Email notifications - GitHub handles this

### Possible Additions
- Screenshot upload integration (S3Upload component)
- Rate limiting middleware
- Search/filter functionality
- Infinite scroll pagination
- Real-time updates via SSE

## Spiritual Alignment

This feature serves VibesApp's mission to **repair the human spirit** by:

1. **Transparency** - Users see all submissions, nothing hidden
2. **Trust** - Open process, honest about bugs
3. **Community** - Real development process visible
4. **Simplicity** - No corporate bloat, just functional feedback

Users don't need to understand GitHub. The system handles complexity so humans can *feel* heard, not think about infrastructure.

## Maintenance

### Monitoring
- GitHub Issues dashboard for triage
- Project board for prioritization
- Backend logs for API errors

### Common Issues

**"Failed to submit feedback"**
- Check GITHUB_PAT is valid
- Verify token has `repo` scope
- Check rate limits on GitHub API

**"Failed to fetch feedback"**
- Verify repository exists
- Check `user-feedback` label exists
- Verify GITHUB_PAT permissions

## References

- Planning document: `docs/Web-v2/bug-report-system-plan.md`
- Octokit documentation: https://github.com/octokit/octokit.js
- GitHub Issues API: https://docs.github.com/en/rest/issues
