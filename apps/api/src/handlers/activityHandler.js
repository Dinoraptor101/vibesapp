const WatchActivity = require('../models/WatchActivity');
const WatchersList = require('../models/WatchersList');
const User = require('../models/User');
const { createGroupChatActivity, createGroupReplyActivity } = require('../controllers/activity');

/**
 * Note: groupchat activities have a groupchatId
 * Note: groupreply activities have a parentMessageId
 */

const handleActivityCreation = async (
  userId,
  userName,
  groupChatId,
  postId,
  messageId,
  parentMessageId
) => {
  try {
    const groupChatWatchers = await WatchersList.find({
      groupChatId: groupChatId,
      userId: { $ne: userId },
    });
    console.log('Watchers found for group chat:', groupChatWatchers.length);

    const parentMessageWatchers = parentMessageId
      ? await WatchersList.find({
          messageId: parentMessageId,
          userId: { $ne: userId },
        })
      : [];
    const parentMessageWatcherIds = parentMessageWatchers.map((watcher) => watcher.userId);

    if (parentMessageId) {
      await createReplyActivities(
        parentMessageWatchers,
        userId,
        userName,
        postId,
        messageId,
        parentMessageId,
        groupChatId
      );
    }

    await createGroupChatActivities(
      groupChatWatchers,
      parentMessageWatcherIds,
      userId,
      userName,
      postId,
      messageId,
      groupChatId
    );
  } catch (error) {
    console.error('Error in handleActivityCreation:', error.message);
    throw error;
  }
};

const createReplyActivities = async (
  parentMessageWatchers,
  userId,
  userName,
  postId,
  messageId,
  parentMessageId,
  groupChatId
) => {
  console.log('Watchers found for parent message:', parentMessageWatchers.length);

  for (const watcher of parentMessageWatchers) {
    const watcherUser = await User.findOne({ userId: watcher.userId });
    if (!watcherUser) {
      console.error(`Watcher user with ID ${watcher.userId} not found`);
      continue;
    }
    console.log('Watcher user found:', watcherUser);

    const existingGroupReplyActivity = await WatchActivity.findOne({
      watcherUserId: watcher.userId,
      authorUserId: userId,
      type: 'groupreply',
      isRead: false,
    });

    if (!existingGroupReplyActivity) {
      await createGroupReplyActivity({
        watcherUserId: watcher.userId,
        watcherUserName: watcherUser.userName,
        authorUserId: userId,
        authorUserName: userName,
        postId,
        messageId,
        parentMessageId,
        groupChatId,
      });
    }
  }
};

const createGroupChatActivities = async (
  watchersList,
  parentMessageWatcherIds,
  userId,
  userName,
  postId,
  messageId,
  groupChatId
) => {
  for (const watcher of watchersList) {
    if (parentMessageWatcherIds.includes(watcher.userId)) {
      continue; // Skip watchers who already received a groupreply activity
    }

    const watcherUser = await User.findOne({ userId: watcher.userId });
    if (!watcherUser) {
      console.error(`Watcher user with ID ${watcher.userId} not found`);
      continue;
    }
    console.log('Watcher user found:', watcherUser);

    const existingGroupChatActivity = await WatchActivity.findOne({
      watcherUserId: watcher.userId,
      authorUserId: userId,
      type: 'groupchat',
      isRead: false,
    });

    if (!existingGroupChatActivity) {
      await createGroupChatActivity({
        watcherUserId: watcher.userId,
        watcherUserName: watcherUser.userName,
        authorUserId: userId,
        authorUserName: userName,
        postId,
        messageId,
        groupChatId,
      });
    }
  }
};

module.exports = {
  handleActivityCreation,
};
