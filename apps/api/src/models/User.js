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
    select: false, // SECURITY: Never include pigeonId in query results by default
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
    city: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
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
  isBanned: {
    type: Boolean,
    default: false,
  },
  bannedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  strikes: [
    {
      reason: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
  ],
  profilePictureUrl: {
    type: String,
  },
  bio: {
    type: String,
  },
  notificationPreferences: {
    new_follower: { type: Boolean, default: true },
    following_post: { type: Boolean, default: true },
    nearby_post: { type: Boolean, default: true },
    comment: { type: Boolean, default: true },
    comment_reply: { type: Boolean, default: true },
    post_hidden: { type: Boolean, default: true },
    reactions: { type: Boolean, default: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create geospatial index for location-based queries (nearby users/posts)
// Using 2d index (supports { lat, lon } format)
UserSchema.index({ 'location.lat': 1, 'location.lon': 1 });

// SECURITY: Ensure pigeonId is never exposed in JSON responses
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.pigeonId; // Remove pigeonId from JSON output
    // userName stays as-is (camelCase is our standard)

    // Transform location field names: lat/lon → latitude/longitude (frontend expectation)
    if (ret.location) {
      ret.location = {
        latitude: ret.location.lat,
        longitude: ret.location.lon,
        city: ret.location.city || null,
        state: ret.location.state || null,
      };
    }

    return ret;
  },
});

// SECURITY: Ensure pigeonId is never exposed in plain object conversion
UserSchema.set('toObject', {
  transform: (_doc, ret) => {
    delete ret.pigeonId; // Remove pigeonId from object output
    // userName stays as-is (camelCase is our standard)

    // Transform location field names: lat/lon → latitude/longitude (frontend expectation)
    if (ret.location) {
      ret.location = {
        latitude: ret.location.lat,
        longitude: ret.location.lon,
        city: ret.location.city || null,
        state: ret.location.state || null,
      };
    }

    return ret;
  },
});

// Phase 3.4: Strike system methods
UserSchema.methods.getActiveStrikes = function () {
  const now = new Date();
  return this.strikes.filter((strike) => strike.expiresAt > now);
};

UserSchema.methods.getCurrentRestrictions = function () {
  const activeStrikes = this.getActiveStrikes();
  const strikeCount = activeStrikes.length;

  // Strike 4 = permanent ban
  if (this.isBanned || strikeCount >= 4) {
    return {
      canPost: false,
      canComment: false,
      canReact: false,
      isBanned: true,
      strikeCount,
    };
  }

  // Strike 1-3 = 24-hour cooldowns
  if (strikeCount >= 1) {
    const latestStrike = activeStrikes.sort((a, b) => b.timestamp - a.timestamp)[0];
    const cooldownEnd = new Date(latestStrike.timestamp.getTime() + 24 * 60 * 60 * 1000);
    const inCooldown = new Date() < cooldownEnd;

    return {
      canPost: !inCooldown,
      canComment: !inCooldown,
      canReact: true, // Can always react (hearts)
      isBanned: false,
      strikeCount,
      cooldownEnd: inCooldown ? cooldownEnd : null,
    };
  }

  // No strikes = no restrictions
  return {
    canPost: true,
    canComment: true,
    canReact: true,
    isBanned: false,
    strikeCount: 0,
  };
};

module.exports = mongoose.model('User', UserSchema);
