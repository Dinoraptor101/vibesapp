const mongoose = require('mongoose');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const karma = require('./karma');

exports.sendDMRequest = async (req, res) => {
  const { senderId, recipientId } = req.body;
  console.log('Sending DM request from senderId:', senderId, 'to recipientId:', recipientId);

  try {
    const sender = await User.findOne({ userId: senderId });
    const recipient = await User.findOne({ userId: recipientId });

    if (!sender || !recipient) {
      console.log('Sender or recipient not found:', { sender, recipient });
      return res.status(404).json({ error: 'Sender or recipient not found' });
    }

    // Check for any existing conversation between these users, regardless of status
    const existingConversation = await Conversation.findOne({
      $or: [
        { user1Id: sender.userId, user2Id: recipient.userId },
        { user1Id: recipient.userId, user2Id: sender.userId },
      ],
    });

    if (existingConversation) {
      // Handle pending conversations
      if (existingConversation.status === 'pending') {
        // Check if the requester is the current userId and the recipient is a member in the conversation
        if (existingConversation.lastRequesterId === sender.userId) {
          console.log('Pending DM request already exists between these users');
          return res
            .status(409)
            .json({ error: 'Pending DM request already exists between these users' });
        }
        return res.status(400).json({ error: 'DM request already exists between these users' });
      }
      // Handle approved conversations
      else if (existingConversation.status === 'approved') {
        return res
          .status(400)
          .json({ error: 'Active conversation already exists between these users' });
      }
      // Handle closed conversations - reopen them
      else if (existingConversation.status === 'closed') {
        existingConversation.status = 'pending';
        existingConversation.lastRequesterId = sender.userId;
        await existingConversation.save();
        console.log('Existing closed conversation updated to pending:', existingConversation);
        return res.status(200).json({ message: 'DM request sent successfully' });
      }
    }

    // If we reach here, there's no existing conversation - create a new one
    const karmaResult = await karma.handleDMRequest(sender);
    if (karmaResult !== true) {
      console.log('Karma check failed:', karmaResult);
      return res.status(400).json({ error: karmaResult });
    }

    const conversation = new Conversation({
      user1Id: sender.userId,
      user2Id: recipient.userId,
      lastRequesterId: sender.userId,
      messages: [],
      status: 'pending',
    });

    await conversation.save();
    console.log('New conversation created:', conversation._id);

    res.status(200).json({ message: 'DM request sent successfully' });
  } catch (error) {
    console.error('Error sending DM request:', error.message);
    res.status(500).json({ error: 'Server error while sending DM request' });
  }
};

exports.approveDMRequest = async (req, res) => {
  const { userId, senderId, recipientId } = req.body;
  console.log(
    'Approving DM request from senderId:',
    senderId,
    'to recipientId:',
    recipientId,
    'by userId:',
    userId
  );

  try {
    const sender = await User.findOne({ userId: senderId });
    const recipient = await User.findOne({ userId: recipientId });

    if (!sender || !recipient) {
      console.log('Sender or recipient not found:', { sender, recipient });
      return res.status(404).json({ error: 'Sender or recipient not found' });
    }

    let conversation = await Conversation.findOne({
      $or: [
        { user1Id: sender.userId, user2Id: recipient.userId, status: 'pending' },
        { user1Id: recipient.userId, user2Id: sender.userId, status: 'pending' },
      ],
    });

    if (!conversation) {
      console.log('DM request not found between these users');
      return res.status(404).json({ error: 'DM request not found between these users' });
    }

    // Ensure the user approving the request is not the requester
    if (conversation.lastRequesterId === userId) {
      console.log('User ID matches requester ID - cannot approve own request');
      return res.status(403).json({ error: 'User not authorized to approve own DM request' });
    }

    // Ensure the user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      console.log('User not part of this conversation');
      return res.status(403).json({ error: 'User not authorized to approve this DM request' });
    }

    conversation.status = 'approved';
    await conversation.save();
    console.log('Existing conversation updated to approved:', conversation._id);

    res.status(200).json({ message: 'DM request approved successfully' });
  } catch (error) {
    console.error('Error approving DM request:', error.message);
    res.status(500).json({ error: 'Server error while approving DM request' });
  }
};

exports.declineDMRequest = async (req, res) => {
  const { userId, senderId, recipientId } = req.body;
  console.log('Declining DM request from senderId:', senderId, 'to recipientId:', recipientId);

  try {
    const sender = await User.findOne({ userId: senderId });
    const recipient = await User.findOne({ userId: recipientId });

    if (!sender || !recipient) {
      console.log('Sender or recipient not found:', { sender, recipient });
      return res.status(404).json({ error: 'Sender or recipient not found' });
    }

    const conversation = await Conversation.findOne({
      $or: [
        { user1Id: sender.userId, user2Id: recipient.userId, status: 'pending' },
        { user1Id: recipient.userId, user2Id: sender.userId, status: 'pending' },
      ],
    });

    if (!conversation) {
      console.log('DM request not found between these users');
      return res.status(404).json({ error: 'DM request not found between these users' });
    }

    // Ensure the user declining the request is not the requester
    if (conversation.lastRequesterId === userId) {
      console.log('User ID matches requester ID - cannot decline own request');
      return res.status(403).json({ error: 'User not authorized to decline own DM request' });
    }

    // Ensure the user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      console.log('User not part of this conversation');
      return res.status(403).json({ error: 'User not authorized to decline own DM request' });
    }

    conversation.status = 'closed';
    await conversation.save();
    console.log('DM request declined and conversation status updated to closed:', conversation._id);

    res.status(200).json({
      message: 'DM request declined and conversation status updated to closed successfully',
    });
  } catch (error) {
    console.error('Error declining DM request:', error.message);
    res.status(500).json({ error: 'Server error while declining DM request' });
  }
};

exports.getConversations = async (req, res) => {
  const { userId } = req.params;
  console.log('Fetching conversations for userId:', userId);

  try {
    const user = await User.findOne({ userId }).select('-pigeonId');
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const conversations = await Conversation.find({
      $or: [{ user1Id: user.userId }, { user2Id: user.userId }],
    });

    console.log('Conversations found:', conversations.length);

    // Filter out conversations that are closed AND have no messages (declined conversations)
    // Also filter out pending conversations for the requester.
    const validConversations = conversations.filter(
      (conversation) =>
        !(conversation.status === 'closed' && conversation.messages.length === 0) &&
        !(conversation.status === 'pending' && conversation.lastRequesterId === user.userId)
    );

    console.log('Valid conversations after filtering:', validConversations.length);

    const dmRequests = await Promise.all(
      validConversations.map(async (conversation) => {
        const unreadMessages = conversation.messages.some(
          (message) => !message.readBy.includes(user.userId)
        );

        const lastMessage = conversation.messages[conversation.messages.length - 1];

        const user1 = await User.findOne({ userId: conversation.user1Id });
        const user2 = await User.findOne({ userId: conversation.user2Id });

        return {
          conversationId: conversation._id,
          user1Id: conversation.user1Id,
          user1Username: user1.userName,
          user2Id: conversation.user2Id,
          user2Username: user2.userName,
          lastRequesterId: conversation.lastRequesterId,
          status: conversation.status,
          hasUnreadMessages: unreadMessages,
          lastMessage: lastMessage
            ? {
                senderId: lastMessage.senderId,
                body: lastMessage.body,
                timestamp: lastMessage.timestamp,
              }
            : null,
        };
      })
    );

    console.log('DM requests mapped:', dmRequests.length);

    res.status(200).json(dmRequests);
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Server error while fetching conversations' });
  }
};

exports.getConversation = async (req, res) => {
  const { conversationId } = req.params;
  console.log('Fetching conversation details for conversationId:', conversationId);

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('Conversation not found:', conversationId);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const user1 = await User.findOne({ userId: conversation.user1Id });
    const user2 = await User.findOne({ userId: conversation.user2Id });

    const conversationDetails = {
      conversationId: conversation._id,
      user1Id: conversation.user1Id,
      user1Username: user1 ? user1.userName : null,
      user2Id: conversation.user2Id,
      user2Username: user2 ? user2.userName : null,
      lastRequesterId: conversation.lastRequesterId,
      status: conversation.status,
      messages: conversation.messages.map((message) => ({
        id: message._id,
        senderId: message.senderId,
        body: message.body,
        timestamp: message.timestamp,
        readBy: message.readBy,
      })),
    };

    res.status(200).json(conversationDetails);
  } catch (error) {
    console.error('Error fetching conversation details:', error.message);
    res.status(500).json({ error: 'Server error while fetching conversation details' });
  }
};

exports.sendDMMessage = async (req, res) => {
  const { senderId, recipientId, body } = req.body;

  if (!body || body.trim() === '') {
    return res.status(400).json({ error: 'Message body cannot be blank' });
  }

  try {
    const sender = await User.findOne({ userId: senderId });
    const recipient = await User.findOne({ userId: recipientId });

    if (!sender || !recipient) {
      return res.status(404).json({ error: 'Sender or recipient not found' });
    }

    let conversation = await Conversation.findOne({
      $or: [
        { user1Id: sender.userId, user2Id: recipient.userId },
        { user1Id: recipient.userId, user2Id: sender.userId },
      ],
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    if (conversation.status !== 'approved') {
      return res.status(400).json({ error: 'Conversation is not approved for messaging' });
    }

    conversation.messages.push({
      senderId: sender.userId,
      body,
      timestamp: new Date(),
      readBy: [sender.userId], // Mark the message as read by the sender
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error sending DM message:', error.message);
    res.status(500).json({ error: 'Server error while sending DM message' });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  const { userId } = req.body;
  const { conversationId } = req.params;
  console.log('Marking messages as read for userId:', userId, 'in conversationId:', conversationId);

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('Conversation not found:', conversationId);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    conversation.messages.forEach((message) => {
      if (!message.readBy.includes(user.userId)) {
        message.readBy.push(user.userId);
      }
    });

    await conversation.save();
    console.log('Messages marked as read for userId:', userId);

    res.status(200).json({ message: 'Messages marked as read successfully' });
  } catch (error) {
    console.error('Error marking messages as read:', error.message);
    res.status(500).json({ error: 'Server error while marking messages as read' });
  }
};

exports.closeConversation = async (req, res) => {
  const { conversationId } = req.params;
  console.log('Closing conversation with ID:', conversationId);

  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('Conversation not found:', conversationId);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    conversation.status = 'closed';
    await conversation.save();
    console.log('Conversation closed:', conversationId);

    res.status(200).json({ message: 'Conversation closed successfully' });
  } catch (error) {
    console.error('Error closing conversation:', error.message);
    res.status(500).json({ error: 'Server error while closing conversation' });
  }
};

/**
 * Get conversation status between two users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with conversation status
 * @returns {boolean} response.exists - Whether conversation exists
 * @returns {string} [response.conversationId] - ID of the conversation if exists
 * @returns {('pending'|'approved'|'closed')} [response.status] - Status of conversation if exists
 * @returns {string} [response.lastRequesterId] - ID of the last requester if exists
 */
exports.getConversationStatus = async (req, res) => {
  const { currentUserId, otherUserId } = req.query;
  console.log(
    'Checking conversation status between currentUserId:',
    currentUserId,
    'and otherUserId:',
    otherUserId
  );

  try {
    const conversations = await Conversation.find({
      $or: [
        { user1Id: currentUserId, user2Id: otherUserId },
        { user1Id: otherUserId, user2Id: currentUserId },
      ],
    });

    if (conversations.length === 0) {
      return res.status(200).json({ exists: false });
    }

    const conversation = conversations[0];
    return res.status(200).json({
      exists: true,
      conversationId: conversation._id,
      status: conversation.status,
      lastRequesterId: conversation.lastRequesterId,
    });
  } catch (error) {
    console.error('Error checking conversation status:', error);
    res.status(500).json({ error: 'Server error while checking conversation status' });
  }
};
