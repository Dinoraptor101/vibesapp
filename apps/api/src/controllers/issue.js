const axios = require('axios');

// Support multiple env var names: GH_PAT (GitHub Actions safe), GITHUB_PAT, GITHUB_TOKEN
const githubToken = process.env.GH_PAT || process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

exports.createIssue = async (req, res) => {
  const { title, body } = req.body;

  console.log('Received title:', title);
  console.log('Received body:', body);

  if (!title || !body) {
    console.log('Title and body are required but not provided.');
    res.status(400).send('Title and body are required');
    return;
  }

  try {
    console.log('Attempting to create an issue on GitHub...');
    await axios.post(
      `https://api.github.com/repos/Dinoraptor101/vibesapp/issues`,
      {
        title,
        body,
      },
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );
    console.log('Issue created successfully on GitHub.');
    res.status(200).send('Issue created successfully');
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).send('Error creating issue');
  }
};
