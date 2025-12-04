const Post = require('../models/Post');
const User = require('../models/User');
const Settings = require('../models/Settings');
const { S3 } = require('@aws-sdk/client-s3');
const crypto = require('node:crypto');
const { verifyRecaptcha } = require('../utils/recaptcha');
const { registerAdminToken } = require('../middleware/adminAuth');

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
  const { password, recaptchaToken } = req.body;

  try {
    // Verify reCAPTCHA first (if enabled)
    const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'admin_login');
    if (!recaptchaResult.success) {
      console.log('[Admin Login] FAILED - reCAPTCHA verification failed:', recaptchaResult.error);
      return res.status(403).json({
        success: false,
        message: 'Unable to verify you are human. Please refresh the page and try again.',
        code: 'RECAPTCHA_FAILED',
      });
    }

    // Check if password matches admin password from environment
    const adminPassword = process.env.ADMIN_PASSWORD || 'vibes_admin_2025';

    if (password !== adminPassword) {
      console.log('[Admin Login] FAILED - Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }

    console.log('[Admin Login] SUCCESS');

    // Generate a simple session token (in production, use JWT)
    const token = crypto.randomBytes(32).toString('hex');

    // Register token in admin auth middleware
    registerAdminToken(token);

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
          reporters: reporters.map((u) => {
            const userObj = u.toJSON(); // Use transformed object
            return { userId: userObj._id || u.userId, username: userObj.username };
          }),
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

// Dismiss reports for a post (clear reports and unhide)
const dismissReports = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Clear community reports (Phase 3.4)
    post.reports = [];
    post.hiddenForUsers = [];

    // Legacy: Remove dislike reactions (old system)
    post.reactions = post.reactions.filter((r) => r.type !== 'dislike');
    post.proximal_dislikes = 0;

    // Unhide the post
    post.isHidden = false;
    post.hiddenAt = null;
    post.hiddenBy = null;

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

    // Get post count for each user and calculate age
    const usersWithPostCount = await Promise.all(
      users.map(async (user) => {
        const postCount = await Post.countDocuments({ 'user.userId': user.userId });
        const flaggedPostCount = await Post.countDocuments({
          'user.userId': user.userId,
          proximal_dislikes: { $gt: 0 },
        });

        // Calculate age from birthYear and birthMonth
        let age = null;
        if (user.birthYear && user.birthMonth) {
          const now = new Date();
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth() + 1; // 0-indexed

          age = currentYear - user.birthYear;
          // If birthday hasn't occurred this year yet, subtract 1
          if (currentMonth < user.birthMonth) {
            age--;
          }
        }

        return {
          ...user,
          postCount,
          flaggedPostCount,
          age,
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

// Pigeon ID generation utilities (same as user.js)
const adjectives = [
  'brave',
  'calm',
  'clever',
  'cosmic',
  'daring',
  'dreamy',
  'eager',
  'fancy',
  'gentle',
  'happy',
  'jolly',
  'kind',
  'lively',
  'lucky',
  'merry',
  'noble',
  'proud',
  'quick',
  'royal',
  'shiny',
  'smart',
  'swift',
  'vivid',
  'wise',
  'witty',
  'zesty',
  'amber',
  'azure',
  'coral',
  'crimson',
  'emerald',
  'golden',
  'jade',
  'ruby',
  'silver',
  'stellar',
  'lunar',
  'solar',
  'mystic',
];

const nouns = [
  'tiger',
  'eagle',
  'dolphin',
  'phoenix',
  'dragon',
  'falcon',
  'panther',
  'wolf',
  'lion',
  'hawk',
  'bear',
  'fox',
  'owl',
  'raven',
  'swan',
  'deer',
  'comet',
  'star',
  'moon',
  'sun',
  'cloud',
  'storm',
  'breeze',
  'wave',
  'mountain',
  'river',
  'ocean',
  'forest',
  'meadow',
  'canyon',
  'glacier',
  'valley',
  'sage',
  'knight',
  'mage',
  'warrior',
  'ranger',
  'scout',
  'voyager',
  'seeker',
];

function generatePigeonId() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const numbers = Math.floor(1000 + Math.random() * 9000);
  return `${adjective}-${noun}-${numbers}`;
}

// Regenerate password (Pigeon ID)
const regeneratePassword = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate new password with memorable format
    const newPassword = generatePigeonId();

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

    // Generate random 4-digit suffix for anonymization
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const anonymizedUsername = `deleted-${randomSuffix}`;

    // Anonymize all user's posts
    const updateResult = await Post.updateMany(
      { 'user.userId': userId },
      {
        $set: {
          'user.userName': anonymizedUsername,
          'user.userId': 'deleted-user',
          'user.userAvatar': '',
        },
      }
    );

    console.log(`[Admin] Anonymized ${updateResult.modifiedCount} posts for user ${userId}`);

    // Soft delete user by marking as banned and deleted
    user.isBanned = true;
    user.bannedAt = new Date();
    user.isDeleted = true;
    user.deletedAt = new Date();
    user.userName = anonymizedUsername;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      anonymizedPosts: updateResult.modifiedCount,
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

    // Also get user data with age calculated
    const user = await User.findOne({ userId }).lean();
    let userWithAge = null;

    if (user) {
      // Calculate age from birthYear and birthMonth
      let age = null;
      if (user.birthYear && user.birthMonth) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-indexed

        age = currentYear - user.birthYear;
        // If birthday hasn't occurred this year yet, subtract 1
        if (currentMonth < user.birthMonth) {
          age--;
        }
      }

      userWithAge = {
        ...user,
        age,
      };
    }

    res.status(200).json({
      success: true,
      posts,
      user: userWithAge,
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

    // Phase 3.4: Reports today (posts with reports created today)
    const reportsToday = await Post.countDocuments({
      'reports.0': { $exists: true },
      createdAt: { $gte: today },
    });

    // Phase 3.4: Reports last week
    const reportsLastWeek = await Post.countDocuments({
      'reports.0': { $exists: true },
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

    // Phase 3.4: Unreviewed flagged posts (has reports but not hidden yet)
    const unreviewedFlagged = await Post.countDocuments({
      'reports.0': { $exists: true }, // Has at least 1 report
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

// Get admin settings
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      data: {
        reportThreshold: settings.reportThreshold,
        notificationEmail: settings.notificationEmail,
        updatedAt: settings.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message,
    });
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

    // Update settings in database
    const updates = {};
    if (reportThreshold !== undefined) {
      updates.reportThreshold = reportThreshold;
    }
    if (notificationEmail !== undefined) {
      updates.notificationEmail = notificationEmail;
    }

    const settings = await Settings.updateSettings(updates);
    console.log('Admin settings updated:', updates);

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: {
        reportThreshold: settings.reportThreshold,
        notificationEmail: settings.notificationEmail,
        passwordChanged: !!(currentPassword && newPassword),
        updatedAt: settings.updatedAt,
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

// Phase 3.4: Get reported posts (community reports)
const getReportedPosts = async (req, res) => {
  try {
    const { filter = 'all', sort = 'most-reports', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build match query based on filter
    const matchQuery = { 'reports.0': { $exists: true } }; // Has at least 1 report

    if (filter === 'auto-hidden') {
      matchQuery.isHidden = true;
      matchQuery.hiddenBy = 'auto';
    } else if (filter === 'admin-hidden') {
      matchQuery.isHidden = true;
      matchQuery.hiddenBy = 'admin';
    } else if (filter === 'under-review') {
      matchQuery.isHidden = false; // Not hidden yet but has reports
    }
    // 'all' filter: just needs reports (no additional constraints)

    console.log('[getReportedPosts] Filter:', filter, 'Match Query:', JSON.stringify(matchQuery));

    // Build sort query
    let sortStage = {};
    if (sort === 'most-reports') {
      sortStage = { reportCount: -1, createdAt: -1 }; // Secondary sort by date
    } else if (sort === 'recent') {
      sortStage = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortStage = { createdAt: 1 };
    }

    // Use aggregation to add reportCount field and sort properly
    const posts = await Post.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          reportCount: { $size: '$reports' },
        },
      },
      { $sort: sortStage },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);

    console.log(
      `[getReportedPosts] Found ${posts.length} posts. Sample data:`,
      posts.slice(0, 2).map((p) => ({
        id: p._id,
        reportCount: p.reportCount,
        isHidden: p.isHidden,
        hiddenBy: p.hiddenBy,
      }))
    );

    // Get reporters for each post
    const postsWithReporters = await Promise.all(
      posts.map(async (post) => {
        const reporterIds = post.reports.map((r) => r.userId);
        const reporters = await User.find({ userId: { $in: reporterIds } }).select(
          'userId userName'
        );

        // Group reports by reason
        const reportsByReason = post.reports.reduce((acc, report) => {
          acc[report.reason] = (acc[report.reason] || 0) + 1;
          return acc;
        }, {});

        return {
          ...post,
          reporters: reporters.map((u) => ({ userId: u.userId, userName: u.userName })),
          reportsByReason,
        };
      })
    );

    const total = await Post.countDocuments(matchQuery);

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
    console.error('Error fetching reported posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reported posts',
      error: error.message,
    });
  }
};

// Phase 3.4: Restore a post (unhide and remove strike from author)
const restorePost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Restore post
    post.isHidden = false;
    post.hiddenAt = null;
    post.hiddenBy = null;
    await post.save();

    // Remove most recent strike from author (if any)
    const postAuthor = await User.findOne({ userId: post.user.userId });
    if (postAuthor && postAuthor.strikes.length > 0) {
      // Remove the most recent strike
      postAuthor.strikes.sort((a, b) => b.timestamp - a.timestamp);
      postAuthor.strikes.shift(); // Remove first (most recent)

      // If user was banned (Strike 4), unban them
      if (postAuthor.isBanned) {
        postAuthor.isBanned = false;
        postAuthor.bannedAt = null;
      }

      await postAuthor.save();
    }

    res.status(200).json({
      success: true,
      message: 'Post restored successfully',
      post,
    });
  } catch (error) {
    console.error('Error restoring post:', error);
    res.status(500).json({
      success: false,
      message: 'Error restoring post',
      error: error.message,
    });
  }
};

// Phase 3.4: Ban user (Strike 4) and hide all their posts
const banUser = async (req, res) => {
  const { userId } = req.params;
  const { reason = 'Banned by admin' } = req.body;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add Strike 4 (permanent ban strike)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 100); // Effectively permanent

    user.strikes.push({
      reason,
      timestamp: new Date(),
      expiresAt,
    });

    user.isBanned = true;
    user.bannedAt = new Date();
    await user.save();

    // Hide all user's posts
    const updateResult = await Post.updateMany(
      { 'user.userId': userId },
      {
        $set: {
          isHidden: true,
          hiddenAt: new Date(),
          hiddenBy: 'admin',
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `User banned successfully. ${updateResult.modifiedCount} posts hidden.`,
      user: {
        userId: user.userId,
        userName: user.userName,
        isBanned: user.isBanned,
        strikeCount: user.strikes.length,
      },
      postsHidden: updateResult.modifiedCount,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({
      success: false,
      message: 'Error banning user',
      error: error.message,
    });
  }
};

/**
 * Clean up test data created during E2E tests
 * Deletes all users, posts, and reports with test identifiers
 * Matches pigeonIds starting with: 'test-', 'pigeon-author-', 'pigeon-reporter-', 'test-author-', 'test-reporter-'
 */
const cleanupTestData = async (_req, res) => {
  try {
    console.log('[Admin] Starting test data cleanup...');

    // Find all test users (pigeonId matches test patterns)
    const testUsers = await User.find({
      pigeonId: {
        $regex: /^(test-|pigeon-author-|pigeon-reporter-|test-author-|test-reporter-)/i,
      },
    }).select('userId pigeonId userName');

    const testUserIds = testUsers.map((user) => user.userId);
    console.log(`[Admin] Found ${testUsers.length} test users to delete`);

    // Find all posts by test users and delete their S3 images
    const testPosts = await Post.find({
      'user.userId': { $in: testUserIds },
    }).select('_id image');

    let deletedImagesCount = 0;
    for (const post of testPosts) {
      if (post.image) {
        try {
          await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: post.image,
          });
          deletedImagesCount++;
        } catch (error) {
          console.error(`[Admin] Error deleting S3 image for post ${post._id}:`, error.message);
        }
      }
    }
    console.log(`[Admin] Deleted ${deletedImagesCount} S3 images`);

    // Delete all posts created by test users
    const deletedPosts = await Post.deleteMany({
      'user.userId': { $in: testUserIds },
    });
    console.log(`[Admin] Deleted ${deletedPosts.deletedCount} posts from test users`);

    // Delete all reports on posts (if any posts had reports)
    let deletedReports = 0;
    const postsWithReports = await Post.find({
      reports: { $exists: true, $ne: [] },
    });

    for (const post of postsWithReports) {
      if (post.reports && post.reports.length > 0) {
        // Remove reports from test users
        const originalReportCount = post.reports.length;
        post.reports = post.reports.filter((report) => !testUserIds.includes(report.userId));
        const removedCount = originalReportCount - post.reports.length;
        deletedReports += removedCount;

        if (removedCount > 0) {
          await post.save();
        }
      }
    }
    console.log(`[Admin] Deleted ${deletedReports} reports from test users`);

    // Delete all test users
    const deletedUsers = await User.deleteMany({
      pigeonId: {
        $regex: /^(test-|pigeon-author-|pigeon-reporter-|test-author-|test-reporter-)/i,
      },
    });
    console.log(`[Admin] Deleted ${deletedUsers.deletedCount} test users`);

    const result = {
      success: true,
      deletedUsers: deletedUsers.deletedCount,
      deletedPosts: deletedPosts.deletedCount,
      deletedImages: deletedImagesCount,
      deletedReports,
      message: `Cleanup complete: ${deletedUsers.deletedCount} users, ${deletedPosts.deletedCount} posts, ${deletedImagesCount} images, ${deletedReports} reports`,
    };

    console.log('[Admin] Test data cleanup complete:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('[Admin] Error during test data cleanup:', error);
    res.status(500).json({
      success: false,
      message: 'Error cleaning up test data',
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
  getSettings,
  updateSettings,
  getReportedPosts, // Phase 3.4
  restorePost, // Phase 3.4
  banUser, // Phase 3.4
  cleanupTestData, // E2E test cleanup
};
