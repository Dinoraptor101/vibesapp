// models/WatchActivity.js
const mongoose = require('mongoose');

const watchActivitySchema = new mongoose.Schema({
  watcherUserId: {
    type: String,
    required: true,
    ref: 'User',
  },
  watcherUserName: {
    type: String,
    required: true,
    ref: 'User',
  },
  authorUserId: {
    type: String,
    required: true,
    ref: 'User',
  },
  authorUserName: {
    type: String,
    required: true,
    ref: 'User',
  },
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: false,
  },
  parentMessageId: {
    type: String,
    required: false,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  type: {
    type: String,
    required: true,
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
  groupChatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupChat',
    required: false,
  },
});

watchActivitySchema.post('save', function () {
  console.log('WatchActivity saved.');
});

module.exports = mongoose.model('WatchActivity', watchActivitySchema);
