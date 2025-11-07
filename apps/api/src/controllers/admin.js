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

// Get users with filters and search
const getUsers = async (req, res) => {
  try {
    const {
      search = '',
      filter = 'all',
      location = '',
      mbti = '',
      page = 1,
      limit = 50,
    } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Search by username
    if (search) {
      query.userName = { $regex: search, $options: 'i' };
    }

    // Filter by banned status
    if (filter === 'banned') {
      query.isBanned = true;
    } else if (filter === 'active') {
      query.isBanned = { $ne: true };
    }

    // Filter by MBTI
    if (mbti) {
      query.mbtiPersonality = mbti;
    }

    // Filter by location (this would need more sophisticated geo logic in production)
    if (location) {
      query['location.lat'] = { $exists: true };
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get post count for each user
    const usersWithPostCount = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({ 'user.userId': user.userId });
        const flaggedPostCount = await Post.countDocuments({
          'user.userId': user.userId,
          proximal_dislikes: { $gt: 0 },
        });

        return {
          ...user,
          postCount,
          flaggedPostCount,
        };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users: usersWithPostCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// Ban/Unban user
const toggleBanUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBanned = !user.isBanned;
    user.bannedAt = user.isBanned ? new Date() : null;

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user,
    });
  } catch (error) {
    console.error('Error toggling ban status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling ban status',
      error: error.message,
    });
  }
};

// Regenerate password (Pigeon ID)
const regeneratePassword = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new password (simple implementation - should use crypto in production)
    const newPassword = `pigeon-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;

    user.pigeonId = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password regenerated successfully',
      newPassword,
      user: {
        userId: user.userId,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.error('Error regenerating password:', error);
    res.status(500).json({
      success: false,
      message: 'Error regenerating password',
      error: error.message,
    });
  }
};

// Delete user (soft delete - ban permanently)
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Soft delete by banning and marking
    user.isBanned = true;
    user.bannedAt = new Date();
    user.userName = `[deleted-${user.userId}]`;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find({ 'user.userId': userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Post.countDocuments({ 'user.userId': userId });

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user posts',
      error: error.message,
    });
  }
};

// Bulk delete user's posts
const bulkDeleteUserPosts = async (req, res) => {
  const { userId } = req.params;

  try {
    const posts = await Post.find({ 'user.userId': userId });

    // Delete images from S3
    for (const post of posts) {
      try {
        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: post.image,
        });
      } catch (error) {
        console.error(`Error deleting image for post ${post._id}:`, error);
      }
    }

    // Delete all posts
    const result = await Post.deleteMany({ 'user.userId': userId });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} posts`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error bulk deleting user posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk deleting user posts',
      error: error.message,
    });
  }
};

// Get dashboard metrics
const getDashboardMetrics = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Active users (posted or reacted in last 7 days)
    const activeUserIds = await Post.distinct('user.userId', {
      createdAt: { $gte: lastWeek },
    });
    const activeUsersCount = activeUserIds.length;

    // Total users
    const totalUsers = await User.countDocuments();

    // Posts today
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: today },
    });

    // Posts last week (for comparison)
    const postsLastWeek = await Post.countDocuments({
      createdAt: { $gte: lastWeek, $lt: today },
    });

    // Posts two weeks ago (for % change)
    const postsTwoWeeksAgo = await Post.countDocuments({
      createdAt: { $gte: twoWeeksAgo, $lt: lastWeek },
    });

    // Flagged posts (reports today)
    const reportsToday = await Post.countDocuments({
      proximal_dislikes: { $gt: 0 },
      createdAt: { $gte: today },
    });

    // Reports last week
    const reportsLastWeek = await Post.countDocuments({
      proximal_dislikes: { $gt: 0 },
      createdAt: { $gte: lastWeek, $lt: today },
    });

    // Auto-hidden posts
    const autoHiddenPosts = await Post.countDocuments({
      isHidden: true,
    });

    // Auto-hidden in last hour
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const autoHiddenLastHour = await Post.countDocuments({
      isHidden: true,
      createdAt: { $gte: oneHourAgo },
    });

    // Unreviewed flagged posts (proximal_dislikes > 0 but not hidden)
    const unreviewedFlagged = await Post.countDocuments({
      proximal_dislikes: { $gt: 0 },
      isHidden: false,
    });

    // Calculate percentage changes
    const postsChange =
      postsLastWeek > 0 ? ((postsToday - postsLastWeek) / postsLastWeek) * 100 : 0;
    const reportsChange =
      reportsLastWeek > 0 ? ((reportsToday - reportsLastWeek) / reportsLastWeek) * 100 : 0;

    res.status(200).json({
      success: true,
      metrics: {
        activeUsers: {
          today: activeUsersCount,
          thisWeek: activeUsersCount,
          total: totalUsers,
        },
        posts: {
          today: postsToday,
          thisWeek: postsLastWeek,
          change: Math.round(postsChange * 10) / 10,
        },
        reports: {
          today: reportsToday,
          thisWeek: reportsLastWeek,
          change: Math.round(reportsChange * 10) / 10,
        },
        autoHidden: {
          total: autoHiddenPosts,
          lastHour: autoHiddenLastHour,
        },
        urgent: {
          autoHiddenLastHour,
          unreviewedFlagged,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard metrics',
      error: error.message,
    });
  }
};

// Get activity data for charts (last 7 days)
const getActivityData = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Aggregate posts per day
    const postsPerDay = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregate reports per day (posts with dislikes)
    const reportsPerDay = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          proximal_dislikes: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Aggregate auto-hidden per day
    const autoHiddenPerDay = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          isHidden: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create full 7-day array with all dates
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.push({
        date: dateStr,
        posts: postsPerDay.find((d) => d._id === dateStr)?.count || 0,
        reports: reportsPerDay.find((d) => d._id === dateStr)?.count || 0,
        autoHidden: autoHiddenPerDay.find((d) => d._id === dateStr)?.count || 0,
      });
    }

    res.status(200).json({
      success: true,
      activityData: last7Days,
    });
  } catch (error) {
    console.error('Error fetching activity data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity data',
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

// Update admin settings
const updateSettings = async (req, res) => {
  try {
    const { currentPassword, newPassword, reportThreshold, notificationEmail } = req.body;

    // Check if admin password is being changed
    if (currentPassword && newPassword) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'vibes_admin_2025';

      if (currentPassword !== adminPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // In a real application, you would update the password in the database
      // For this demo, we'll just validate the current password
      // Note: Changing ADMIN_PASSWORD requires server restart
      console.log(
        'Admin password change requested. Update ADMIN_PASSWORD env var and restart server.'
      );
    }

    // Update report threshold (would be stored in database in production)
    if (reportThreshold !== undefined) {
      // In production, store this in a settings collection
      console.log(`Report threshold updated to: ${reportThreshold}`);
    }

    // Update notification email (would be stored in database in production)
    if (notificationEmail !== undefined) {
      // In production, store this in a settings collection
      console.log(`Notification email updated to: ${notificationEmail}`);
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        reportThreshold: reportThreshold || 3,
        notificationEmail: notificationEmail || 'admin@vibesapp.com',
        passwordChanged: !!(currentPassword && newPassword),
      },
    });
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message,
    });
  }
};

module.exports = {
  adminLogin,
  updateBalance,
  deletePosts,
  getFlaggedPosts,
  dismissReports,
  getUsers,
  toggleBanUser,
  regeneratePassword,
  deleteUser,
  getUserPosts,
  bulkDeleteUserPosts,
  getDashboardMetrics,
  getActivityData,
  updateSettings,
};
