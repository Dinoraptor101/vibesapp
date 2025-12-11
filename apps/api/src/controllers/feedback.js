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
**User ID:** ${user._id}  
**User:** ${user.userName || 'Unknown'}  
**Priority:** ${priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Not set'}  
**App Version:** ${req.body.appVersion || 'Unknown'}  
**Build ID:** ${req.body.buildVersion || 'Unknown'}  
**Device:** ${req.body.userAgent || 'Unknown'}  
**Timestamp:** ${new Date().toISOString()}

---
**Me Too:**  
<!-- ME_TOO_LIST_START -->
<!-- ME_TOO_LIST_END -->`;

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

  const userId = req.validatedUserId; // From pigeonAuth middleware

  try {
    const response = await octokit.rest.issues.listForRepo({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      labels: FEEDBACK_LABEL,
      state: 'open', // Only show open issues to public
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
        ? (typeof priorityLabel === 'string' ? priorityLabel : priorityLabel.name).replace(
            'priority:',
            ''
          )
        : 'medium';

      // Determine type from labels
      const hasFeatureLabel = issue.labels.some((label) =>
        typeof label === 'string' ? label === 'feature' : label.name === 'feature'
      );
      const type = hasFeatureLabel ? 'feature' : 'bug';

      // Count +1 reactions (thumbs up)
      const upvotes = issue.reactions?.['+1'] || 0;
      const commentCount = issue.comments || 0;

      // Parse Me Too list from issue body
      const body = issue.body || '';
      const meTooMatch = body.match(/<!-- ME_TOO_LIST_START -->([\s\S]*?)<!-- ME_TOO_LIST_END -->/);
      let hasMeToo = false;
      if (meTooMatch && userId) {
        const meTooContent = meTooMatch[1];
        // Check if userId appears in the Me Too list
        hasMeToo = meTooContent.includes(`userId:${userId}`);
      }

      // Strip Me Too list and submitter metadata from description
      let cleanDescription = body
        .replace(/<!-- ME_TOO_LIST_START -->[\s\S]*?<!-- ME_TOO_LIST_END -->/g, '')
        .replace(/<!-- SUBMITTER_METADATA_START -->[\s\S]*?<!-- SUBMITTER_METADATA_END -->/g, '')
        .trim();

      // Remove everything from "---" followed by "**Submitted via VibesApp**" onwards
      const submittedViaIndex = cleanDescription.indexOf('---\n**Submitted via VibesApp**');
      if (submittedViaIndex !== -1) {
        cleanDescription = cleanDescription.substring(0, submittedViaIndex).trim();
      }

      return {
        id: issue.number,
        title: issue.title.replace(/^\[(🐛 Bug|✨ Feature)\]\s*/, ''), // Strip prefix
        description: cleanDescription,
        type,
        priority,
        status: issue.state, // 'open' or 'closed'
        upvotes,
        commentCount,
        hasMeToo,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        url: issue.html_url,
      };
    });

    res.json({ feedback });
  } catch (error) {
    console.error('GitHub API error listing feedback:', {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: 'Failed to list feedback' });
  }
};

// Add comment to an issue
const addComment = async (req, res) => {
  if (!octokit) {
    return res.status(503).json({ error: 'Feedback system is temporarily unavailable' });
  }

  const { issueNumber } = req.params;
  const { comment } = req.body;
  const user = req.user;

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: 'Comment cannot be empty' });
  }

  const formattedComment = `💬 **Comment via VibesApp**\n**User:** ${user.userName || 'Unknown'}\n\n${comment}`;

  try {
    await octokit.rest.issues.createComment({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: Number(issueNumber),
      body: formattedComment,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('GitHub API error adding comment:', {
      error: error.message,
      user: user.userName,
      issueNumber,
    });
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Add "Me Too" to an issue (reaction + update description)
const meToo = async (req, res) => {
  if (!octokit) {
    return res.status(503).json({ error: 'Feedback system is temporarily unavailable' });
  }

  const { issueNumber } = req.params;
  const user = req.user;
  const userId = req.validatedUserId;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Get current issue
    const issue = await octokit.rest.issues.get({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: Number(issueNumber),
    });

    const currentBody = issue.data.body || '';

    // Check if user already in Me Too list
    const meTooMatch = currentBody.match(
      /<!-- ME_TOO_LIST_START -->([\s\S]*?)<!-- ME_TOO_LIST_END -->/
    );

    if (meTooMatch?.[1]?.includes(`userId:${userId}`)) {
      return res.status(400).json({ error: 'Already added Me Too' });
    }

    // Add user to Me Too list
    const meTooEntry = `\n- ${user.userName || 'Unknown'} (userId:${userId}) - ${new Date().toISOString()}`;
    let newBody;

    if (meTooMatch) {
      // Me Too list exists, append to it
      const existingList = meTooMatch[1];
      newBody = currentBody.replace(
        /<!-- ME_TOO_LIST_START -->([\s\S]*?)<!-- ME_TOO_LIST_END -->/,
        `<!-- ME_TOO_LIST_START -->${existingList}${meTooEntry}\n<!-- ME_TOO_LIST_END -->`
      );
    } else {
      // No Me Too list, add it
      newBody = `${currentBody}\n\n---\n**Me Too:**  \n<!-- ME_TOO_LIST_START -->${meTooEntry}\n<!-- ME_TOO_LIST_END -->`;
    }

    // Update issue body
    await octokit.rest.issues.update({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: Number(issueNumber),
      body: newBody,
    });

    // Add +1 reaction
    await octokit.rest.reactions.createForIssue({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: Number(issueNumber),
      content: '+1',
    });

    res.json({ success: true });
  } catch (error) {
    console.error('GitHub API error adding Me Too:', {
      error: error.message,
      issueNumber,
    });
    res.status(500).json({ error: 'Failed to add Me Too' });
  }
};

module.exports = { submitFeedback, listFeedback, meToo, addComment };
