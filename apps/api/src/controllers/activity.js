const mongoose = require('mongoose');
const ReplyActivity = require('../models/ReplyActivity');
const ReactionActivity = require('../models/ReactionActivity');
const WatchActivity = require('../models/WatchActivity');
const WatchersList = require('../models/WatchersList');
const User = require('../models/User');

// Function to get activities for a user (by originalPosterId)
const getActivities = async (originalPosterId) => {
  try {
    const replyActivities = await ReplyActivity.find({ originalPosterId }).sort({ createdAt: -1 });
    const reactionActivities = await ReactionActivity.find({
      originalPosterId,
    }).sort({ createdAt: -1 });
    const watchActivities = await WatchActivity.find({
      watcherUserId: originalPosterId,
    }).sort({ createdAt: -1 });

    const activities = [...replyActivities, ...reactionActivities, ...watchActivities].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    return activities.map((activity) => ({
      _id: activity._id,
      type: activity.type,
      post: activity.post,
      authorUserName: activity.authorUserName,
      userName: activity.userName,
      isRead: activity.isRead,
      createdAt: activity.createdAt || undefined, // Return undefined if createdAt is not present
    }));
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw new Error('Server error while fetching activities');
  }
};

// Function to create a new reply activity
const createReplyActivity = async ({ userId, userName, post, replyPost, originalPosterId }) => {
  try {
    const replyActivity = new ReplyActivity({
      userId,
      userName,
      post,
      replyPost,
      originalPosterId,
      isRead: false,
      createdAt: new Date(),
    });
    await replyActivity.save();
  } catch (error) {
    console.error('Error creating reply activity:', error);
    throw error;
  }
};

// Function to create a new reaction activity
const createReactionActivity = async ({ userId, type, post, originalPosterId }) => {
  try {
    const activity = new ReactionActivity({
      userId,
      type,
      post,
      originalPosterId,
      createdAt: new Date(),
    });
    const newActivity = await activity.save();
    return {
      id: newActivity._id,
      message: 'Reaction activity created successfully',
    };
  } catch (err) {
    console.error('Error creating reaction activity:', err);
    throw new Error('Server error while creating reaction activity');
  }
};

// Function to create a new group chat activity
const createGroupChatActivity = async ({
  watcherUserId,
  watcherUserName,
  authorUserId,
  authorUserName,
  postId,
  messageId,
  groupChatId,
}) => {
  try {
    const watchActivity = new WatchActivity({
      watcherUserId: watcherUserId,
      watcherUserName: watcherUserName,
      authorUserId: authorUserId,
      authorUserName: authorUserName,
      messageId: messageId,
      post: postId,
      groupChatId: groupChatId,
      type: 'groupchat',
      createdAt: new Date(),
      isRead: false,
    });
    await watchActivity.save();
  } catch (error) {
    console.error('Error creating group chat activity:', error);
    throw error;
  }
};

// Function to create a new group reply activity
const createGroupReplyActivity = async ({
  watcherUserId,
  watcherUserName,
  authorUserId,
  authorUserName,
  postId,
  messageId,
  parentMessageId,
  groupChatId,
}) => {
  try {
    const watchActivity = new WatchActivity({
      watcherUserId: watcherUserId,
      watcherUserName: watcherUserName,
      authorUserId: authorUserId,
      authorUserName: authorUserName,
      messageId: messageId,
      parentMessageId: parentMessageId,
      post: postId,
      groupChatId: groupChatId,
      type: 'groupreply',
      createdAt: new Date(),
      isRead: false,
    });
    await watchActivity.save();
  } catch (error) {
    console.error('Error creating group reply activity:', error);
    throw error;
  }
};

// Get unread status for a user
const getUnreadStatus = async (originalPosterId) => {
  try {
    const unreadReplyActivities = await ReplyActivity.exists({
      originalPosterId,
      isRead: false,
    });
    const unreadReactionActivities = await ReactionActivity.exists({
      originalPosterId,
      isRead: false,
    });
    const unreadWatchActivities = await WatchActivity.exists({
      watcherUserId: originalPosterId,
      isRead: false,
    });
    const unreadGroupChatWatchActivities = await WatchActivity.exists({
      watcherUserId: originalPosterId,
      groupChatId: { $exists: true },
      isRead: false,
    });
    return (
      unreadReplyActivities ||
      unreadReactionActivities ||
      unreadWatchActivities ||
      unreadGroupChatWatchActivities
    );
  } catch (err) {
    console.error('Error fetching unread status:', err);
    throw new Error('Server error while fetching unread status');
  }
};

// Watch a message
const watchMessageToggle = async (req, res) => {
  const { userId } = req.body;
  const { id: messageId } = req.params;

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingWatch = await WatchersList.findOne({ userId, messageId });

    if (existingWatch) {
      await WatchersList.deleteOne({ userId, messageId });
      return res.status(200).json({ message: 'Unwatched successfully' });
    }

    const newWatch = new WatchersList({
      userId,
      userName: user.userName,
      messageId,
      type: 'groupreply',
    });

    await newWatch.save();
    res.status(201).json({ message: 'Watched successfully' });
  } catch (error) {
    console.error('Error watching message:', error.message);
    res.status(500).json({ error: 'Server error while watching message' });
  }
};

// Watch a group chat
const watchGroupChatToggle = async (req, res) => {
  const { userId } = req.body;
  const { id: groupChatId } = req.params;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingWatch = await WatchersList.findOne({
      userId,
      groupChatId,
      type: 'groupchat',
    });

    if (existingWatch) {
      await WatchersList.deleteOne({ userId, groupChatId, type: 'groupchat' });
      return res.status(200).json({ message: 'Unwatched successfully' });
    } else {
      const newWatch = new WatchersList({
        userId,
        userName: user.userName,
        groupChatId,
        type: 'groupchat',
      });

      await newWatch.save();
      return res.status(201).json({ message: 'Watched successfully' });
    }
  } catch (error) {
    console.error('Error watching group chat:', error.message);
    res.status(500).json({ error: 'Server error while watching group chat' });
  }
};

// Get watch status for a group chat
const getGroupChatWatchStatus = async (req, res) => {
  const userId = req.params.userId;
  const groupChatId = req.params.groupChatId;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existingWatch = await WatchersList.findOne({
      userId,
      groupChatId,
      type: 'groupchat',
    });

    const isWatched = !!existingWatch;
    res.status(200).json({ isWatched });
  } catch (error) {
    console.error('Error fetching group chat watch status:', error.message);
    res.status(500).json({ error: 'Server error while fetching group chat watch status' });
  }
};

module.exports = {
  getActivities,
  createReplyActivity,
  createReactionActivity,
  createGroupChatActivity,
  createGroupReplyActivity,
  getUnreadStatus,
  watchMessageToggle,
  watchGroupChatToggle,
  getGroupChatWatchStatus,
};
