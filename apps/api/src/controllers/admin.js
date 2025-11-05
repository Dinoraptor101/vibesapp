const Post = require('../models/Post');
const User = require('../models/User');
const { S3 } = require('@aws-sdk/client-s3');
const crypto = require('node:crypto');

// Initialize S3 with correct AWS configuration
const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

// Admin login
const adminLogin = async (req, res) => {
  const { password } = req.body;

  try {
    // Check if password matches admin password from environment
    const adminPassword = process.env.ADMIN_PASSWORD || 'vibes_admin_2025';

    if (password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    // Generate a simple session token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    res.status(200).json({
      success: true,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Update Vibes balance
const updateBalance = async (req, res) => {
  const { userId, newAmount } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.vibes = parseInt(newAmount, 10);
    await user.save();
    res.status(200).json({ message: `User ${userId}'s vibes updated to ${user.vibes}` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user vibes', error });
  }
};

// Delete posts in bulk
const deletePosts = async (req, res) => {
  const { postHexes } = req.body;
  const failedDeletes = [];

  try {
    console.log('Deleting posts...');

    for (const postHex of postHexes) {
      try {
        const post = Post.findById(postHex);
        if (!post) {
          failedDeletes.push({ postHex, reason: 'Post not found' });
          continue;
        }

        // Try to delete image from S3 if it exists

        try {
          const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: post.image,
          };
          await s3.deleteObject(deleteParams).promise();
        } catch (error) {
          console.error(`Error deleting image for post with ID ${postHex}: ${error}`);
        }

        await Post.findOneAndDelete(post);

        console.log(`Post with ID ${postHex} deleted successfully.`);
      } catch (error) {
        console.error(`Failed to delete post with ID ${post._id}: ${error}`);
        failedDeletes.push({
          postHex,
          reason: `Failed to delete post: ${error.message}`,
        });
      }
    }

    if (failedDeletes.length > 0) {
      console.log('Some posts failed to delete:', failedDeletes);
      return res.status(200).json({ message: 'Some posts failed to delete', failedDeletes });
    }

    console.log('All posts deleted successfully.');
    res.status(200).json({ message: 'All posts deleted successfully' });
  } catch (error) {
    console.error('Error deleting posts:', error);
    res.status(500).json({ message: 'Error deleting posts', error });
  }
};

module.exports = {
  adminLogin,
  updateBalance,
  deletePosts,
};
