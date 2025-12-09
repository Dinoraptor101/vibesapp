// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  groupChatId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'GroupChat',
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  userName: {
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
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  dislikes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
