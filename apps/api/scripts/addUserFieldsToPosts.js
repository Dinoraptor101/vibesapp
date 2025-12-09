/**
 * Migration Script: Add profilePictureUrl and mbtiPersonality to existing posts
 *
 * This script updates all posts to include profilePictureUrl and mbtiPersonality
 * in the embedded user object by looking up the current User data.
 *
 * Run with: node scripts/addUserFieldsToPosts.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Post = require('../src/models/Post');
const User = require('../src/models/User');

async function addUserFieldsToPosts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully');

    // Get all posts (including comments)
    const posts = await Post.find({});
    console.log(`Found ${posts.length} posts to check`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const post of posts) {
      try {
        // Check if fields already exist
        const needsUpdate = !post.user.profilePictureUrl || !post.user.mbtiPersonality;

        if (!needsUpdate) {
          skippedCount++;
          continue;
        }

        // Lookup current user data
        const user = await User.findOne({ userId: post.user.userId });

        if (!user) {
          console.warn(`⚠️  User not found for post ${post._id} (userId: ${post.user.userId})`);
          errorCount++;
          continue;
        }

        // Update post with user fields
        const updateFields = {};
        if (!post.user.profilePictureUrl && user.profilePictureUrl) {
          updateFields['user.profilePictureUrl'] = user.profilePictureUrl;
        }
        if (!post.user.mbtiPersonality && user.mbtiPersonality) {
          updateFields['user.mbtiPersonality'] = user.mbtiPersonality;
        }

        if (Object.keys(updateFields).length > 0) {
          await Post.updateOne({ _id: post._id }, { $set: updateFields });
          updatedCount++;

          if (updatedCount % 100 === 0) {
            console.log(`Progress: ${updatedCount} posts updated...`);
          }
        } else {
          skippedCount++;
        }
      } catch (err) {
        console.error(`Error processing post ${post._id}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n✅ Migration complete!');
    console.log(`   Updated: ${updatedCount} posts`);
    console.log(`   Skipped: ${skippedCount} posts (already have data)`);
    console.log(`   Errors:  ${errorCount} posts`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the migration
addUserFieldsToPosts();
