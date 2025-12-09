// controllers/message.js

const Message = require('../models/Message');
const GroupChat = require('../models/Groupchat');
const WatchActivity = require('../models/WatchActivity');
const WatchersList = require('../models/WatchersList');
const User = require('../models/User');
const { handleActivityCreation } = require('../handlers/activityHandler');

const userLastMessageTime = {}; // In-memory storage for last message timestamps

// Send a new message
exports.sendMessage = async (req, res) => {
  const { userId, body, groupChatId, parentMessageId } = req.body;

  // Check if the message body is blank
  if (!body || body.trim() === '') {
    return res.status(400).json({ error: 'Message body cannot be blank' });
  }

  try {
    // Fetch the user to get the userName
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (process.env.NODE_ENV === 'production') {
      // Rate limiting check
      const currentTime = Date.now();
      if (userLastMessageTime[userId] && currentTime - userLastMessageTime[userId] < 5000) {
        return res.status(429).json({ error: 'You can only send one message every 5 seconds.' });
      }
      userLastMessageTime[userId] = currentTime;
    }

    const newMessage = new Message({
      userId,
      groupChatId,
      userName: user.userName, // Include userName in the message
      body,
      parentMessageId: parentMessageId || null,
      timestamp: new Date(),
    });

    await newMessage.save();
    console.log('New message saved.');

    // Fetch the group chat
    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      return res.status(404).json({ error: 'Group chat not found' });
    }

    // Check if the user is already in the watchers list
    const isUserWatching = await WatchersList.findOne({
      userId,
      groupChatId,
      type: 'groupchat',
    });

    if (!isUserWatching) {
      // Add the user to the watchers list if not already watching
      const newWatch = new WatchersList({
        userId,
        userName: user.userName,
        groupChatId,
        type: 'groupchat',
      });
      await newWatch.save();
      console.log('User added to group chat watch list.');
    }

    const newWatch = new WatchersList({
      userId,
      userName: user.userName,
      messageId: newMessage._id,
      type: 'groupreply',
    });
    await newWatch.save();
    console.log('New watch created.');

    // Call the activity creation logic
    await handleActivityCreation(
      userId,
      user.userName,
      groupChatId,
      groupChat.postId,
      newMessage._id,
      parentMessageId
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ error: 'Server error while sending message' });
  }
};

// Like a message
exports.likeMessage = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: `User with userId ${userId} not found` });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.likes.includes(user._id)) {
      message.likes.push(user._id);
      await message.save();
    }
    res.status(200).json(message);
  } catch (err) {
    console.error('Error liking message:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Dislike a message
exports.dislikeMessage = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: `User with userId ${userId} not found` });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!message.dislikes.includes(user._id)) {
      message.dislikes.push(user._id);
      await message.save();
    }
    res.status(200).json(message);
  } catch (err) {
    console.error('Error disliking message:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// Fetch messages by groupChatId and mark watch activities as read
exports.getMessagesByGroupChat = async (req, res) => {
  const { groupChatId, userId } = req.params;
  try {
    const messages = await Message.find({ groupChatId }).sort({ timestamp: 1 }).exec();

    // Extract message IDs from the fetched messages
    const messageIds = messages.map((message) => message._id);

    // Find watch activities for the current user and these messages
    const watchedActivities = await WatchersList.find({
      userId: userId,
      messageId: { $in: messageIds },
    });

    const watchedMessageIds = watchedActivities.map((activity) => activity.messageId.toString());

    // Add isWatched property to each message
    const messagesWithWatchStatus = messages.map((message) => ({
      ...message.toObject(),
      isWatched: watchedMessageIds.includes(message._id.toString()),
    }));

    // Update watch activities to mark them as read
    await WatchActivity.updateMany(
      { watcherUserId: userId, messageId: { $in: messageIds }, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json(messagesWithWatchStatus);
  } catch (err) {
    console.error('Error fetching messages by group chat:', err.message);
    res.status(500).json({ error: err.message });
  }
};
