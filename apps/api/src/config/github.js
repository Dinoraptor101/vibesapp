const { Octokit } = require('octokit');

// Initialize Octokit with GitHub PAT from environment
const octokit = new Octokit({
  auth: process.env.GITHUB_PAT,
});

// Repository configuration
const REPO_OWNER = 'Dinoraptor101';
const REPO_NAME = 'vibesapp';
const FEEDBACK_LABEL = 'user-feedback';

module.exports = {
  octokit,
  REPO_OWNER,
  REPO_NAME,
  FEEDBACK_LABEL,
};
