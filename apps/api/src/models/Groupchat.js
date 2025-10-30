// models/GroupChat.js
const mongoose = require('mongoose');

const GroupChatSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'Post',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GroupChat = mongoose.model('GroupChat', GroupChatSchema);
module.exports = GroupChat;
