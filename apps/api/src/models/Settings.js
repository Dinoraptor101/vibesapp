const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Singleton pattern - only one settings document
  _id: { type: String, default: 'app_settings' },

  // Moderation settings
  reportThreshold: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
    required: true,
  },

  // Admin notification settings
  notificationEmail: {
    type: String,
    default: 'admin@vibesapp.com',
  },

  // Metadata
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    default: 'system',
  },
});

// Update timestamp on save
settingsSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get settings (creates default if none exist)
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findById('app_settings');

  if (!settings) {
    // Create default settings if none exist
    settings = await this.create({
      _id: 'app_settings',
      reportThreshold: 3,
      notificationEmail: 'admin@vibesapp.com',
    });
  }

  return settings;
};

// Static method to update settings
settingsSchema.statics.updateSettings = async function (updates) {
  const settings = await this.getSettings();

  if (updates.reportThreshold !== undefined) {
    settings.reportThreshold = updates.reportThreshold;
  }

  if (updates.notificationEmail !== undefined) {
    settings.notificationEmail = updates.notificationEmail;
  }

  if (updates.updatedBy) {
    settings.updatedBy = updates.updatedBy;
  }

  await settings.save();
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
