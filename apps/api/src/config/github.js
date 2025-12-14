const { Octokit } = require('octokit');

// Support multiple env var names: GH_PAT (GitHub Actions safe), GITHUB_PAT, GITHUB_TOKEN
const githubToken = process.env.GH_PAT || process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

// Validate token is present (only required in production/development, not in tests)
if (!githubToken && process.env.NODE_ENV !== 'test') {
  console.warn(
    'GitHub PAT not set. Feedback system will not work. Set GH_PAT (or GITHUB_PAT/GITHUB_TOKEN) in your .env file with a GitHub Personal Access Token that has "repo" scope.'
  );
}

// Initialize Octokit with GitHub PAT from environment (if available)
const octokit = githubToken
  ? new Octokit({
      auth: githubToken,
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
