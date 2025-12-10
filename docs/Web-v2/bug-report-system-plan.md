# Bug Report & Feature Request System - Planning Document

**Date:** 10 December 2025  
**Updated:** 10 December 2025 (Simplified to barebones approach)  
**Philosophy:** Plan 80%, develop 20% — it's much easier to plan and iterate than develop and fix.

---

## Final Architecture: GitHub Issues as Backend

After extensive planning, the simplest solution emerged:

**VibesApp Backend acts as proxy to GitHub Issues API.**

Users never see GitHub. Users never need GitHub accounts. The backend (authenticated with a GitHub PAT) creates and reads issues in the private `vibesapp` repo. Users interact entirely through VibesApp's UI.

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER FLOW                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User (in VibesApp)                                             │
│       │                                                         │
│       ▼                                                         │
│  Settings → Support → "Submit Feedback"                         │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────┐                                        │
│  │   Submission Form   │  ← Type: Bug / Feature                 │
│  │   - Title           │  ← Description                         │
│  │   - Screenshot      │  ← Uploads to S3, link in body         │
│  └─────────────────────┘                                        │
│       │                                                         │
│       ▼                                                         │
│  VibesApp API                                                   │
│  POST /api/feedback/submit                                      │
│       │                                                         │
│       ▼                                                         │
│  GitHub API (Octokit)                                           │
│  Creates Issue in private repo                                  │
│  Labels: "user-feedback", "bug" or "feature"                    │
│       │                                                         │
│       ▼                                                         │
│  User gets confirmation: "Thanks! We'll look into it."          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      TRANSPARENCY VIEW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User navigates to Settings → Support → "View Feedback"         │
│       │                                                         │
│       ▼                                                         │
│  VibesApp API                                                   │
│  GET /api/feedback/list                                         │
│       │                                                         │
│       ▼                                                         │
│  GitHub API (Octokit)                                           │
│  Fetches issues with label "user-feedback"                      │
│       │                                                         │
│       ▼                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Feedback List (Read-Only)                                  ││
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │ 🐛 Bug: Like button not responding                    │  ││
│  │  │    Status: Open | Submitted: 2 hours ago              │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │ ✨ Feature: Dark mode for messages                    │  ││
│  │  │    Status: Closed | Completed: 1 day ago              │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  Click any item → Expands to show full description              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Experience Scenarios

### Scenario 1: Submit a Bug Report

```gherkin
Given I am an authenticated VibesApp user
  And I found a bug in the app
  And I navigate to Settings → Support
When I click "Submit Feedback"
Then I see a submission form
When I select type "Bug"
Then I see a Description input
When I enter the bug details
  And I upload a screenshot (optional)
  And I click Submit
Then my report is created as a GitHub Issue
  And I see a confirmation message
```

### Scenario 2: View All Feedback (Transparency)

```gherkin
Given I already submitted a bug report
When I navigate to Settings → Support
  And I click "View Feedback"
Then I see a list of all user-submitted issues
  And each item shows: type (bug/feature), title, status, date
  And the view is read-only
When I click an item
Then it expands to show the full description
```

---

## Technical Implementation

### File Structure (Isolated in web-v2)

```
apps/web-v2/src/features/feedback/
├── api/
│   └── feedbackService.ts        # API calls to backend
├── components/
│   ├── FeedbackForm.tsx          # Submission form
│   └── FeedbackList.tsx          # Read-only list view
├── pages/
│   └── FeedbackPage.tsx          # Full-page route /feedback
├── types.ts                      # TypeScript types
└── index.ts                      # Exports

apps/api/src/
├── routes/
│   └── feedback.js               # Express routes
├── controllers/
│   └── feedback.js               # GitHub API logic
└── config/
    └── github.js                 # Octokit setup
```

### Backend: GitHub Integration

```javascript
// apps/api/src/config/github.js
const { Octokit } = require('octokit');

const octokit = new Octokit({
  auth: process.env.GITHUB_PAT  // Personal Access Token with repo scope
});

const REPO_OWNER = 'Dinoraptor101';
const REPO_NAME = 'vibesapp';
const FEEDBACK_LABEL = 'user-feedback';

module.exports = { octokit, REPO_OWNER, REPO_NAME, FEEDBACK_LABEL };
```

```javascript
// apps/api/src/controllers/feedback.js
const { octokit, REPO_OWNER, REPO_NAME, FEEDBACK_LABEL } = require('../config/github');

// Priority mapping: user-friendly → GitHub label
const PRIORITY_MAP = {
  'critical': 'priority:critical',  // → Project Board: Priority: Critical
  'high': 'priority:high',          // → Project Board: Priority: High
  'medium': 'priority:medium',      // → Project Board: Priority: Medium
  'low': 'priority:low'             // → Project Board: Priority: Low
};

// Create a new feedback issue
const submitFeedback = async (req, res) => {
  const { title, description, type, priority, screenshotUrl } = req.body;
  const user = req.user; // From pigeonAuth middleware
  
  // Build labels array
  const labels = [FEEDBACK_LABEL, type];
  
  // Add priority label if provided (triggers sync-project-priority.yml workflow)
  if (priority && PRIORITY_MAP[priority]) {
    labels.push(PRIORITY_MAP[priority]);
  }
  
  // Build issue body with metadata
  const body = `
${description}

${screenshotUrl ? `**Screenshot:** ![screenshot](${screenshotUrl})` : ''}

---
**Submitted via VibesApp**  
**User:** ${user.username}  
**Priority:** ${priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Not set'}  
**App Version:** ${req.body.appVersion || 'Unknown'}  
**Device:** ${req.body.userAgent || 'Unknown'}  
**Timestamp:** ${new Date().toISOString()}
`;

  try {
    const response = await octokit.rest.issues.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `[${type === 'bug' ? '🐛 Bug' : '✨ Feature'}] ${title}`,
      body,
      labels
    });

    // Note: sync-project-priority.yml workflow will automatically
    // update the Priority field on the Project Board when it detects
    // priority:* labels on this issue

    res.json({ 
      success: true, 
      issueNumber: response.data.number 
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// List all feedback issues
const listFeedback = async (req, res) => {
  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      labels: FEEDBACK_LABEL,
      state: 'all',
      per_page: 100,
      sort: 'created',
      direction: 'desc'
    });

    // Transform to minimal shape for frontend
    const feedback = response.data.map(issue => ({
      id: issue.number,
      title: issue.title.replace(/^\[(🐛 Bug|✨ Feature)\] /, ''),
      type: issue.labels.some(l => l.name === 'bug') ? 'bug' : 'feature',
      status: issue.state, // 'open' or 'closed'
      description: issue.body,
      createdAt: issue.created_at,
      closedAt: issue.closed_at
    }));

    res.json({ feedback });
  } catch (error) {
    console.error('GitHub API error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

module.exports = { submitFeedback, listFeedback };
```

```javascript
// apps/api/src/routes/feedback.js
const express = require('express');
const router = express.Router();
const pigeonAuth = require('../middleware/pigeonAuth');
const { submitFeedback, listFeedback } = require('../controllers/feedback');

// Submit feedback (requires auth)
router.post('/submit', pigeonAuth, submitFeedback);

// List all feedback (public read, but still requires auth to prevent scraping)
router.get('/list', pigeonAuth, listFeedback);

module.exports = router;
```

### Frontend: Components

```typescript
// apps/web-v2/src/features/feedback/types.ts
export interface FeedbackItem {
  id: number;
  title: string;
  type: 'bug' | 'feature';
  priority: 'critical' | 'high' | 'medium' | 'low' | null;
  status: 'open' | 'closed';
  description: string;
  createdAt: string;
  closedAt: string | null;
}

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface SubmitFeedbackRequest {
  title: string;
  description: string;
  type: 'bug' | 'feature';
  priority: Priority;
  screenshotUrl?: string;
  appVersion: string;
  userAgent: string;
}
```

```typescript
// apps/web-v2/src/features/feedback/api/feedbackService.ts
import apiClient from '@/lib/api';
import type { FeedbackItem, SubmitFeedbackRequest } from '../types';

export async function submitFeedback(data: SubmitFeedbackRequest): Promise<{ issueNumber: number }> {
  const response = await apiClient.post('/feedback/submit', data);
  return response;
}

export async function listFeedback(): Promise<FeedbackItem[]> {
  const response = await apiClient.get<{ feedback: FeedbackItem[] }>('/feedback/list');
  return response.feedback;
}
```

```tsx
// apps/web-v2/src/features/feedback/components/FeedbackForm.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitFeedback } from '../api/feedbackService';
import { APP_VERSION } from '@/lib/constants';
import type { Priority } from '../types';

export function FeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'bug' | 'feature'>('bug');
  const [priority, setPriority] = useState<Priority>('medium');
  const [screenshotUrl, setScreenshotUrl] = useState<string>();

  const mutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      onSuccess();
      // Reset form
      setTitle('');
      setDescription('');
      setType('bug');
      setPriority('medium');
      setScreenshotUrl(undefined);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      description,
      type,
      priority,
      screenshotUrl,
      appVersion: APP_VERSION,
      userAgent: navigator.userAgent
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selection */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="bug"
            checked={type === 'bug'}
            onChange={() => setType('bug')}
          />
          <span>🐛 Bug Report</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="feature"
            checked={type === 'feature'}
            onChange={() => setType('feature')}
          />
          <span>✨ Feature Request</span>
        </label>
      </div>

      {/* Priority Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Priority</label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full p-3 border rounded-lg"
        >
          <option value="critical">🔴 Critical - App is broken/unusable</option>
          <option value="high">🟠 High - Major issue, needs attention soon</option>
          <option value="medium">🟡 Medium - Should be fixed, but not urgent</option>
          <option value="low">🟢 Low - Nice to have, minor issue</option>
        </select>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Brief summary..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
        className="w-full p-3 border rounded-lg"
      />

      {/* Description */}
      <textarea
        placeholder={type === 'bug' 
          ? "What happened? What did you expect? Steps to reproduce..."
          : "Describe the feature. What problem does it solve?"
        }
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={6}
        required
        className="w-full p-3 border rounded-lg"
      />

      {/* Screenshot Upload (uses existing S3 upload) */}
      {/* TODO: Add S3Upload component here */}

      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-blue-500 text-white rounded-lg"
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
      </button>

      {mutation.isSuccess && (
        <p className="text-green-600">Thanks! We'll look into it.</p>
      )}
    </form>
  );
}
```

```tsx
// apps/web-v2/src/features/feedback/components/FeedbackList.tsx
import { useQuery } from '@tanstack/react-query';
import { listFeedback } from '../api/feedbackService';
import { useState } from 'react';
import type { Priority } from '../types';

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800'
};

const PRIORITY_ICONS: Record<Priority, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢'
};

export function FeedbackList() {
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback'],
    queryFn: listFeedback
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-3">
      {feedback?.map(item => (
        <div 
          key={item.id}
          className="border rounded-lg p-4 cursor-pointer"
          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
        >
          <div className="flex items-center gap-2">
            <span>{item.type === 'bug' ? '🐛' : '✨'}</span>
            <h3 className="font-medium flex-1">{item.title}</h3>
            {item.priority && (
              <span className={`text-xs px-2 py-1 rounded ${PRIORITY_COLORS[item.priority]}`}>
                {PRIORITY_ICONS[item.priority]} {item.priority}
              </span>
            )}
            <span className={`text-sm px-2 py-1 rounded ${
              item.status === 'open' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {item.status === 'open' ? 'Open' : 'Completed'}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">
            Submitted {new Date(item.createdAt).toLocaleDateString()}
          </p>

          {expandedId === item.id && (
            <div className="mt-4 pt-4 border-t text-sm whitespace-pre-wrap">
              {item.description?.split('---')[0] || 'No description'}
            </div>
          )}
        </div>
      ))}

      {feedback?.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No feedback submitted yet. Be the first!
        </p>
      )}
    </div>
  );
}
```

```tsx
// apps/web-v2/src/features/feedback/pages/FeedbackPage.tsx
import { useState } from 'react';
import { FeedbackForm } from '../components/FeedbackForm';
import { FeedbackList } from '../components/FeedbackList';

export function FeedbackPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Feedback & Support</h1>

      {!showForm ? (
        <>
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 mb-6 bg-blue-500 text-white rounded-lg"
          >
            Submit Feedback
          </button>
          
          <h2 className="text-lg font-semibold mb-4">All Submissions</h2>
          <FeedbackList />
        </>
      ) : (
        <>
          <button
            onClick={() => setShowForm(false)}
            className="mb-4 text-blue-500"
          >
            ← Back to list
          </button>
          <FeedbackForm onSuccess={() => setShowForm(false)} />
        </>
      )}
    </div>
  );
}
```

---

## GitHub Setup (One-Time)

### 1. Create Personal Access Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Scopes needed: `repo` (full control of private repos)
4. Copy token → Add to `apps/api/.env` as `GITHUB_PAT`

### 2. Create Labels in Repository
In `vibesapp` repo, create labels:

**Type labels:**
- `user-feedback` (identifies all user submissions)
- `bug` (bug reports)
- `feature` (feature requests)

**Priority labels:**
- `priority:critical` — 🔴 Red (#B60205)
- `priority:high` — 🟠 Orange (#D93F0B)
- `priority:medium` — 🟡 Yellow (#FBCA04)
- `priority:low` — 🟢 Green (#0E8A16)

*These match the existing `sync-project-priority.yml` workflow which syncs priority labels to project board columns.*

### 3. (Optional) GitHub Projects Board
Create a Project board with columns:
- **Backlog** (new issues)
- **In Progress**
- **Priority: Critical** (auto-populated by workflow)
- **Priority: High** (auto-populated by workflow)
- **Done**

Issues can be managed via GitHub UI—no admin panel needed in VibesApp.

---

## What's NOT Included (Intentionally)

❌ **Voting** — Adds complexity, can add later  
❌ **Comments** — Users can't discuss (keeps it simple)  
❌ **Filters** — Just chronological list  
❌ **Status updates UI** — Managed via GitHub directly  
❌ **Admin panel** — Use GitHub's native UI  
❌ **Email notifications** — GitHub handles this for repo watchers  

---

## Development Effort Estimate

| Task | Hours |
|---|---|
| Backend: GitHub config + 2 endpoints | 2-3 |
| Frontend: FeedbackForm component | 2-3 |
| Frontend: FeedbackList component | 2-3 |
| Frontend: FeedbackPage + routing | 1 |
| Screenshot upload integration | 1-2 |
| Unit tests | 2-3 |
| **Total** | **10-15 hours** |

**Realistic with buffer:** 12-16 hours (1.5-2 days)

---

## Why This Approach?

### Simplicity
- No new database
- No new infrastructure
- No separate hosting
- No admin UI to build

### Transparency
- Users see all submissions
- Status visible (open/closed)
- Nothing hidden

### Integration
- GitHub Issues = your existing workflow
- No context switching
- Issues link directly to code changes

### Spiritual Alignment
- Shows the work
- Honest about bugs
- Community sees real development process
- No corporate bloat

---

## Data Privacy

### What's Captured:
✅ Username (display name only)  
✅ App version  
✅ User agent (browser/device)  
✅ Timestamp  
✅ Screenshot (if uploaded)

### What's NEVER Captured:
❌ pigeonId (auth credential)  
❌ GPS coordinates  
❌ Email address  
❌ User ID (not needed)

---

## Next Steps

1. **Generate GitHub PAT** → Add to environment
2. **Create labels** in vibesapp repo
3. **Build backend** → 2 endpoints
4. **Build frontend** → Form + List
5. **Add route** → Settings → Support → /feedback
6. **Test** → Submit a bug, verify it appears
7. **Ship** 🚀

---

**Plan complete. Simple. Clean. Done.**
