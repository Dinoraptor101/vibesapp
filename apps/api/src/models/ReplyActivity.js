// models/ReplyActivity.js
const mongoose = require('mongoose');

const replyActivitySchema = new mongoose.Schema({
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
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  replyPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  originalPosterId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    default: 'reply',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

replyActivitySchema.post('save', function () {
  console.log('ReplyActivity saved.');
});

module.exports = mongoose.model('ReplyActivity', replyActivitySchema);
