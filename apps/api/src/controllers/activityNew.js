const Activity = require('../models/Activity');
const User = require('../models/User');
const sseManager = require('../handlers/sseManager');

/**
 * Get activities for a user
 * Returns activities sorted by newest first
 * Query params:
 * - showRead: 'true' to include read activities (default: false, unread only)
 * - maxAge: hours to look back (default: 48 for read activities)
 */
const getActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const { showRead } = req.query;

    // Build query filter
    const filter = { recipientId: userId };

    // Default: only unread activities
    if (showRead !== 'true') {
      filter.isRead = false;
    } else {
      // If showing read, limit to recent activities (last 48 hours)
      const maxAge = 48; // hours
      const cutoffDate = new Date(Date.now() - maxAge * 60 * 60 * 1000);
      filter.createdAt = { $gte: cutoffDate };
    }

    const activities = await Activity.find(filter).sort({ createdAt: -1 }).limit(100); // Limit to prevent huge responses

    res.status(200).json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};

/**
 * Mark activity as read
 */
const markAsRead = async (req, res) => {
  try {
    const { activityId } = req.params;

    const activity = await Activity.findByIdAndUpdate(
      activityId,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.status(200).json(activity);
  } catch (error) {
    console.error('Error marking activity as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Mark all activities as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Activity.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.status(200).json({ message: 'All activities marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get unread activity counts
 */
const getUnreadCounts = async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Activity.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread counts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Create activity helper (called by other controllers)
 */
const createActivity = async ({ recipientId, type, actor, target }) => {
  try {
    console.info('📢 createActivity called:', { recipientId, type, actorId: actor.userId });

    // Check if recipient has this notification type enabled
    const recipient = await User.findOne({ userId: recipientId });
    if (!recipient) {
      console.error('❌ Recipient not found:', recipientId);
      return null;
    }

    console.info('✅ Recipient found:', {
      userId: recipient.userId,
      username: recipient.userName,
      notificationPreferences: recipient.notificationPreferences,
    });

    // Map activity types to preference keys
    const preferenceMap = {
      new_follower: 'new_follower',
      following_post: 'following_post',
      nearby_post: 'nearby_post',
      comment: 'comment',
      comment_reply: 'comment_reply',
      post_hidden: 'post_hidden',
      reaction: 'reactions',
    };

    const preferenceKey = preferenceMap[type];
    if (preferenceKey && recipient.notificationPreferences[preferenceKey] === false) {
      console.log(`🔕 User ${recipientId} has disabled ${type} notifications`);
      return null;
    }

    // Create activity
    const activity = new Activity({
      recipientId,
      type,
      actor,
      target,
      isRead: false,
      createdAt: new Date(),
    });

    await activity.save();
    console.log('💾 Activity saved successfully:', {
      activityId: activity._id,
      type,
      recipientId,
      actorId: actor.userId,
    });

    // Broadcast activity update via SSE
    sseManager.broadcast(recipientId, 'activity-update', {
      type,
      activity: activity.toObject(),
    });

    // Get and broadcast updated unread count
    const unreadCount = await Activity.countDocuments({
      recipientId,
      isRead: false,
    });
    sseManager.broadcast(recipientId, 'unread-count-update', {
      counts: { unreadCount },
    });

    return activity;
  } catch (error) {
    console.error('❌ Error creating activity:', error);
    throw error;
  }
};

module.exports = {
  getActivities,
  markAsRead,
  markAllAsRead,
  getUnreadCounts,
  createActivity,
};
