/**
 * Phase 3.4 Migration Script
 *
 * Adds reports[] array to Posts and strikes[] array to Users.
 * Safe to run multiple times (idempotent).
 *
 * Run with: node scripts/migratePhase3_4.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function migratePhase3_4() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully\n');

    const db = mongoose.connection.db;

    // Migrate Posts collection
    console.log('Migrating Posts collection...');
    const postsResult = await db.collection('posts').updateMany(
      { reports: { $exists: false } },
      {
        $set: {
          reports: [],
          hiddenAt: null,
          hiddenBy: null,
        },
      }
    );
    console.log(`  Posts updated: ${postsResult.modifiedCount}`);
    console.log(`  Posts matched: ${postsResult.matchedCount}`);

    // Ensure isDeleted field exists
    const isDeletedResult = await db
      .collection('posts')
      .updateMany({ isDeleted: { $exists: false } }, { $set: { isDeleted: false } });
    console.log(`  Posts with isDeleted added: ${isDeletedResult.modifiedCount}`);

    // Migrate Users collection
    console.log('\nMigrating Users collection...');
    const usersResult = await db
      .collection('users')
      .updateMany({ strikes: { $exists: false } }, { $set: { strikes: [] } });
    console.log(`  Users updated: ${usersResult.modifiedCount}`);
    console.log(`  Users matched: ${usersResult.matchedCount}`);

    // Ensure isBanned field exists
    const isBannedResult = await db
      .collection('users')
      .updateMany({ isBanned: { $exists: false } }, { $set: { isBanned: false, bannedAt: null } });
    console.log(`  Users with isBanned added: ${isBannedResult.modifiedCount}`);

    console.log('\n✅ Phase 3.4 migration complete!');

    // Summary
    const totalPosts = await db.collection('posts').countDocuments();
    const totalUsers = await db.collection('users').countDocuments();
    const postsWithReports = await db
      .collection('posts')
      .countDocuments({ reports: { $exists: true } });
    const usersWithStrikes = await db
      .collection('users')
      .countDocuments({ strikes: { $exists: true } });

    console.log('\n📊 Summary:');
    console.log(`  Total Posts: ${totalPosts}`);
    console.log(`  Posts with reports field: ${postsWithReports}`);
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Users with strikes field: ${usersWithStrikes}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the migration
migratePhase3_4();
