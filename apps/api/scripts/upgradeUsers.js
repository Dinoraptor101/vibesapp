/**
 * MongoDB Upgrade Script
 *
 * This script upgrades the users collection to the new format.
 *
 * Description:
 * - Connects to the MongoDB database using the URI from environment variables.
 * - Defines a User model with the required schema.
 * - Fetches the current year.
 * - Logs the total number of users before the update.
 * - Updates users who have an 'age' field (number type) but do not have a 'birthYear' field and have a non-null 'userId'.
 * - Sets the 'birthYear' based on the current year minus the 'age'.
 * - Sets the 'birthMonth' to 1.
 * - Sets the 'mbtiPersonality' to 'INTJ'.
 * - Sets the 'polarity' to 'positive' if 'sex' is 'Male', otherwise 'negative'.
 * - Removes the 'age' field.
 * - Logs the update result summary.
 * - Closes the MongoDB connection.
 *
 * Fields Removed:
 * - age
 *
 * Fields Added:
 * - birthYear: Calculated as current year minus age.
 * - birthMonth: Set to 1.
 * - mbtiPersonality: Set to 'INTJ'.
 * - polarity: Set to 'positive' if sex is 'Male', otherwise 'negative'.
 *
 * Expected Values:
 * - birthYear: Number (calculated)
 * - birthMonth: Number (1)
 * - mbtiPersonality: String ('INTJ')
 * - polarity: String ('positive' or 'negative')
 */

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri);

const User = mongoose.model(
  'User',
  new mongoose.Schema({
    userId: { type: String, required: true },
    pigeonId: String,
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
    vibes: Number,
    lastActiveAt: Date,
  })
);

async function updateUsers() {
  const currentYear = new Date().getFullYear();

  console.log('Starting the update process...');
  console.log(`Current Year: ${currentYear}`);

  const totalUsersBeforeUpdate = await User.countDocuments({});
  console.log(`Total users before update: ${totalUsersBeforeUpdate}`);

  const result = await User.updateMany(
    {
      age: { $exists: true, $type: 'number' },
      birthYear: { $exists: false },
      userId: { $ne: null, $exists: true },
    },
    [
      {
        $set: {
          birthYear: { $subtract: [currentYear, '$age'] },
          birthMonth: 1,
          mbtiPersonality: 'INTJ',
          polarity: {
            $cond: {
              if: { $eq: ['$sex', 'Male'] },
              then: 'positive',
              else: 'negative',
            },
          },
        },
      },
      {
        $unset: 'age',
      },
    ],
    { upsert: false, strict: false }
  );

  console.log(`Total documents matched: ${result.matchedCount}`);
  console.log(`Total documents updated: ${result.modifiedCount}`);
  console.log(`Total documents skipped: ${totalUsersBeforeUpdate - result.matchedCount}`);
  console.log(`Total errors: ${result.writeErrors ? result.writeErrors.length : 0}`);

  console.log('Users updated successfully');
  mongoose.connection.close();
}

updateUsers().catch((err) => {
  console.error('Error during update:', err);
  mongoose.connection.close();
});
