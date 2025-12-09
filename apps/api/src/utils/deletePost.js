const { S3 } = require('@aws-sdk/client-s3');
const Post = require('../models/Post');

// Initialize S3 with correct AWS configuration
const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

/**
 * Centralized post deletion utility
 * Deletes S3 image FIRST, then deletes/soft-deletes post from database
 * Prevents orphaned images in S3
 *
 * @param {string|ObjectId} postId - MongoDB post ID
 * @param {Object} options - Deletion options
 * @param {boolean} options.hardDelete - If true, removes from DB. If false, soft delete (isDeleted=true)
 * @param {boolean} options.skipS3 - If true, skip S3 deletion (for testing/special cases)
 * @param {Object} options.session - MongoDB transaction session (optional)
 * @returns {Promise<Object>} - { success, deletedImage, deletedPost, error }
 */
async function deletePostWithImage(postId, options = {}) {
  const { hardDelete = false, skipS3 = false, session = null } = options;

  try {
    // Fetch the post
    const query = Post.findById(postId);
    if (session) query.session(session);
    const post = await query;

    if (!post) {
      return {
        success: false,
        deletedImage: false,
        deletedPost: false,
        error: 'Post not found',
      };
    }

    const imageKey = post.image;
    let deletedImage = false;

    console.log(
      `[deletePost] PostID: ${postId}, ImageKey: ${imageKey || 'none'}, HardDelete: ${hardDelete}`
    );

    // Step 1: Delete S3 image FIRST (if exists and not skipped)
    if (!skipS3 && imageKey && imageKey.trim() !== '') {
      try {
        // Validate S3 key format (should contain path separator)
        if (!imageKey.includes('/')) {
          console.warn(`[deletePost] Invalid S3 key format: ${imageKey}`);
          // Continue anyway - might be valid
        }

        await s3.deleteObject({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: imageKey,
        });

        deletedImage = true;
        console.log(`[deletePost] S3 image deleted: ${imageKey}`);
      } catch (s3Error) {
        // S3 deletion failed - STOP and don't delete post
        console.error(`[deletePost] S3 deletion failed for ${imageKey}:`, s3Error.message);
        return {
          success: false,
          deletedImage: false,
          deletedPost: false,
          error: `Failed to delete image from S3: ${s3Error.message}`,
          imageKey,
        };
      }
    } else {
      console.log('[deletePost] No image to delete or S3 skipped');
    }

    // Step 2: Delete/soft-delete post from database (only after S3 succeeds or no image)
    let deletedPost = false;

    if (hardDelete) {
      // Hard delete: Remove from database
      const deleteQuery = Post.findByIdAndDelete(postId);
      if (session) deleteQuery.session(session);
      await deleteQuery;
      deletedPost = true;
      console.log('[deletePost] Post hard deleted from DB');
    } else {
      // Soft delete: Set isDeleted flag
      post.isDeleted = true;
      if (session) {
        await post.save({ session });
      } else {
        await post.save();
      }
      deletedPost = true;
      console.log('[deletePost] Post soft deleted (isDeleted=true)');
    }

    return {
      success: true,
      deletedImage,
      deletedPost,
      imageKey: imageKey || null,
    };
  } catch (error) {
    console.error('[deletePost] Unexpected error:', error);
    return {
      success: false,
      deletedImage: false,
      deletedPost: false,
      error: error.message,
    };
  }
}

/**
 * Bulk delete multiple posts with image cleanup
 * @param {Array<string|ObjectId>} postIds - Array of post IDs
 * @param {Object} options - Same options as deletePostWithImage
 * @returns {Promise<Object>} - { success, totalPosts, deletedPosts, failedPosts, errors }
 */
async function bulkDeletePosts(postIds, options = {}) {
  const results = {
    success: true,
    totalPosts: postIds.length,
    deletedPosts: 0,
    failedPosts: 0,
    errors: [],
  };

  for (const postId of postIds) {
    const result = await deletePostWithImage(postId, options);

    if (result.success) {
      results.deletedPosts++;
    } else {
      results.failedPosts++;
      results.errors.push({
        postId,
        error: result.error,
        imageKey: result.imageKey,
      });
    }
  }

  if (results.failedPosts > 0) {
    results.success = false;
  }

  console.log(
    `[bulkDeletePosts] Completed: ${results.deletedPosts}/${results.totalPosts} deleted, ${results.failedPosts} failed`
  );

  return results;
}

module.exports = {
  deletePostWithImage,
  bulkDeletePosts,
};
