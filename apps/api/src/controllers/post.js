const mongoose = require('mongoose');
const { S3 } = require('@aws-sdk/client-s3');
const Post = require('../models/Post');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Follow = require('../models/Follow');
const { createReplyActivity } = require('./activity');
const ReactionActivity = require('../models/ReactionActivity');
const ReplyActivity = require('../models/ReplyActivity');
const karma = require('./karma');
const { createActivity } = require('./activityNew');
const Activity = require('../models/Activity');
const { startSession } = require('mongoose');
const GroupChat = require('../models/Groupchat');
const WatchersList = require('../models/WatchersList');
const UserHandler = require('../handlers/UserHandler');
const {
  transformPostsWithCommentCounts,
  transformPost,
  getCommentCount,
} = require('../utils/postTransformer');

// Initialize S3 with correct AWS configuration
const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

// Create a post or reply
const createPost = async (req, res) => {
  console.time('createpost');
  const { text, image, location, replyTo } = req.body;
  const userId = req.validatedUserId; // Get userId from auth middleware

  // Extract lat/lon from location object
  const lat = location?.lat;
  const lon = location?.lon;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Location (lat, lon) is required' });
  }

  // Image is required for new posts (not replies)
  if (!replyTo && !image) {
    return res.status(400).json({ error: 'Image is required for new posts' });
  }

  const session = await startSession();

  try {
    session.startTransaction();

    console.time('fetchuser');
    const user = await User.findOne({ userId }).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      console.error('User not found', { userId });
      return res.status(404).json({ error: 'User not found' });
    }
    console.timeEnd('fetchuser');

    const action = replyTo ? 'handleReplyCreation' : 'handlePostCreation';
    console.time('karma');
    const karmaResult = await karma[action](user);
    if (karmaResult !== true) {
      await session.abortTransaction();
      session.endSession();
      console.error('Karma action failed', { userId, karmaResult });
      return res.status(400).json({ error: karmaResult });
    }
    console.timeEnd('karma');

    const usersWithin100Miles = await User.countDocuments({
      'location.lat': { $gte: lat - 1.5, $lte: lat + 1.5 },
      'location.lon': { $gte: lon - 1.5, $lte: lon + 1.5 },
    }).session(session);

    const replyToPost = replyTo ? mongoose.Types.ObjectId.createFromHexString(replyTo) : null;

    console.time('save');
    const newPost = new Post({
      post: new mongoose.Types.ObjectId(),
      text,
      image,
      user: {
        userName: user.userName,
        userId: user.userId,
        birthYear: user.birthYear,
        birthMonth: user.birthMonth,
        sex: user.sex,
        location: { lat, lon },
        profilePictureUrl: user.profilePictureUrl,
        mbtiPersonality: user.mbtiPersonality,
      },
      replyTo: replyToPost,
      proximal_users: usersWithin100Miles,
    });

    await newPost.save({ session });
    console.timeEnd('save');

    // Create a group chat for the post
    const groupChat = new GroupChat({
      postId: newPost._id,
      authorUserId: user.userId,
      authorUserName: user.userName,
    });
    await groupChat.save({ session });

    // Automatically watch the group chat by the post author
    const newWatch = new WatchersList({
      userId: user.userId,
      userName: user.userName,
      groupChatId: groupChat._id,
      type: 'groupchat',
    });
    await newWatch.save({ session });

    if (replyToPost) {
      const originalPost = await Post.findById(replyToPost).session(session);
      if (!originalPost) {
        await session.abortTransaction();
        session.endSession();
        console.error('Original post not found', { replyTo });
        return res.status(404).json({ error: 'Original post not found' });
      }
      console.time('createReplyActivity');
      await createReplyActivity(
        {
          userId: userId,
          userName: user.userName,
          post: originalPost._id,
          replyPost: newPost._id,
          originalPosterId: originalPost.user.userId,
        },
        session
      );
      console.timeEnd('createReplyActivity');
      console.info('Reply activity created', {
        originalPostId: originalPost._id,
        replyPostId: newPost._id,
      });
    } else {
      // Only create following_post and nearby_post for new posts (not replies)
      console.time('createPostActivities');

      // 1. Notify followers (following_post) - use batch insert for performance
      const followers = await Follow.find({ following: userId }).session(session);
      if (followers.length > 0) {
        const followerActivities = [];
        for (const follower of followers) {
          const followerUser = await User.findOne({ userId: follower.follower }).session(session);
          if (followerUser && followerUser.notificationPreferences?.following_post !== false) {
            followerActivities.push({
              recipientId: follower.follower,
              type: 'following_post',
              actor: {
                userId: user.userId,
                username: user.userName,
                avatar: user.profilePictureUrl,
              },
              target: {
                type: 'post',
                id: newPost._id,
                thumbnail: newPost.image,
                preview: newPost.text,
              },
              isRead: false,
              createdAt: new Date(),
            });
          }
        }

        if (followerActivities.length > 0) {
          await Activity.insertMany(followerActivities, { session });
          console.info(`Created ${followerActivities.length} following_post activities`);
        }
      }

      // 2. Notify nearby users (nearby_post) - within 50km radius
      // Using simple lat/lon range query (more compatible, doesn't require geospatial index)
      const latRange = 0.45; // ~50km in degrees latitude
      const lonRange = 0.45; // ~50km in degrees longitude (approximate at mid-latitudes)

      const nearbyUsers = await User.find({
        userId: { $ne: userId }, // Exclude self
        'location.lat': { $gte: lat - latRange, $lte: lat + latRange },
        'location.lon': { $gte: lon - lonRange, $lte: lon + lonRange },
      })
        .limit(100)
        .session(session); // Limit to 100 nearest users for performance

      if (nearbyUsers.length > 0) {
        const nearbyActivities = [];
        for (const nearbyUser of nearbyUsers) {
          if (nearbyUser.notificationPreferences?.nearby_post !== false) {
            nearbyActivities.push({
              recipientId: nearbyUser.userId,
              type: 'nearby_post',
              actor: {
                userId: user.userId,
                username: user.userName,
                avatar: user.profilePictureUrl,
              },
              target: {
                type: 'post',
                id: newPost._id,
                thumbnail: newPost.image,
                preview: newPost.text,
              },
              isRead: false,
              createdAt: new Date(),
            });
          }
        }

        if (nearbyActivities.length > 0) {
          await Activity.insertMany(nearbyActivities, { session });
          console.info(`Created ${nearbyActivities.length} nearby_post activities`);
        }
      }

      console.timeEnd('createPostActivities');
    }

    await session.commitTransaction();
    session.endSession();

    // Return complete post with consistent schema (new post has 0 comments/likes)
    const transformedPost = transformPost(newPost, { commentCount: 0 });
    res.status(201).json(transformedPost);
    console.timeEnd('createpost');
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating post', { error: err.message });
    res.status(500).json({ error: err.message });
  }
};

const getPosts = async (req, res) => {
  //console.info('Getting Posts: Input parameters:', req.query);

  //Subliminal Function: Update Daily Reward (if applicable)
  const pigeonId = req.headers['x-pigeon-id'];
  let currentUserId = null;
  if (pigeonId) {
    const user = await User.findOne({ pigeonId });
    if (user) {
      currentUserId = user.userId;
      await UserHandler.updateLastActiveAndGrantDailyReward(user);
    }
  }

  // Parse query parameters with defaults
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);
  const pageNumber = Number.isNaN(page) ? 1 : page;
  const limitNumber = Number.isNaN(limit) ? 20 : limit;

  // Optional location-based filtering
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lon = req.query.lon ? parseFloat(req.query.lon) : null;
  const range = req.query.range ? parseFloat(req.query.range) : null;

  // Optional filters
  const withReplies = req.query.withReplies === 'true';
  const userId = req.query.userId; // Filter by specific user
  const replyTo = req.query.replyTo; // Filter by parent post (for comments)
  const following = req.query.following === 'true'; // Filter by following users

  try {
    // Build query filter
    const query = { isHidden: false, isDeleted: { $ne: true } };

    // Exclude posts that the current user has reported (hidden for them)
    if (currentUserId) {
      query.hiddenForUsers = { $ne: currentUserId };
    }

    // Filter by user if provided
    if (userId) {
      query['user.userId'] = userId;
    }

    // Filter by following users if requested
    if (following) {
      const currentUserId = req.validatedUserId; // Get from auth middleware

      if (!currentUserId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get list of users the current user is following
      const followingList = await Follow.find({ follower: currentUserId }).select('following');
      const followingUserIds = followingList.map((f) => f.following);

      // If not following anyone, return empty result
      if (followingUserIds.length === 0) {
        return res.status(200).json({
          posts: [],
          page: pageNumber,
          limit: limitNumber,
          total: 0,
          hasMore: false,
        });
      }

      // Filter posts by following users
      query['user.userId'] = { $in: followingUserIds };
    }

    // Filter by parent post if provided (for fetching comments)
    if (replyTo) {
      query.replyTo = replyTo;
    }

    const allPosts = await Post.find(query);

    // Sort by creation date (newest first)
    const sortedPosts = allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply location filter if lat/lon/range provided
    let filteredPosts = sortedPosts;
    if (lat !== null && lon !== null && range !== null && range > 0) {
      filteredPosts = sortedPosts.filter((post) => {
        const distance = getDistanceFromLatLonInMiles(
          lat,
          lon,
          post.user.location.lat,
          post.user.location.lon
        );
        return distance <= range;
      });
    }

    // Filter out comments (commentOn field) - only show top-level posts
    // Note: replyTo field is for post-to-post replies (V1 feature, not used in V2)
    if (!withReplies) {
      filteredPosts = filteredPosts.filter((post) => !post.commentOn);
    }

    const totalPosts = filteredPosts.length;
    const totalPages = Math.ceil(totalPosts / limitNumber);
    const start = (pageNumber - 1) * limitNumber;
    const paginatedPosts = filteredPosts.slice(start, start + limitNumber);
    const hasMorePosts = pageNumber < totalPages;

    // Transform posts with complete schema (likeCount, commentCount, etc.)
    const transformedPosts = await transformPostsWithCommentCounts(paginatedPosts);

    // Return standardized response format
    const responsePayload = {
      posts: transformedPosts,
      page: pageNumber,
      limit: limitNumber,
      total: totalPosts,
      hasMore: hasMorePosts,
    };

    res.json(responsePayload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPostById = async (req, res) => {
  const { id: postHex } = req.params;
  const { userId } = req.query; //We need this to compare if the user is the owner of the post

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required.' });
  }

  try {
    // Fetch the post document from the database
    const post = await Post.findById(postHex);
    if (!post || post.isDeleted) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userReaction = post.reactions.find((reaction) => reaction.userId === userId);
    const ownerReacted = userReaction !== undefined;

    const replies = await Post.find({ replyTo: post._id }).sort({ createdAt: -1 }).exec();

    // console.info('ACTIVITY:: Marking activities as read');
    await ReactionActivity.updateMany(
      { post: post._id, originalPosterId: userId, isRead: false },
      { $set: { isRead: true } }
    );
    await ReplyActivity.updateMany(
      { post: post._id, originalPosterId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Get comment count for this post
    const commentCount = await getCommentCount(post._id);

    // Transform post with complete schema
    const transformedPost = transformPost(post, { commentCount });

    const data = {
      post: {
        ...transformedPost,
        post: post._id,
      },
      ownerReacted,
      replies: replies.map((reply) => ({
        ...reply.toObject(),
        post: reply._id,
      })),
    };

    res.status(200).json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.validatedUserId; // Get userId from auth middleware
    console.log('Soft deleting post', { postId, userId });

    if (!postId) {
      console.error('API Error: Missing postId');
      return res.status(400).json({ message: 'API Error: Missing postId' });
    }
    if (!userId) {
      console.error('API Error: Missing userId');
      return res.status(400).json({ message: 'API Error: Missing userId' });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      console.error('Invalid postId format');
      return res.status(400).json({ message: 'Invalid postId format' });
    }

    // Fetch the full post document from the database
    const post = await Post.findById(postId);
    if (!post) {
      console.error(`Post with ID ${postId} not found`);
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.userId.toString() !== userId) {
      console.error('User not authorized to delete this post');
      return res.status(403).json({ message: 'You cannot delete posts of others' });
    }

    // Check if already deleted
    if (post.isDeleted) {
      return res.status(400).json({ message: 'Post is already deleted' });
    }

    // Transact Karma for deleting a post before making any changes
    console.time('karma');

    // Fetch user's Object from database
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).json({
        error: 'Unable to retrieve user object from database to process Karma refund.',
      });
    }
    const action = 'handlePostDeletion';
    const karmaResult = await karma[action](user);
    if (karmaResult !== true) {
      console.error('Karma action failed', { userId, karmaResult });
      return res.status(400).json({ error: karmaResult });
    }
    console.timeEnd('karma');

    // Soft delete: Set isDeleted flag instead of removing from database
    console.log('Soft deleting post (setting isDeleted=true)');
    post.isDeleted = true;
    await post.save();

    console.log('Post soft deleted successfully');
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteImageFromS3 = async (imageKey) => {
  if (!imageKey) {
    console.log('No image to delete');
    return;
  }

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imageKey,
  };

  try {
    await s3.deleteObject(params);
    console.log('Image deleted from S3');
  } catch (err) {
    console.error('Error deleting image from S3:', err);
    throw err;
  }
};

// Toggle like on a post (like if not liked, unlike if already liked)
const likePost = async (req, res) => {
  const userId = req.validatedUserId; // Get from auth middleware
  const { id: postHex } = req.params;

  try {
    // Fetch the full post document from the database
    const post = await Post.findById(postHex);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Prevent liking own post
    if (post.user.userId === userId) {
      return res.status(403).json({
        message: 'You cannot like your own post. Self-love is important, but this is too far!',
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.userName) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Check if user already has a reaction on this post
    const existingReactionIndex = post.reactions.findIndex(
      (reaction) => reaction.userId === userId
    );
    const existingReaction =
      existingReactionIndex !== -1 ? post.reactions[existingReactionIndex] : null;

    // If user already liked this post, UNLIKE it
    if (existingReaction) {
      console.info('User already liked this post, removing like');

      // Calculate if the like was proximal (within 100 miles)
      const distance = getDistanceFromLatLonInMiles(
        existingReaction.location.lat,
        existingReaction.location.lon,
        post.user.location.lat,
        post.user.location.lon
      );
      const wasProximal = distance <= 100;

      // Remove the reaction
      post.reactions.splice(existingReactionIndex, 1);

      // Adjust proximal_likes counter if it was a proximal like
      if (wasProximal && post.proximal_likes > 0) {
        post.proximal_likes -= 1;
      }

      await post.save();

      return res.status(200).json({
        success: true,
        action: 'unliked',
        message: 'Post unliked successfully',
        proximal_likes: post.proximal_likes,
        post,
      });
    }

    // Otherwise, ADD a like

    // Use user's current location from their profile
    const location = user.location || { lat: 0, lon: 0 };

    console.info('PROXIMAL CHECK: Calculating distance between user location and post location');
    const distance = getDistanceFromLatLonInMiles(
      location.lat,
      location.lon,
      post.user.location.lat,
      post.user.location.lon
    );
    const isProximal = distance <= 100;
    console.info('Distance:', distance, 'Proximal:', isProximal);

    console.info('Adding reaction to post');
    post.reactions.push({
      userId,
      type: 'like',
      location,
      post: post,
      userName: user.userName,
    });

    const postUser = await User.findOne({ userId: post.user.userId }).select('-pigeonId');
    console.log(postUser);
    if (!postUser) {
      console.error('Post owner user not found');
      return res.status(404).json({ message: 'Post owner user not found' });
    }

    try {
      if (isProximal) {
        post.proximal_likes = (post.proximal_likes || 0) + 1;

        console.info('KARMA: Handling like given for user:', userId);
        const userLikeResult = await karma.handleLikeGiven(user);
        if (userLikeResult !== true) {
          console.error('KARMA: Error handling like given for user:', userLikeResult);
          return res.status(400).json({ message: userLikeResult });
        }

        console.info('KARMA: Handling like received for post owner:', post.user.userId);
        const postLikeResult = await karma.handleLikeReceived(postUser);
        if (postLikeResult !== true) {
          console.error('KARMA: Error handling like received for post owner:', postLikeResult);
          return res.status(400).json({ message: postLikeResult });
        }
      }

      await post.save();

      // Create reaction activity using new unified model
      await createActivity({
        recipientId: post.user.userId,
        type: 'reaction',
        actor: {
          userId: user.userId,
          username: user.userName,
          avatar: user.profilePictureUrl,
        },
        target: {
          type: 'post',
          id: post._id,
          thumbnail: post.image,
        },
      });

      console.info('Reaction activity created successfully');
      return res.status(200).json({
        success: true,
        action: 'liked',
        message: 'Post liked successfully',
        proximal_likes: post.proximal_likes,
        post,
      });
    } catch (activityError) {
      console.error('Error during proximal check or activity creation:', activityError);
      return res.status(500).json({ message: 'Error during proximal check or activity creation' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a post// Delete a post

// Utility function to calculate distance between two lat/lon vibes using the Haversine formula
function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon1 - lon2) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      (Math.sin(dLon / 2) * Math.sin(dLon / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Phase 3.4: Report a post
const reportPost = async (req, res) => {
  const { userId, reason, location } = req.body;
  const { id: postHex } = req.params;

  try {
    // Validate required fields
    if (!userId || !reason || !location || !location.lat || !location.lon) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, reason, location',
      });
    }

    // Validate reason enum
    const validReasons = ['pornographic', 'spam', 'hate_speech'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reason. Must be one of: pornographic, spam, hate_speech',
      });
    }

    // Fetch the post
    const post = await Post.findById(postHex);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Prevent reporting own post
    if (post.user.userId === userId) {
      return res.status(403).json({
        success: false,
        message: 'You cannot report your own post',
      });
    }

    // Check if user already reported this post
    const existingReport = post.reports.find((report) => report.userId === userId);
    if (existingReport) {
      return res.status(409).json({
        success: false,
        message: 'You already reported this post',
      });
    }

    // Add the report
    post.reports.push({
      userId,
      reason,
      location,
      timestamp: new Date(),
    });

    // Hide post from this reporter immediately
    if (!post.hiddenForUsers) {
      post.hiddenForUsers = [];
    }
    if (!post.hiddenForUsers.includes(userId)) {
      post.hiddenForUsers.push(userId);
    }

    // Calculate nearby reports (within 50 miles of post location)
    const nearbyReports = post.reports.filter((report) => {
      const distance = getDistanceFromLatLonInMiles(
        report.location.lat,
        report.location.lon,
        post.user.location.lat,
        post.user.location.lon
      );
      return distance <= 50;
    });

    let isHidden = false;
    let message = 'Report submitted successfully';

    // Get auto-hide threshold from settings
    const settings = await Settings.getSettings();
    const autoHideThreshold = settings.reportThreshold || 3;

    // Auto-hide if threshold nearby reports reached
    if (nearbyReports.length >= autoHideThreshold && !post.isHidden) {
      post.isHidden = true;
      post.hiddenAt = new Date();
      post.hiddenBy = 'auto';
      isHidden = true;
      message = 'Post auto-hidden due to community reports';

      // Create post_hidden activity to notify the post author
      await createActivity({
        recipientId: post.user.userId,
        type: 'post_hidden',
        actor: {
          userId: 'system',
          username: 'VibesApp',
          avatar: null,
        },
        target: {
          type: 'post',
          id: post._id,
          thumbnail: post.image,
          preview: post.text,
        },
      });
      console.info('post_hidden activity created for user:', post.user.userId);

      // Add strike to post author
      const postAuthor = await User.findOne({ userId: post.user.userId });
      if (postAuthor) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day expiry

        postAuthor.strikes.push({
          reason: `Post auto-hidden: ${nearbyReports.length} community reports`,
          timestamp: new Date(),
          expiresAt,
        });

        // Check if Strike 4 - permanent ban
        const activeStrikes = postAuthor.getActiveStrikes();
        if (activeStrikes.length >= 4) {
          postAuthor.isBanned = true;
          postAuthor.bannedAt = new Date();
          message = 'Post auto-hidden. User banned (Strike 4).';
        }

        await postAuthor.save();
      }
    }

    await post.save();

    return res.status(200).json({
      success: true,
      reportCount: nearbyReports.length,
      isHidden,
      message,
    });
  } catch (error) {
    console.error('Error reporting post:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Unlike a post (DELETE reaction)
const unlikePost = async (req, res) => {
  const userId = req.validatedUserId; // Get from auth middleware
  const { id: postHex } = req.params;

  try {
    const post = await Post.findById(postHex);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Find the user's like reaction
    const reactionIndex = post.reactions.findIndex(
      (reaction) => reaction.userId === userId && reaction.type === 'like'
    );

    if (reactionIndex === -1) {
      return res.status(404).json({ message: 'No like found to remove' });
    }

    const reaction = post.reactions[reactionIndex];

    // Calculate if the like was proximal (within 100 miles)
    const distance = getDistanceFromLatLonInMiles(
      reaction.location.lat,
      reaction.location.lon,
      post.user.location.lat,
      post.user.location.lon
    );
    const wasProximal = distance <= 100;

    // Remove the reaction
    post.reactions.splice(reactionIndex, 1);

    // Adjust proximal_likes counter if it was a proximal like
    if (wasProximal && post.proximal_likes > 0) {
      post.proximal_likes -= 1;
    }

    await post.save();

    // Note: We're NOT reversing karma here as per rebuild design
    // The karma system may be removed entirely in future phases

    return res.status(200).json({
      message: 'Post unliked successfully',
      proximal_likes: post.proximal_likes,
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * React to a post (like/unlike toggle)
 * POST /api/posts/:id/react
 * Body: { type: 'like' | null }
 */
const reactToPost = async (req, res) => {
  const userId = req.validatedUserId;
  const { id: postHex } = req.params;
  const { type } = req.body; // 'like' or null (to unlike)

  try {
    const post = await Post.findById(postHex);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingReaction = post.reactions.find((reaction) => reaction.userId === userId);

    // If type is null, unlike
    if (type === null) {
      if (!existingReaction) {
        return res.status(400).json({ message: 'No reaction to remove' });
      }

      // Remove reaction
      post.reactions = post.reactions.filter((reaction) => reaction.userId !== userId);

      // Update proximal counts if it was proximal
      const user = await User.findOne({ userId });
      if (user?.location) {
        const distance = getDistanceFromLatLonInMiles(
          user.location.lat,
          user.location.lon,
          post.user.location.lat,
          post.user.location.lon
        );
        if (distance <= 100) {
          post.proximal_likes = Math.max(0, (post.proximal_likes || 0) - 1);
        }
      }

      await post.save();

      return res.status(200).json({
        success: true,
        post,
      });
    }

    // If type is 'like', add reaction
    if (type === 'like') {
      if (existingReaction) {
        return res.status(409).json({ message: 'You already reacted to this post' });
      }

      // Prevent liking own post
      if (post.user.userId === userId) {
        return res.status(403).json({ message: 'You cannot like your own post' });
      }

      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const location = user.location || { lat: 0, lon: 0 };

      // Add reaction
      post.reactions.push({
        userId,
        type: 'like',
        location,
      });

      // Update proximal counts
      const distance = getDistanceFromLatLonInMiles(
        location.lat,
        location.lon,
        post.user.location.lat,
        post.user.location.lon
      );
      if (distance <= 100) {
        post.proximal_likes = (post.proximal_likes || 0) + 1;
      }

      await post.save();

      // Create reaction activity using new unified model
      await createActivity({
        recipientId: post.user.userId,
        type: 'reaction',
        actor: {
          userId: user.userId,
          username: user.userName,
          avatar: user.profilePictureUrl,
        },
        target: {
          type: post.commentOn ? 'comment' : 'post',
          id: post.commentOn || post._id, // Use parent post ID for comments, post ID for posts
          thumbnail: post.image,
          preview: post.text,
        },
      });
      console.info('Reaction activity created for', post.commentOn ? 'comment' : 'post');

      return res.status(200).json({
        success: true,
        post,
      });
    }

    return res.status(400).json({ message: 'Invalid reaction type' });
  } catch (error) {
    console.error('Error reacting to post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Search posts globally by text
 * GET /api/posts/search?q=searchTerm&page=1&limit=20
 */
const searchPosts = async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;

  try {
    // Validate search query
    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const searchTerm = q.trim();
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 20;

    // Build search query
    // Search in post text field using case-insensitive regex
    const searchQuery = {
      text: { $regex: searchTerm, $options: 'i' },
      isHidden: false, // Only show visible posts
      commentOn: { $exists: false }, // Exclude comments, only show posts
    };

    // Get total count for pagination
    const total = await Post.countDocuments(searchQuery);

    // Execute search with pagination
    const posts = await Post.find(searchQuery)
      .sort({ createdAt: -1 }) // Newest first
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    // Transform posts with complete schema (likeCount, commentCount)
    const transformedPosts = await transformPostsWithCommentCounts(posts);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNumber);
    const hasMore = pageNumber < totalPages;

    return res.status(200).json({
      success: true,
      posts: transformedPosts.map((post) => ({
        ...post,
        post: post._id, // Map _id to post field for frontend compatibility
      })),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  reactToPost,
  reportPost,
  searchPosts,
  getDistanceFromLatLonInMiles,
};
