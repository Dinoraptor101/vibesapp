const { octokit, REPO_OWNER, REPO_NAME, FEEDBACK_LABEL } = require('../config/github');

// Priority mapping: user-friendly → GitHub label
const PRIORITY_MAP = {
  critical: 'priority:critical', // → Project Board: Priority: Critical
  high: 'priority:high', // → Project Board: Priority: High
  medium: 'priority:medium', // → Project Board: Priority: Medium
  low: 'priority:low', // → Project Board: Priority: Low
};

// Create a new feedback issue
const submitFeedback = async (req, res) => {
  // Check if GitHub integration is available
  if (!octokit) {
    console.warn('Feedback submission attempted but GITHUB_PAT is not configured');
    return res.status(503).json({
      error: 'Feedback system is temporarily unavailable',
    });
  }

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

  // Validate priority if provided
  if (priority && !PRIORITY_MAP[priority]) {
    return res.status(400).json({
      error: 'Invalid priority. Must be one of: critical, high, medium, low',
    });
  }

  // Build labels array
  const labels = [FEEDBACK_LABEL, type];

  // Add priority label if provided (triggers sync-project-priority.yml workflow)
  if (priority) {
    labels.push(PRIORITY_MAP[priority]);
  }

  // Construct full CloudFront URL for screenshot if S3 key provided
  let screenshotMarkdown = '';
  if (screenshotUrl) {
    const CLOUDFRONT_URL = process.env.CLOUDFRONT_URL || 'https://d1pegm4swremw5.cloudfront.net';
    const fullScreenshotUrl = `${CLOUDFRONT_URL}/${screenshotUrl}`;
    screenshotMarkdown = `\n\n![screenshot](${fullScreenshotUrl})`;
  }

  // Build issue body with metadata
  const body = `${description}${screenshotMarkdown}

---
**Submitted via VibesApp**  
**User:** ${user.userName || 'Unknown'}  
**Priority:** ${priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Not set'}  
**App Version:** ${req.body.appVersion || 'Unknown'}  
**Build ID:** ${req.body.buildVersion || 'Unknown'}  
**Device:** ${req.body.userAgent || 'Unknown'}  
**Timestamp:** ${new Date().toISOString()}`;

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
  // Check if GitHub integration is available
  if (!octokit) {
    console.warn('Feedback list attempted but GITHUB_PAT is not configured');
    return res.status(503).json({
      error: 'Feedback system is temporarily unavailable',
    });
  }

  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      labels: FEEDBACK_LABEL,
      state: 'all', // Include both open and closed issues
      sort: 'created',
      direction: 'desc',
      per_page: 100,
    });

    // Transform GitHub issues to frontend-friendly format
    const feedback = response.data.map((issue) => {
      // Extract priority from labels (priority:high, priority:critical, etc.)
      const priorityLabel = issue.labels.find((label) =>
        typeof label === 'string'
          ? label.startsWith('priority:')
          : label.name?.startsWith('priority:')
      );
      const priority = priorityLabel
        ? (typeof priorityLabel === 'string' ? priorityLabel : priorityLabel.name).replace('priority:', '')
        : 'medium';

      // Determine type from labels
      const hasFeatureLabel = issue.labels.some((label) =>
        typeof label === 'string' ? label === 'feature' : label.name === 'feature'
      );
      const type = hasFeatureLabel ? 'feature' : 'bug';

      return {
        id: issue.number,
        title: issue.title.replace(/^\[(🐛 Bug|✨ Feature)\]\s*/, ''), // Strip prefix
        description: issue.body || '',
        type,
        priority,
        status: issue.state, // 'open' or 'closed'
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
      };
    });

    res.json({ feedback });
  } catch (error) {
    console.error('GitHub API error listing feedback:', {
      error: error.message,
    });
    res.status(500).json({ error: 'Failed to list feedback' });
  }
};

module.exports = { submitFeedback, listFeedback };
