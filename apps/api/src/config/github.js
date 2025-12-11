const { Octokit } = require('octokit');

// Validate GITHUB_PAT is present (only required in production/development, not in tests)
if (!process.env.GITHUB_PAT && process.env.NODE_ENV !== 'test') {
  console.warn(
    'GITHUB_PAT environment variable is not set. Feedback system will not work. Please set it in your .env file with a GitHub Personal Access Token that has "repo" scope.'
  );
}

// Initialize Octokit with GitHub PAT from environment (if available)
const octokit = process.env.GITHUB_PAT
  ? new Octokit({
      auth: process.env.GITHUB_PAT,
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
