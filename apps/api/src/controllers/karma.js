/**
 * Karma System Configuration and Transaction Management
 *
 * This module manages the karma system for users, allowing them to perform actions
 * that affect their "vibes" (karma points). It includes initialization, transaction
 * handling, and various predefined actions with associated costs or rewards.
 * Karma Configuration:
 * - initialPoints: Starting vibes for a new user.
 * - maxPoints: Maximum vibes a user can have.
 * - postCost: Cost of creating a post.
 * - deleteRefund: Refund for deleting a post.
 * - replyCost: Cost of creating a reply.
 * - likeGivenPoints: Points awarded for giving a like.
 * - dislikeGivenPoints: Points deducted for giving a dislike.
 * - likeReceivedPoints: Points awarded for receiving a like.
 * - dislikeReceivedPoints: Points deducted for receiving a dislike.
 * - dailyReward: Daily reward points for users.
 * - dmRequestCost: Cost of sending a direct message request.
 * Permissions: (in frontend for now)
 * - Controls Permission: Requires 50 vibes.
 * - Group Chat Permission: Requires 100 vibes.
 * - Direct Message Permission: Requires 200 vibes.
 * - Omniverse Permission: Requires 300 vibes.
 * Usage:
 * - Initialize a user with `karma.initializeUser(user)`.
 * - Handle specific actions like post creation, deletion, likes, dislikes, etc.
 * - Ensure users have sufficient vibes for actions and enforce maximum vibes cap.
 */
const User = require('../models/User');

const karmaConfig = {
  initialPoints: 195, // Enable DMs after 5 days
  maxPoints: 399, // Max points a user can have (max red bar)
  postCost: -2, // Cost of post (everything should be relative to this)
  deleteRefund: 1, //Refund for deleting a post = cost of a reply
  replyCost: -1, //Cost of reply = less than cost of post
  likeGivenPoints: 1, //Reward of like = half price of a post
  dislikeGivenPoints: -3, //Cost of dislike = cost of a post
  likeReceivedPoints: 4, //Reward of getting like = cost of 2 posts
  dislikeReceivedPoints: -10, //Cost of getting dislike = cost of 3 posts
  dailyReward: 1, // Daily reward points for (per day if logged in)
  dmRequestCost: -6, //Cost of DM request = cost of 2 posts or a received like
};

class KarmaBank {
  static async initializeUser(user) {
    //Check User is Object
    const userId = user.userId;
    if (!userId) {
      console.error(`User Object is invalid, transaction not possible`);
      return false;
    }

    console.log(`Initializing user vibes for user ${user.userId}...`);

    if (user) {
      user.vibes = karmaConfig.initialPoints;
      await user.save();
      console.log(`User ${user.userId} initialized with ${karmaConfig.initialPoints} vibes.`);
      return true;
    } else {
      console.error(`User ${user.userId} not found.`);
      return false;
    }
  }

  static async transact(user, action) {
    let amount = 0;
    let actionName = '';

    //Check User is Object
    const userId = user.userId;
    if (!userId) {
      console.error(`User Object is invalid, transaction not possible`);
      return false;
    }

    switch (action) {
      case 'createPost':
        amount = karmaConfig.postCost;
        actionName = 'create a post';
        break;
      case 'deletePost':
        amount = karmaConfig.deleteRefund;
        actionName = 'delete a post';
        break;
      case 'createReply':
        amount = karmaConfig.replyCost;
        actionName = 'create a reply';
        break;
      case 'likeGiven':
        amount = karmaConfig.likeGivenPoints;
        actionName = 'give a like';
        break;
      case 'dislikeGiven':
        amount = karmaConfig.dislikeGivenPoints;
        actionName = 'give a dislike';
        break;
      case 'likeReceived':
        amount = karmaConfig.likeReceivedPoints;
        actionName = 'receive a like';
        break;
      case 'dislikeReceived':
        amount = karmaConfig.dislikeReceivedPoints;
        actionName = 'receive a dislike';
        break;
      case 'dailyReward':
        amount = karmaConfig.dailyReward;
        actionName = 'receive daily reward';
        break;
      case 'sendDMRequest':
        amount = karmaConfig.dmRequestCost;
        actionName = 'send a DM request';
        break;
      default:
        const errorMsg = 'Invalid action.';
        console.error(errorMsg);
        return errorMsg;
    }

    console.info(
      `Transaction details: userId=${user.userId}, action=${action}, amount=${amount}, actionName=${actionName}`
    );

    // Check if user will have positive vibes after transaction
    if (user.vibes + amount < 0) {
      console.log(`Insufficient vibes to ${actionName}, ${user.userName} has ${user.vibes} vibes.`);
      const errorMsg = `You don't pass the vibe check to ${actionName}, be nicer then try again.`;
      console.warn(errorMsg);
      return errorMsg;
    }

    // Calculate new vibes amount with cap
    /**
     * Calculates the new vibes for a user,
     * ensuring it does not exceed the maximum allowed points.
     * @param {number} user.vibes - The current vibes of the user.
     * @param {number} amount - The amount to be added to the user's vibes.
     * @param {Object} karmaConfig - Configuration object for karma settings.
     * @param {number} karmaConfig.maxPoints - The maximum points a user can have.
     * @returns {number} The new vibes value, limited to the maximum points allowed.
     */
    const newVibes = Math.min(user.vibes + amount, karmaConfig.maxPoints);

    //console.time('Update User Vibes for Transaction');
    const result = await User.updateOne({ userId: user.userId }, { $set: { vibes: newVibes } });
    //console.timeEnd('Update User Vibes for Transaction');

    if (result.nModified === 0) {
      const errorMsg = `Failed to update vibes for user ${user.userId}.`;
      console.error(errorMsg);
      return errorMsg;
    }

    console.info(`Transaction successful: User ${user.userId} now has ${newVibes} vibes.`);
    return true;
  }
}

/**
 * Karma operates with User Objects, do not submit userId.
 */
const karma = {
  initializeUser: KarmaBank.initializeUser,
  handlePostCreation: async (user) => {
    return await KarmaBank.transact(user, 'createPost');
  },
  handlePostDeletion: async (user) => {
    return await KarmaBank.transact(user, 'deletePost');
  },
  handleReplyCreation: async (user) => {
    return await KarmaBank.transact(user, 'createReply');
  },
  handleLikeGiven: async (user) => {
    return await KarmaBank.transact(user, 'likeGiven');
  },
  handleDislikeGiven: async (user) => {
    return await KarmaBank.transact(user, 'dislikeGiven');
  },
  handleLikeReceived: async (user) => {
    return await KarmaBank.transact(user, 'likeReceived');
  },
  handleDislikeReceived: async (user) => {
    return await KarmaBank.transact(user, 'dislikeReceived');
  },
  handleDailyReward: async (user) => {
    return await KarmaBank.transact(user, 'dailyReward');
  },
  handleDMRequest: async (user) => {
    return await KarmaBank.transact(user, 'sendDMRequest');
  },
};

module.exports = karma;
