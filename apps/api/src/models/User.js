// server/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    unique: true,
    index: true,
    ref: 'User',
  },
  pigeonId: {
    type: String,
    required: [true, 'Pigeon ID is required'],
    unique: true,
    index: true,
  },
  userName: {
    type: String,
    required: [true, 'User name is required'],
  },
  birthYear: {
    type: Number,
    required: [true, 'Birth year is required'],
  },
  birthMonth: {
    type: Number,
    required: [true, 'Birth month is required'],
  },
  polarity: {
    type: String,
    enum: {
      values: ['yin', 'yang'],
      message: 'Polarity must be either yin or yang',
    },
  },
  mbtiPersonality: {
    type: String,
  },
  sex: {
    type: String,
    required: [true, 'Sex is required'],
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
  vibes: {
    type: Number,
    required: true,
    default: 0, // Optional: Default value for new users
  },
  lastActiveAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
