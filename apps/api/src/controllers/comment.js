const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const { createActivity } = require('./activityNew');
const { transformPost, transformPostsWithCommentCounts } = require('../utils/postTransformer');

/**
 * Create a comment on a post
 * POST /api/comments
 * Body: { text, postId, location: { lat, lon } }
 */
exports.createComment = async (req, res) => {
  try {
    const { text, postId, location, replyToCommentId } = req.body;
    const pigeonId = req.headers['x-pigeon-id'];

    // Validation
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required',
      });
    }

    if (!location || typeof location.lat !== 'number' || typeof location.lon !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location (lat, lon) is required',
      });
    }

    // Get user from pigeonId
    const user = await User.findOne({ pigeonId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify parent post exists
    const parentPost = await Post.findById(postId);
    if (!parentPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Create comment (as a Post with commentOn field)
    const comment = new Post({
      text: text.trim(),
      commentOn: postId, // Use commentOn instead of replyTo
      replyToCommentId: replyToCommentId || null, // Store reply relationship
      user: {
        userId: user.userId, // FIXED: Use user.userId (UUID) instead of user._id (ObjectId)
        userName: user.userName,
        birthYear: user.birthYear,
        birthMonth: user.birthMonth,
        sex: user.sex,
        location: {
          lat: location.lat,
          lon: location.lon,
        },
        profilePictureUrl: user.profilePictureUrl,
        mbtiPersonality: user.mbtiPersonality,
      },
      reactions: [],
      reports: [],
      createdAt: new Date(),
    });

    await comment.save();

    // Create activity notification
    if (replyToCommentId) {
      // This is a reply to another comment - notify the comment author
      console.info('🔔 Comment reply detected - replyToCommentId:', replyToCommentId);
      const parentComment = await Post.findById(replyToCommentId);
      console.info('🔍 Parent comment found:', {
        id: parentComment?._id,
        authorUserId: parentComment?.user.userId,
        currentUserId: user.userId,
        isSameUser: parentComment?.user.userId === user.userId,
      });

      if (parentComment && parentComment.user.userId !== user.userId) {
        console.info('✅ Creating comment_reply activity for user:', parentComment.user.userId);
        const activity = await createActivity({
          recipientId: parentComment.user.userId,
          type: 'comment_reply',
          actor: {
            userId: user.userId,
            userName: user.userName,
            avatar: user.profilePictureUrl,
          },
          target: {
            type: 'post', // Navigate to parent post, not comment
            id: postId, // Parent post ID, not comment ID
            thumbnail: parentPost.image,
            preview: comment.text,
          },
        });
        console.info('🎉 comment_reply activity created:', {
          activityId: activity?._id,
          recipientId: parentComment.user.userId,
          actorId: user.userId,
        });
      } else {
        console.info('⚠️ Skipped notification - same user or parent comment not found');
      }
    } else {
      // This is a top-level comment on a post - notify the post author
      if (parentPost.user.userId !== user.userId) {
        await createActivity({
          recipientId: parentPost.user.userId,
          type: 'comment',
          actor: {
            userId: user.userId,
            userName: user.userName,
            avatar: user.profilePictureUrl,
          },
          target: {
            type: 'post',
            id: parentPost._id,
            thumbnail: parentPost.image,
            preview: comment.text,
          },
        });
        console.info('comment activity created for user:', parentPost.user.userId);
      }
    }

    // Return populated comment with consistent schema
    const populatedComment = await Post.findById(comment._id);
    const transformedComment = transformPost(populatedComment, { commentCount: 0 });

    res.status(201).json({
      success: true,
      post: transformedComment, // Keep 'post' key for frontend compatibility
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message,
    });
  }
};

/**
 * Get comments for a post
 * GET /api/comments/:postId?page=1&limit=20
 */
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Convert string postId to ObjectId for MongoDB query
    const postObjectId = new mongoose.Types.ObjectId(postId);

    // Get comments (posts with commentOn = postId)
    const comments = await Post.find({
      commentOn: postObjectId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Transform comments with consistent schema (likeCount, commentCount for replies)
    const transformedComments = await transformPostsWithCommentCounts(comments);

    // Get total count
    const total = await Post.countDocuments({
      commentOn: postObjectId,
      isDeleted: false,
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    res.json({
      success: true,
      posts: transformedComments, // Keep 'posts' key for frontend compatibility
      currentPage: page,
      totalPages,
      totalPosts: total,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message,
    });
  }
};

/**
 * Delete a comment
 * DELETE /api/comments/:commentId
 */
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const pigeonId = req.headers['x-pigeon-id'];

    // Get user
    const user = await User.findOne({ pigeonId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get comment
    const comment = await Post.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Check ownership
    if (comment.user.userId !== user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    // Soft delete
    comment.isDeleted = true;
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message,
    });
  }
};
