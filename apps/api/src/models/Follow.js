// server/models/Follow.js
const mongoose = require('mongoose');

const FollowSchema = new mongoose.Schema({
  follower: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  following: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can only follow another user once
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', FollowSchema);
