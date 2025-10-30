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

const postSchema = new mongoose.Schema({
  text: {
    type: String,
    required: false, // Allow textless posts in the backend.
  },
  image: {
    type: String,
    required: true,
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
  reactions: [ReactionSchema],
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update isHidden status before saving
postSchema.pre('save', function (next) {
  if (this.proximal_dislikes > this.proximal_users / 3) {
    this.isHidden = true;
  } else {
    this.isHidden = false;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
