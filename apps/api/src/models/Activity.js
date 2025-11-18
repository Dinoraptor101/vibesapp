// models/Activity.js
// Unified activity/notification model
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  // Recipient of the notification
  recipientId: {
    type: String,
    required: true,
    ref: 'User',
    index: true,
  },

  // Type of activity
  type: {
    type: String,
    required: true,
    enum: [
      'new_follower',
      'following_post',
      'nearby_post',
      'comment',
      'comment_reply',
      'post_hidden',
      'reaction', // Heart/like
    ],
    index: true,
  },

  // Actor who triggered the activity
  actor: {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    username: {
      type: String,
      required: true,
    },
    avatar: String,
  },

  // Target of the activity (post, comment, etc.)
  target: {
    type: { type: String, enum: ['post', 'comment', 'user'] },
    id: mongoose.Schema.Types.Mixed, // Can be ObjectId or String
    preview: String, // Text preview for posts/comments
    thumbnail: String, // Image URL for posts
  },

  // Read status
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  },

  readAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
    index: true,
  },
});

// Compound index for efficient queries
activitySchema.index({ recipientId: 1, createdAt: -1 });
activitySchema.index({ recipientId: 1, isRead: 1 });

activitySchema.post('save', function () {
  console.log('Activity saved:', this.type);
});

module.exports = mongoose.model('Activity', activitySchema);
