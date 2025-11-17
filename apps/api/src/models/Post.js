// models/Post.js
const mongoose = require('mongoose');

// Define a sub-schema for the user field in the Post schema
const UserSubSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    userName: {
      type: String,
      required: true,
    },
    birthYear: {
      type: Number,
      required: true,
    },
    birthMonth: {
      type: Number,
      required: true,
    },
    sex: {
      type: String,
      required: true,
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lon: {
        type: Number,
        required: true,
      },
    },
    profilePictureUrl: {
      type: String,
      required: false,
    },
    mbtiPersonality: {
      type: String,
      required: false,
    },
  },
  { _id: false }
);

const ReactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  type: {
    type: String,
    required: true,
    enum: ['like'], // Only 'like' (heart) supported - Phase 3.4
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
  },
});

const ReportSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User',
  },
  reason: {
    type: String,
    required: true,
    enum: ['pornographic', 'spam', 'hate_speech'],
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false, // Allow textless posts in the backend.
  },
  image: {
    type: String,
    required: false, // Optional - comments don't need images
  },
  user: {
    type: UserSubSchema, // Use the sub-schema here
    required: true,
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  commentOn: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  replyToCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  reactions: [ReactionSchema],
  reports: [ReportSchema], // Phase 3.4: Community moderation
  proximal_dislikes: {
    type: Number,
    default: 0,
    required: true,
  },
  proximal_likes: {
    type: Number,
    default: 0,
    required: true,
  },
  proximal_users: {
    type: Number,
    default: 0,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    required: true,
  },
  hiddenAt: {
    type: Date,
    default: null,
  },
  hiddenBy: {
    type: String,
    enum: ['auto', 'admin', null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Note: Pre-save middleware removed (Phase 3.4) - isHidden now controlled by community reports only

module.exports = mongoose.model('Post', postSchema);
