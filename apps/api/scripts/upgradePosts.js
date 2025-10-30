/**
 * MongoDB Upgrade Script
 *
 * This script upgrades the posts collection to the new format.
 *
 * Description:
 * - Connects to the MongoDB database using the URI from environment variables.
 * - Defines a Post model with the required schema.
 * - Fetches the current year.
 * - Logs the total number of posts before the update.
 * - Updates posts to include the new fields in the user sub-schema.
 * - Sets the 'birthYear' based on the current year minus the 'age' if 'age' exists.
 * - Sets the 'birthMonth' to 1 if not already set.
 * - Sets the 'mbtiPersonality' to 'INTJ' if not already set.
 * - Sets the 'polarity' to 'positive' if 'sex' is 'Male', otherwise 'negative' if not already set.
 * - Removes the 'age' field from the user sub-schema.
 * - Logs the update result summary.
 * - Closes the MongoDB connection.
 *
 * Fields Removed:
 * - age (from user sub-schema)
 *
 * Fields Added:
 * - birthYear: Calculated as current year minus age (if age exists).
 * - birthMonth: Number (1 if not already set)
 * - mbtiPersonality: String ('INTJ' if not already set)
 * - polarity: String ('positive' if sex is 'Male', otherwise 'negative' if not already set)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri);

const Post = mongoose.model(
  'Post',
  new mongoose.Schema({
    text: String,
    image: String,
    user: {
      userId: { type: String, required: true },
      userName: String,
      birthYear: Number,
      birthMonth: Number,
      polarity: String,
      mbtiPersonality: String,
      sex: String,
      location: {
        lat: Number,
        lon: Number,
      },
    },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
    reactions: [
      {
        userId: { type: String, required: true },
        type: String,
        location: {
          lat: Number,
          lon: Number,
        },
      },
    ],
    proximal_dislikes: { type: Number, default: 0, required: true },
    proximal_likes: { type: Number, default: 0, required: true },
    proximal_users: { type: Number, default: 0, required: true },
    isHidden: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now },
  })
);

async function updatePosts() {
  const currentYear = new Date().getFullYear();

  console.log('Starting the update process...');
  console.log(`Current Year: ${currentYear}`);

  const totalPostsBeforeUpdate = await Post.countDocuments({});
  console.log(`Total posts before update: ${totalPostsBeforeUpdate}`);

  const result = await Post.updateMany(
    {
      'user.age': { $exists: true, $type: 'number' },
    },
    [
      {
        $set: {
          'user.birthYear': { $subtract: [currentYear, '$user.age'] },
          'user.birthMonth': { $ifNull: ['$user.birthMonth', 1] },
          'user.mbtiPersonality': { $ifNull: ['$user.mbtiPersonality', 'INTJ'] },
          'user.polarity': {
            $cond: {
              if: { $eq: ['$user.sex', 'Male'] },
              then: 'positive',
              else: 'negative',
            },
          },
        },
      },
      {
        $unset: 'user.age',
      },
    ],
    { upsert: false, strict: false }
  );

  console.log(`Total documents matched: ${result.matchedCount}`);
  console.log(`Total documents updated: ${result.modifiedCount}`);
  console.log(`Total documents skipped: ${totalPostsBeforeUpdate - result.matchedCount}`);
  console.log(`Total errors: ${result.writeErrors ? result.writeErrors.length : 0}`);

  console.log('Posts updated successfully');
  mongoose.connection.close();
}

updatePosts().catch((err) => {
  console.error('Error during update:', err);
  mongoose.connection.close();
});
