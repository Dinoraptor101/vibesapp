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

// Get flagged posts (posts with dislikes or auto-hidden)
const getFlaggedPosts = async (req, res) => {
  try {
    const { filter = 'all', sort = 'most-reports', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query based on filter
    const query = {};
    if (filter === 'auto-hidden') {
      query.isHidden = true;
    } else if (filter === 'under-review') {
      // Posts with dislikes but not auto-hidden yet
      query.isHidden = false;
      query.proximal_dislikes = { $gt: 0 };
    } else {
      // All flagged posts (any posts with dislikes)
      query.proximal_dislikes = { $gt: 0 };
    }

    // Build sort
    const sortQuery = {};
    if (sort === 'most-reports') {
      sortQuery.proximal_dislikes = -1;
    } else if (sort === 'recent') {
      sortQuery.createdAt = -1;
    } else if (sort === 'oldest') {
      sortQuery.createdAt = 1;
    }

    const posts = await Post.find(query).sort(sortQuery).skip(skip).limit(parseInt(limit)).lean();

    // Get reporters for each post (users who disliked)
    const postsWithReporters = await Promise.all(
      posts.map(async (post) => {
        const dislikeReactions = post.reactions.filter((r) => r.type === 'dislike');
        const reporterIds = dislikeReactions.map((r) => r.userId);
        const reporters = await User.find({ userId: { $in: reporterIds } }).select(
          'userId userName'
        );

        return {
          ...post,
          reporters: reporters.map((u) => ({ userId: u.userId, userName: u.userName })),
          dislikeCount: post.proximal_dislikes,
        };
      })
    );

    const total = await Post.countDocuments(query);

    res.status(200).json({
      success: true,
      posts: postsWithReporters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching flagged posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching flagged posts',
      error: error.message,
    });
  }
};

// Dismiss reports for a post (clear dislike reactions)
const dismissReports = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Remove dislike reactions
    post.reactions = post.reactions.filter((r) => r.type !== 'dislike');
    post.proximal_dislikes = 0;
    post.isHidden = false;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Reports dismissed successfully',
      post,
    });
  } catch (error) {
    console.error('Error dismissing reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error dismissing reports',
      error: error.message,
    });
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
        const post = await Post.findById(postHex);
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
          await s3.deleteObject(deleteParams);
        } catch (error) {
          console.error(`Error deleting image for post with ID ${postHex}: ${error}`);
        }

        await Post.findByIdAndDelete(postHex);

        console.log(`Post with ID ${postHex} deleted successfully.`);
      } catch (error) {
        console.error(`Failed to delete post with ID ${postHex}: ${error}`);
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
    res.status(200).json({ success: true, message: 'All posts deleted successfully' });
  } catch (error) {
    console.error('Error deleting posts:', error);
    res.status(500).json({ success: false, message: 'Error deleting posts', error });
  }
};

module.exports = {
  adminLogin,
  updateBalance,
  deletePosts,
  getFlaggedPosts,
  dismissReports,
};
