const mongoose = require('mongoose');
const { S3 } = require('@aws-sdk/client-s3');
const Post = require('../models/Post');
const User = require('../models/User');
const { createReplyActivity, createReactionActivity } = require('./activity');
const ReactionActivity = require('../models/ReactionActivity');
const ReplyActivity = require('../models/ReplyActivity');
const karma = require('./karma');
const { startSession } = require('mongoose');
const GroupChat = require('../models/Groupchat');
const WatchersList = require('../models/WatchersList');
const UserHandler = require('../handlers/UserHandler');

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
  const { text, image, userId, lat, lon, replyTo } = req.body;
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
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(newPost);
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
  if (pigeonId) {
    const user = await User.findOne({ pigeonId });
    await UserHandler.updateLastActiveAndGrantDailyReward(user);
  }

  const missingParams = [];
  if (!req.query.lat) missingParams.push('lat');
  if (!req.query.lon) missingParams.push('lon');
  if (!req.query.withReplies) missingParams.push('withReplies');
  if (!req.query.range) missingParams.push('range');
  if (!req.query.page) missingParams.push('page');
  if (!req.query.limit) missingParams.push('limit');

  if (missingParams.length > 0) {
    return res.status(400).json({ message: `Missing parameters: ${missingParams.join(', ')}` });
  }

  const lat = parseFloat(req.query.lat);
  const lon = parseFloat(req.query.lon);
  const withReplies = req.query.withReplies === 'true';
  const range = parseFloat(req.query.range);
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);

  const pageNumber = isNaN(page) ? 1 : page;
  const limitNumber = isNaN(limit) ? 20 : limit;

  try {
    const allPosts = await Post.find({ isHidden: false });

    const sortedPosts = allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Filter By Range Here using existing utility
    let filteredPosts;
    if (range !== 0) {
      filteredPosts = sortedPosts.filter((post) => {
        const distance = getDistanceFromLatLonInMiles(
          lat,
          lon,
          post.user.location.lat,
          post.user.location.lon
        );
        return distance <= range;
      });
    } else {
      filteredPosts = sortedPosts;
    }

    if (!withReplies) {
      filteredPosts = filteredPosts.filter((post) => !post.replyTo);
    }

    const totalPosts = filteredPosts.length;

    const totalPages = Math.ceil(totalPosts / limitNumber);

    const start = (pageNumber - 1) * limitNumber;

    const paginatedPosts = filteredPosts.slice(start, start + limitNumber);

    const hasMorePosts = pageNumber < totalPages;
    const nextPage = hasMorePosts ? pageNumber + 1 : null;

    //console.info(`Pagination: hasMorePosts=${hasMorePosts}, nextPage=${nextPage}, page=${pageNumber}, totalPages=${totalPages}`);

    const responsePayload = {
      results: paginatedPosts,
      nextPage,
      totalPosts,
      totalPages,
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
    if (!post) {
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

    const data = {
      post: {
        ...post.toObject(),
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
    const { userId } = req.body;
    console.log('Deleting post', { postId, userId });

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
      await session.abortTransaction();
      session.endSession();
      console.error('Karma action failed', { userId, karmaResult });
      return res.status(400).json({ error: karmaResult });
    }
    console.timeEnd('karma');

    console.log('Deleting image from S3');
    await deleteImageFromS3(post.image);

    console.log('Deleting post from database');
    await Post.findByIdAndDelete(postId);

    console.log('Post and image deleted successfully');
    res.status(200).json({ message: 'Post and image deleted successfully' });
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

// like a post
const likePost = async (req, res) => {
  const { userId, location } = req.body;
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
        message: `You cannot like your own post. Self-love is important, but this is too far!`,
      });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.userName) {
      return res.status(400).json({ message: 'Username is required' });
    }

    // Prevent liking a post that is already reacted to
    const existingReaction = post.reactions.find((reaction) => reaction.userId === userId);
    if (existingReaction) {
      console.error('User already voted on this post');
      return res.status(409).json({ message: 'You already voted on this post' });
    }

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

      await createReactionActivity({
        userId: userId,
        type: 'like',
        post: post,
        originalPosterId: post.user.userId,
      });

      console.info('Reaction activity created successfully');
      return res.status(200).json({ message: 'Post liked successfully' });
    } catch (activityError) {
      console.error('Error during proximal check or activity creation:', activityError);
      return res.status(500).json({ message: 'Error during proximal check or activity creation' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Dislike a post
const dislikePost = async (req, res) => {
  const { userId, location } = req.body;
  const { id: postHex } = req.params;

  try {
    // Fetch the full post document from the database
    const post = await Post.findById(postHex);
    if (!post) {
      console.error('Post not found');
      return res.status(404).json({ message: 'Post not found' });
    }

    // Prevent disliking own post
    if (post.user.userId === userId) {
      console.error('User tried to dislike their own post');
      return res.status(403).json({ message: 'You cannot dislike your own post' });
    }

    // Prevent disliking a post that is already reacted to
    const existingReaction = post.reactions.find((reaction) => reaction.userId === userId);
    if (existingReaction) {
      console.error('User already voted on this post');
      return res.status(409).json({ message: 'You already voted on this post' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.userName) {
      console.error('Username is required for user:', userId);
      return res.status(400).json({ message: 'Username is required' });
    }

    console.info('PROXIMAL CHECK: Calculating distance between user location and post location');
    const distance = getDistanceFromLatLonInMiles(
      location.lat,
      location.lon,
      post.user.location.lat,
      post.user.location.lon
    );
    const isProximal = distance <= 100;
    console.info('Distance:', distance, 'Proximal:', isProximal);

    post.reactions.push({
      userId,
      type: 'dislike',
      location,
      post: post,
      userName: user.userName,
    });

    const postUser = await User.findOne({ userId: post.user.userId }).select('-pigeonId');
    if (!postUser) {
      console.error('Post owner user not found');
      return res.status(404).json({ message: 'Post owner user not found' });
    }

    try {
      if (isProximal) {
        post.proximal_dislikes = (post.proximal_dislikes || 0) + 1;

        console.info('KARMA: Handling dislike given for user:', userId);
        const userDislikeResult = await karma.handleDislikeGiven(user);
        if (userDislikeResult !== true) {
          console.error('KARMA: Error handling dislike given for user:', userDislikeResult);
          return res.status(400).json({ message: userDislikeResult });
        }

        console.info('KARMA: Handling dislike received for post owner:', post.user.userId);
        const postDislikeReceivedResult = await karma.handleDislikeReceived(postUser);
        if (postDislikeReceivedResult !== true) {
          console.error(
            'KARMA: Error handling dislike received for post owner:',
            postDislikeReceivedResult
          );
          return res.status(400).json({ error: postDislikeReceivedResult });
        }
      }

      await post.save();

      await createReactionActivity({
        userId: userId,
        type: 'dislike',
        post: post,
        originalPosterId: post.user.userId,
      });

      console.info('Reaction activity created successfully');
      res.json(post);
    } catch (activityError) {
      console.error('Error during proximal check or activity creation:', activityError);
      return res.status(500).json({ message: 'Error during proximal check or activity creation' });
    }
  } catch (err) {
    console.error('Error disliking post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  likePost,
  dislikePost,
  getDistanceFromLatLonInMiles,
};
