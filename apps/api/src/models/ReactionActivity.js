// models/ReactionActivity.js
const mongoose = require('mongoose');

const reactionActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  originalPosterId: {
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
});

reactionActivitySchema.post('save', function () {
  console.log('ReactionActivity saved.');
});

module.exports = mongoose.model('ReactionActivity', reactionActivitySchema);
