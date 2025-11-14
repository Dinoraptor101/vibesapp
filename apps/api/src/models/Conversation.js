const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  user1Id: {
    type: String,
    required: true,
    ref: 'User',
  },
  user2Id: {
    type: String,
    required: true,
    ref: 'User',
  },
  lastRequesterId: {
    type: String,
    ref: 'User',
  },
  messages: [
    {
      senderId: {
        type: String,
        required: true,
        ref: 'User',
      },
      body: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      readBy: [
        {
          type: String,
          ref: 'User',
        },
      ],
    },
  ],
  // New cursor-based read tracking system (Phase 4.6)
  readCursors: {
    type: Map,
    of: new mongoose.Schema(
      {
        lastReadMessageId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        lastReadAt: {
          type: Date,
          required: true,
        },
      },
      { _id: false }
    ),
    default: {},
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'closed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Conversation = mongoose.model('Conversation', ConversationSchema);
module.exports = Conversation;
