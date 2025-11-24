const DMRequest = require('../models/DMRequest');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const sseManager = require('../handlers/sseManager');

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
      $or: [
        { user1Id: senderId, user2Id: recipientId },
        { user1Id: recipientId, user2Id: senderId },
      ],
    });
    if (existingConversation) {
      return res.status(400).json({ message: 'Already connected with this user' });
    }

    // Check if ANY pending request exists between these users (either direction)
    const pendingRequest = await DMRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipientId, status: 'pending' },
        { sender: recipientId, recipient: senderId, status: 'pending' },
      ],
    });
    if (pendingRequest) {
      // If the other user sent you a request, show different message
      if (pendingRequest.sender === recipientId) {
        return res.status(400).json({
          message: 'This user has already sent you a request. Check your DM Requests tab.',
        });
      }
      return res.status(400).json({ message: 'Request already pending' });
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

    // Broadcast DM request update to recipient via SSE
    sseManager.broadcast(recipientId, 'dm-request-update', {
      requestId: dmRequest._id.toString(),
      status: 'pending',
      sender: senderId,
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

    // Create conversation with proper field names
    const conversation = await Conversation.create({
      user1Id: dmRequest.sender,
      user2Id: dmRequest.recipient,
      lastRequesterId: dmRequest.sender,
      status: 'approved', // Immediately approved since request was accepted
      messages: [],
    });

    console.log('DM request accepted and conversation created');

    // Broadcast DM request update to both users via SSE
    sseManager.broadcast(dmRequest.sender, 'dm-request-update', {
      requestId: dmRequest._id.toString(),
      status: 'accepted',
    });
    sseManager.broadcast(dmRequest.recipient, 'dm-request-update', {
      requestId: dmRequest._id.toString(),
      status: 'accepted',
    });

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

    // Simply delete the request (no cooldown, sender can try again)
    await DMRequest.findByIdAndDelete(requestId);

    console.log('DM request declined and deleted');

    // Broadcast DM request update to sender via SSE
    sseManager.broadcast(dmRequest.sender, 'dm-request-update', {
      requestId: dmRequest._id.toString(),
      status: 'declined',
    });

    res.status(200).json({ message: 'Request declined' });
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
    // Check if already connected (conversation exists)
    const existingConversation = await Conversation.findOne({
      $or: [
        { user1Id: currentUserId, user2Id: targetUserId },
        { user1Id: targetUserId, user2Id: currentUserId },
      ],
    });

    if (existingConversation) {
      return res.status(200).json({
        canSend: false,
        reason: 'connected',
        conversationId: existingConversation._id,
      });
    }

    // Check for any pending request between these users (either direction)
    const pendingRequest = await DMRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: targetUserId, status: 'pending' },
        { sender: targetUserId, recipient: currentUserId, status: 'pending' },
      ],
    });

    if (pendingRequest) {
      // If you sent the request
      if (pendingRequest.sender === currentUserId) {
        return res.status(200).json({
          canSend: false,
          reason: 'pending',
          requestId: pendingRequest._id,
        });
      }
      // If they sent you the request
      return res.status(200).json({
        canSend: false,
        reason: 'received',
        requestId: pendingRequest._id,
        message: 'This user has sent you a request. Check your DM Requests tab.',
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
