/**
 * Post Transformer Utility
 *
 * Transforms raw Post documents into complete, consistent response objects.
 * Follows the "Dumb Frontend, Smart Backend" principle:
 * - All computed fields (likeCount, commentCount) are calculated here
 * - Frontend receives complete data, no derivation needed
 * - Schema is consistent: all fields always present (0 for empty, not undefined)
 */

const mongoose = require('mongoose');
const Post = require('../models/Post');

/**
 * Transform a single post document to a complete response object
 * @param {Object} post - Mongoose Post document or plain object
 * @param {Object} options - Optional overrides
 * @param {number} options.commentCount - Pre-computed comment count (to avoid extra query)
 * @returns {Object} Complete post response object
 */
function transformPost(post, options = {}) {
  // Handle both Mongoose documents and plain objects
  const postObj = post.toObject ? post.toObject() : post;

  // Compute likeCount from reactions array
  const likeCount = Array.isArray(postObj.reactions)
    ? postObj.reactions.filter((r) => r.type === 'like').length
    : 0;

  // Use provided commentCount or default to 0 (caller should provide it)
  const commentCount = options.commentCount ?? postObj.commentCount ?? 0;

  return {
    ...postObj,
    _id: postObj._id,
    text: postObj.text || null,
    image: postObj.image || null,
    blurPlaceholder: postObj.blurPlaceholder || null,
    user: postObj.user,
    reactions: postObj.reactions || [],
    likeCount,
    commentCount,
    proximal_likes: postObj.proximal_likes || 0,
    proximal_dislikes: postObj.proximal_dislikes || 0,
    proximal_users: postObj.proximal_users || 0,
    isHidden: postObj.isHidden || false,
    isDeleted: postObj.isDeleted || false,
    createdAt: postObj.createdAt,
    updatedAt: postObj.updatedAt,
  };
}

/**
 * Transform multiple posts with comment counts fetched in bulk
 * More efficient than calling transformPost individually with separate queries
 * @param {Array} posts - Array of Post documents
 * @returns {Promise<Array>} Array of transformed post objects with comment counts
 */
async function transformPostsWithCommentCounts(posts) {
  if (!posts || posts.length === 0) {
    return [];
  }

  // Get all post IDs as strings for the lookup map
  const postIdStrings = posts.map((post) => (post._id ? post._id.toString() : post.toString()));

  // Convert to ObjectIds for MongoDB aggregation query
  // This is necessary because commentOn field stores ObjectIds
  const postObjectIds = postIdStrings.map((id) => new mongoose.Types.ObjectId(id));

  // Fetch comment counts in a single aggregation query
  const commentCounts = await Post.aggregate([
    {
      $match: {
        commentOn: { $in: postObjectIds },
        isDeleted: { $ne: true },
      },
    },
    {
      $group: {
        _id: '$commentOn',
        count: { $sum: 1 },
      },
    },
  ]);

  // Create lookup map for O(1) access
  // Convert ObjectId keys to strings for consistent lookup
  const commentCountMap = {};
  commentCounts.forEach((item) => {
    commentCountMap[item._id.toString()] = item.count;
  });

  // Transform each post with its comment count
  return posts.map((post) => {
    const postId = post._id ? post._id.toString() : post.toString();
    return transformPost(post, {
      commentCount: commentCountMap[postId] || 0,
    });
  });
}

/**
 * Get comment count for a single post
 * Use this when you need comment count for just one post
 * @param {ObjectId} postId - The post ID (must be ObjectId, not string)
 * @returns {Promise<number>} Comment count
 */
async function getCommentCount(postId) {
  const count = await Post.countDocuments({
    commentOn: postId,
    isDeleted: { $ne: true },
  });
  return count;
}

module.exports = {
  transformPost,
  transformPostsWithCommentCounts,
  getCommentCount,
};
