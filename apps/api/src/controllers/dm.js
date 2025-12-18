const User = require('../models/User');
const Conversation = require('../models/Conversation');
const karma = require('./karma');
const sseManager = require('../handlers/sseManager');

/**
 * Lazy migration utility - ensures conversation has cursor-based read tracking
 * Runs on-demand when conversations are accessed (zero downtime migration)
 * @param {Object} conversation - Mongoose conversation document
 * @returns {Object} Updated conversation with readCursors
 */
const ensureConversationHasCursors = async (conversation) => {
  // Check if already migrated
  if (conversation.readCursors && conversation.readCursors.size > 0) {
    return conversation;
  }

  console.log(`[Migration] Upgrading conversation ${conversation._id} to cursor-based tracking`);

  // Initialize cursor structure
  if (!conversation.readCursors) {
    conversation.readCursors = new Map();
  }

  // For each participant, mark all existing messages as read (conservative approach)
  // This prevents overwhelming users with old "unread" messages after migration
  [conversation.user1Id, conversation.user2Id].forEach((userId) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage) {
      conversation.readCursors.set(userId, {
        lastReadMessageId: lastMessage._id,
        lastReadAt: new Date(),
      });
    }
  });

  await conversation.save();
  console.log(`[Migration] Conversation ${conversation._id} migrated successfully`);

  return conversation;
};

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
      status: { $in: ['approved', 'closed'] }, // Include both active and closed (archived)
    });

    console.log('Conversations found:', conversations.length);

    // Filter out pending conversations for the requester (they see it as a sent request)
    const validConversations = conversations.filter(
      (conversation) =>
        !(conversation.status === 'pending' && conversation.lastRequesterId === user.userId)
    );

    console.log('Valid conversations after filtering:', validConversations.length);

    // Get all other user IDs to check their online status in a single batch
    const otherUserIds = validConversations.map((conversation) => {
      return conversation.user1Id === user.userId ? conversation.user2Id : conversation.user1Id;
    });
    const onlineStatus = sseManager.getOnlineStatus(otherUserIds);

    const dmRequests = await Promise.all(
      validConversations.map(async (conversation) => {
        // Lazy migration: Ensure conversation has cursor-based tracking
        const migratedConversation = await ensureConversationHasCursors(conversation);

        // Calculate unread count using cursor system
        let unreadCount = 0;
        const cursor = migratedConversation.readCursors.get(user.userId);

        if (cursor?.lastReadMessageId) {
          // Find index of last read message
          const lastReadIndex = migratedConversation.messages.findIndex(
            (m) => m._id.toString() === cursor.lastReadMessageId.toString()
          );

          if (lastReadIndex !== -1) {
            // Count messages after cursor that aren't from current user
            unreadCount = migratedConversation.messages
              .slice(lastReadIndex + 1)
              .filter((m) => m.senderId !== user.userId).length;
          }
        } else {
          // No cursor exists - all messages from other user are unread
          unreadCount = migratedConversation.messages.filter(
            (m) => m.senderId !== user.userId
          ).length;
        }

        const lastMessage = migratedConversation.messages[migratedConversation.messages.length - 1];

        const user1 = await User.findOne({ userId: migratedConversation.user1Id });
        const user2 = await User.findOne({ userId: migratedConversation.user2Id });

        // Determine which user is the "other" user
        const otherUserData = migratedConversation.user1Id === user.userId ? user2 : user1;
        const otherUserId = migratedConversation.user1Id === user.userId ? migratedConversation.user2Id : migratedConversation.user1Id;

        // Add online status to otherUser data
        // Only include online status for approved (active) conversations, not closed ones
        const otherUserWithStatus = otherUserData ? {
          ...otherUserData.toJSON(),
          isOnline: migratedConversation.status === 'approved' ? (onlineStatus[otherUserId] || false) : undefined,
        } : null;

        return {
          _id: migratedConversation._id.toString(),
          user1Id: migratedConversation.user1Id,
          user2Id: migratedConversation.user2Id,
          lastRequesterId: migratedConversation.lastRequesterId,
          status: migratedConversation.status,
          // Computed fields for frontend
          otherUser: otherUserWithStatus,
          unreadCount,
          lastMessage: lastMessage
            ? {
                _id: lastMessage._id,
                senderId: lastMessage.senderId,
                body: lastMessage.body,
                timestamp: lastMessage.timestamp,
                readBy: lastMessage.readBy,
              }
            : null,
        };
      })
    );

    console.log('DM requests mapped:', dmRequests.length);

    // Sort conversations: approved (active) first, then closed (archived)
    // Within each group, sort by most recent message
    const sortedConversations = dmRequests.sort((a, b) => {
      // Active conversations come before closed/archived
      if (a.status === 'approved' && b.status === 'closed') return -1;
      if (a.status === 'closed' && b.status === 'approved') return 1;
      // Same status - sort by most recent message
      const aTime = a.lastMessage?.timestamp || a.updatedAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt;
      return new Date(bTime) - new Date(aTime);
    });

    res.status(200).json(sortedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Server error while fetching conversations' });
  }
};

exports.getConversation = async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user?.userId;

  console.log('Fetching conversation details for conversationId:', conversationId);
  console.log('Current user:', currentUserId);

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('Conversation not found:', conversationId);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user is part of this conversation
    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to view this conversation' });
    }

    // Lazy migration: Ensure conversation has cursor-based tracking
    conversation = await ensureConversationHasCursors(conversation);

    const user1 = await User.findOne({ userId: conversation.user1Id });
    const user2 = await User.findOne({ userId: conversation.user2Id });

    // Determine which user is the "other" user based on who's requesting
    const otherUser = conversation.user1Id === currentUserId ? user2 : user1;

    // Calculate unread count using cursor system
    let unreadCount = 0;
    const cursor = conversation.readCursors.get(currentUserId);

    if (cursor?.lastReadMessageId) {
      // Find index of last read message
      const lastReadIndex = conversation.messages.findIndex(
        (m) => m._id.toString() === cursor.lastReadMessageId.toString()
      );

      if (lastReadIndex !== -1) {
        // Count messages after cursor that aren't from current user
        unreadCount = conversation.messages
          .slice(lastReadIndex + 1)
          .filter((m) => m.senderId !== currentUserId).length;
      }
    } else {
      // No cursor exists - all messages from other user are unread
      unreadCount = conversation.messages.filter((m) => m.senderId !== currentUserId).length;
    }

    const conversationDetails = {
      _id: conversation._id.toString(),
      user1Id: conversation.user1Id,
      user2Id: conversation.user2Id,
      lastRequesterId: conversation.lastRequesterId,
      status: conversation.status,
      messages: conversation.messages.map((message) => ({
        _id: message._id,
        senderId: message.senderId,
        body: message.body,
        timestamp: message.timestamp,
        readBy: message.readBy,
      })),
      // Provide the other user (from current user's perspective)
      otherUser: otherUser ? otherUser.toJSON() : null,
      unreadCount,
    };

    res.status(200).json(conversationDetails);
  } catch (error) {
    console.error('Error fetching conversation details:', error.message);
    res.status(500).json({ error: 'Server error while fetching conversation details' });
  }
};

exports.sendDMMessage = async (req, res) => {
  const { conversationId, body } = req.body;
  const currentUserId = req.user?.userId;

  console.log('Sending message to conversationId:', conversationId, 'from user:', currentUserId);

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!body || body.trim() === '') {
    return res.status(400).json({ error: 'Message body cannot be blank' });
  }

  if (!conversationId) {
    return res.status(400).json({ error: 'Conversation ID is required' });
  }

  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user is part of this conversation
    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res
        .status(403)
        .json({ error: 'Not authorized to send messages in this conversation' });
    }

    if (conversation.status !== 'approved') {
      return res.status(400).json({ error: 'Conversation is not approved for messaging' });
    }

    const newMessage = {
      senderId: currentUserId,
      body: body.trim(),
      timestamp: new Date(),
      readBy: [currentUserId], // Mark as read by sender
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();
    await conversation.save();

    console.log('Message sent successfully');

    // Return the new message with its generated ID
    const savedMessage = conversation.messages[conversation.messages.length - 1];

    // Broadcast new message to recipient via SSE
    const recipientId =
      conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
    sseManager.broadcast(recipientId, 'new-message', {
      conversationId: conversation._id.toString(),
      message: {
        _id: savedMessage._id,
        senderId: savedMessage.senderId,
        body: savedMessage.body,
        timestamp: savedMessage.timestamp,
        readBy: savedMessage.readBy,
      },
    });
    res.status(201).json({
      _id: savedMessage._id,
      senderId: savedMessage.senderId,
      body: savedMessage.body,
      timestamp: savedMessage.timestamp,
      readBy: savedMessage.readBy,
    });
  } catch (error) {
    console.error('Error sending DM message:', error.message);
    res.status(500).json({ error: 'Server error while sending DM message' });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user?.userId;

  console.log(
    'Marking messages as read for userId:',
    currentUserId,
    'in conversationId:',
    conversationId
  );

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      console.log('Conversation not found:', conversationId);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user is part of this conversation
    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized to access this conversation' });
    }

    // Ensure conversation has cursor-based tracking
    conversation = await ensureConversationHasCursors(conversation);

    // Get last message in conversation
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (lastMessage) {
      // O(1) cursor update - no message iteration needed!
      conversation.readCursors.set(currentUserId, {
        lastReadMessageId: lastMessage._id,
        lastReadAt: new Date(),
      });

      await conversation.save();
      console.log(
        `[Cursor Update] User ${currentUserId} read up to message ${lastMessage._id} in conversation ${conversationId}`
      );

      // Broadcast read status to the other user via SSE
      const otherUserId =
        conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
      sseManager.broadcast(otherUserId, 'read-status', {
        conversationId: conversation._id.toString(),
        readAt: new Date(),
      });

      return res.json({
        success: true,
        lastReadMessageId: lastMessage._id,
      });
    }

    // No messages to mark as read
    res.json({ success: true, lastReadMessageId: null });
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
