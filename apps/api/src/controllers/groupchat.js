const mongoose = require('mongoose');
const GroupChat = require('../models/Groupchat');
const WatchersList = require('../models/WatchersList');

// Fetch group chats by postId
exports.getGroupChats = async (req, res) => {
  const { postId } = req.query;
  console.log('Fetching group chats for postId:', postId);
  try {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log('Invalid postId:', postId);
      return res.status(400).json({ error: 'Invalid postId' });
    }
    const groupChats = await GroupChat.find({ postId });
    console.log('Group chats found:', groupChats.length);
    res.status(200).json(groupChats);
  } catch (error) {
    console.error('Error fetching group chat:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new group chat
exports.createGroupChat = async (req, res) => {
  const { postId, userId, authorUserName } = req.body;
  console.log('Creating group chat for postId:', postId);
  try {
    // Ensure postId is an ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.log('Invalid postId:', postId);
      return res.status(400).json({ error: 'Invalid postId' });
    }

    const groupChat = new GroupChat({ postId, userId, authorUserName });
    await groupChat.save();
    console.log('Group chat created:', groupChat);

    // Automatically watch the group chat by the post author
    const newWatch = new WatchersList({
      userId: userId,
      userName: authorUserName,
      groupChatId: groupChat._id,
      type: 'groupchat',
    });
    await newWatch.save();
    console.log('New watch created for group chat author:', newWatch);

    res.status(201).json(groupChat);
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      try {
        const existingGroupChat = await GroupChat.findOne({ postId });
        console.log('Duplicate group chat found:', existingGroupChat);
        return res.status(200).json(existingGroupChat);
      } catch (findError) {
        console.error(
          'createGroupChat caught a duplicate attempt, but failed to fetch the existing group chat:',
          findError.message
        );
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      console.error('Error creating group chat:', error.message);
      if (error.name === 'ValidationError') {
        res.status(400).json({
          error: Object.values(error.errors).map((val) => val.message),
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
};
