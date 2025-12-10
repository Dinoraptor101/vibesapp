const { Octokit } = require('octokit');

// Initialize Octokit with GitHub PAT from environment
const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

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
