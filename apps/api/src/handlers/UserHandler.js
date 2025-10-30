const karma = require('../controllers/karma');
const User = require('../models/User');

class UserHandler {
  // Helper function to generate a unique pigeonId
  static generatePigeonId() {
    const timestamp = new Date().getTime().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `PIGEON${timestamp}${randomStr}`.toUpperCase();
  }

  // Helper function to generate a UUID
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Updates the user's last active timestamp and grants daily reward if eligible
   * @param {Object} user - The user document from MongoDB
   * @param {string} user.userId - The unique identifier of the user
   * @param {Date} [user.lastActiveAt] - The last time user was active
   * @param {number} user.vibes - The user's current vibes points
   * @returns {Promise<boolean>} - Returns true if daily reward was granted, false otherwise
   */
  static async updateLastActiveAndGrantDailyReward(user) {
    if (!user || !user.userId || !user.lastActiveAt) {
      console.warn('User parameter is required or incomplete');
      return false;
    }

    try {
      const now = new Date();
      const HOURS_24 = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // If last activity was more than 24 hours ago
      const lastActiveAt = new Date(user.lastActiveAt);
      if (now - lastActiveAt >= HOURS_24) {
        const result = await karma.handleDailyReward(user);
        if (result === true) {
          await User.updateOne({ userId: user.userId }, { $set: { lastActiveAt: now } });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error updating last active and granting daily reward:', error);
      return false;
    }
  }
}

module.exports = UserHandler;
