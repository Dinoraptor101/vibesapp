const DMRequest = require('../models/DMRequest');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

// Send a DM request
const sendDMRequest = async (req, res) => {
  console.log('Sending DM request...');
  const { userId: recipientId } = req.params;
  const senderId = req.user?.userId;
  const { message } = req.body;

  if (!senderId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (senderId === recipientId) {
    return res.status(400).json({ message: 'Cannot send DM request to yourself' });
  }

  try {
    // Check if recipient exists
    const recipient = await User.findOne({ userId: recipientId });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already connected (existing conversation)
    const existingConversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });
    if (existingConversation) {
      return res.status(400).json({ message: 'Already connected with this user' });
    }

    // Check if pending request already exists
    const pendingRequest = await DMRequest.findOne({
      sender: senderId,
      recipient: recipientId,
      status: 'pending',
    });
    if (pendingRequest) {
      return res.status(400).json({ message: 'Request already pending' });
    }

    // Check 24h cooldown
    const canSend = await DMRequest.canSendRequest(senderId, recipientId);
    if (!canSend) {
      return res.status(429).json({
        message: 'You must wait 24 hours after a declined request before sending another',
      });
    }

    // Create new request
    const dmRequest = await DMRequest.create({
      sender: senderId,
      recipient: recipientId,
      message: message || '',
    });

    console.log('DM request sent successfully:', {
      sender: senderId,
      recipient: recipientId,
      status: dmRequest.status,
      _id: dmRequest._id,
    });
    res.status(201).json(dmRequest);
  } catch (error) {
    console.error('Error sending DM request:', error);
    res.status(500).json({ message: 'Error sending DM request', error });
  }
};

// Get all DM requests for the current user (as recipient)
const getDMRequests = async (req, res) => {
  console.log('Fetching DM requests...');
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    console.log('Looking for DM requests for recipient:', userId);
    const requests = await DMRequest.find({
      recipient: userId,
      status: 'pending',
    }).sort({ createdAt: -1 });

    console.log('Found DM requests:', requests.length);

    // Manually populate sender info (UUID-based, not ObjectId)
    const populatedRequests = await Promise.all(
      requests.map(async (request) => {
        console.log('Populating sender for request:', request.sender);
        const sender = await User.findOne({ userId: request.sender }).select('-pigeonId');
        console.log('Sender found:', sender?.userName || 'NOT FOUND');
        return {
          ...request.toObject(),
          sender,
        };
      })
    );

    console.log('Returning', populatedRequests.length, 'populated requests');
    res.status(200).json(populatedRequests);
  } catch (error) {
    console.error('Error fetching DM requests:', error);
    res.status(500).json({ message: 'Error fetching DM requests', error });
  }
};

// Accept a DM request
const acceptDMRequest = async (req, res) => {
  console.log('Accepting DM request...');
  const { requestId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const dmRequest = await DMRequest.findById(requestId);
    if (!dmRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (dmRequest.recipient !== userId) {
      return res.status(403).json({ message: 'Not authorized to accept this request' });
    }

    if (dmRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    dmRequest.status = 'accepted';
    dmRequest.respondedAt = new Date();
    await dmRequest.save();

    // Create conversation
    const conversation = await Conversation.create({
      participants: [dmRequest.sender, dmRequest.recipient],
      lastMessageAt: new Date(),
    });

    console.log('DM request accepted and conversation created');
    res.status(200).json({ dmRequest, conversation });
  } catch (error) {
    console.error('Error accepting DM request:', error);
    res.status(500).json({ message: 'Error accepting DM request', error });
  }
};

// Decline a DM request
const declineDMRequest = async (req, res) => {
  console.log('Declining DM request...');
  const { requestId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const dmRequest = await DMRequest.findById(requestId);
    if (!dmRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (dmRequest.recipient !== userId) {
      return res.status(403).json({ message: 'Not authorized to decline this request' });
    }

    if (dmRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    dmRequest.status = 'declined';
    dmRequest.respondedAt = new Date();
    await dmRequest.save();

    console.log('DM request declined');
    res.status(200).json(dmRequest);
  } catch (error) {
    console.error('Error declining DM request:', error);
    res.status(500).json({ message: 'Error declining DM request', error });
  }
};

// Check DM request status with a user (for cooldown display)
const checkDMRequestStatus = async (req, res) => {
  console.log('Checking DM request status...');
  const { userId: targetUserId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Check for pending request
    const pendingRequest = await DMRequest.findOne({
      sender: currentUserId,
      recipient: targetUserId,
      status: 'pending',
    });

    if (pendingRequest) {
      return res.status(200).json({
        canSend: false,
        reason: 'pending',
        requestId: pendingRequest._id,
      });
    }

    // Check for recent declined request (24h cooldown)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDeclinedRequest = await DMRequest.findOne({
      sender: currentUserId,
      recipient: targetUserId,
      status: 'declined',
      respondedAt: { $gte: oneDayAgo },
    });

    if (recentDeclinedRequest) {
      const cooldownEnd = new Date(
        recentDeclinedRequest.respondedAt.getTime() + 24 * 60 * 60 * 1000
      );
      return res.status(200).json({
        canSend: false,
        reason: 'cooldown',
        cooldownEndsAt: cooldownEnd,
      });
    }

    // Check if already connected
    const existingConversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId] },
    });

    if (existingConversation) {
      return res.status(200).json({
        canSend: false,
        reason: 'connected',
        conversationId: existingConversation._id,
      });
    }

    // Can send request
    return res.status(200).json({
      canSend: true,
    });
  } catch (error) {
    console.error('Error checking DM request status:', error);
    res.status(500).json({ message: 'Error checking DM request status', error });
  }
};

module.exports = {
  sendDMRequest,
  getDMRequests,
  acceptDMRequest,
  declineDMRequest,
  checkDMRequestStatus,
};
