const {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  FEEDBACK_LABEL,
} = require('../config/github');

// Priority mapping: user-friendly → GitHub label
const PRIORITY_MAP = {
  critical: 'priority:critical', // → Project Board: Priority: Critical
  high: 'priority:high', // → Project Board: Priority: High
  medium: 'priority:medium', // → Project Board: Priority: Medium
  low: 'priority:low', // → Project Board: Priority: Low
};

// Create a new feedback issue
const submitFeedback = async (req, res) => {
  const { title, description, type, priority, screenshotUrl } = req.body;
  const user = req.user; // From pigeonAuth middleware

  // Validate required fields
  if (!title || !description || !type) {
    return res.status(400).json({
      error: 'Missing required fields: title, description, and type are required',
    });
  }

  // Validate type
  if (type !== 'bug' && type !== 'feature') {
    return res.status(400).json({
      error: 'Invalid type. Must be either "bug" or "feature"',
    });
  }

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
**User:** ${user.userName || 'Unknown'}  
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
      labels,
    });

    // Note: sync-project-priority.yml workflow will automatically
    // update the Priority field on the Project Board when it detects
    // priority:* labels on this issue

    res.json({
      success: true,
      issueNumber: response.data.number,
    });
  } catch (error) {
    console.error('GitHub API error submitting feedback:', {
      error: error.message,
      user: user.userName,
      type,
      title: title.substring(0, 50), // Log first 50 chars only
    });
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// List all feedback issues
const listFeedback = async (req, res) => {
  try {
    // Support pagination via query params
    const page = parseInt(req.query.page) || 1;
    const perPage = Math.min(parseInt(req.query.per_page) || 100, 100); // Max 100
    
    const response = await octokit.rest.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      labels: FEEDBACK_LABEL,
      state: 'all',
      per_page: perPage,
      page: page,
      sort: 'created',
      direction: 'desc',
    });

    // Transform to minimal shape for frontend
    const feedback = response.data.map((issue) => {
      // Extract priority from labels
      let priority = null;
      for (const label of issue.labels) {
        const labelName = typeof label === 'string' ? label : label.name;
        if (labelName.startsWith('priority:')) {
          priority = labelName.replace('priority:', '');
          break;
        }
      }

      return {
        id: issue.number,
        title: issue.title.replace(/^\[(🐛 Bug|✨ Feature)\] /, ''),
        type: issue.labels.some((l) => {
          const name = typeof l === 'string' ? l : l.name;
          return name === 'bug';
        })
          ? 'bug'
          : 'feature',
        priority,
        status: issue.state, // 'open' or 'closed'
        description: issue.body,
        createdAt: issue.created_at,
        closedAt: issue.closed_at,
      };
    });

    res.json({ feedback });
  } catch (error) {
    console.error('GitHub API error fetching feedback:', {
      error: error.message,
    });
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

module.exports = { submitFeedback, listFeedback };
