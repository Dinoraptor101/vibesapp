const { Octokit } = require('octokit');

// Validate GH_PAT is present (only required in production/development, not in tests)
if (!process.env.GH_PAT && process.env.NODE_ENV !== 'test') {
  console.warn(
    'GH_PAT not set. Feedback system will not work. Set GH_PAT in your .env file with a GitHub Personal Access Token that has "repo" scope.'
  );
}

// Initialize Octokit with GitHub PAT from environment (if available)
const octokit = process.env.GH_PAT
  ? new Octokit({
      auth: process.env.GH_PAT,
    })
  : null;

// Repository configuration - use env vars if available, fall back to defaults
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'Dinoraptor101';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'vibesapp';
const FEEDBACK_LABEL = 'user-feedback';

module.exports = {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  FEEDBACK_LABEL,
};
