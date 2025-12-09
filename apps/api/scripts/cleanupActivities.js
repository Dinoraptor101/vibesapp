/**
 * Activity Cleanup Script
 *
 * Smart retention policy:
 * - Delete read activities 7 days after they were marked as read
 * - Delete unread activities 30 days after creation (prevent infinite accumulation)
 *
 * This script should be run as a daily cron job:
 * crontab -e
 * 0 2 * * * cd /path/to/api && node scripts/cleanupActivities.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const Activity = require('../src/models/Activity');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI environment variable not set');
  process.exit(1);
}

async function cleanupActivities() {
  try {
    console.log('🧹 Starting activity cleanup...');
    console.log('⏰ Current time:', new Date().toISOString());

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Calculate cutoff dates
    const readCutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const unreadCutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    console.log('📅 Read activities cutoff (readAt):', readCutoffDate.toISOString());
    console.log('📅 Unread activities cutoff (createdAt):', unreadCutoffDate.toISOString());

    // Count activities before cleanup
    const totalBefore = await Activity.countDocuments();
    const readBefore = await Activity.countDocuments({ isRead: true });
    const unreadBefore = await Activity.countDocuments({ isRead: false });

    console.log('\n📊 Before cleanup:');
    console.log(`   Total: ${totalBefore}`);
    console.log(`   Read: ${readBefore}`);
    console.log(`   Unread: ${unreadBefore}`);

    // Delete read activities older than 7 days (from readAt)
    const readDeleteResult = await Activity.deleteMany({
      isRead: true,
      readAt: { $lt: readCutoffDate },
    });

    console.log(
      `\n🗑️  Deleted ${readDeleteResult.deletedCount} read activities (>7 days old from readAt)`
    );

    // Delete unread activities older than 30 days (from createdAt)
    const unreadDeleteResult = await Activity.deleteMany({
      isRead: false,
      createdAt: { $lt: unreadCutoffDate },
    });

    console.log(
      `🗑️  Deleted ${unreadDeleteResult.deletedCount} unread activities (>30 days old from createdAt)`
    );

    // Count activities after cleanup
    const totalAfter = await Activity.countDocuments();
    const readAfter = await Activity.countDocuments({ isRead: true });
    const unreadAfter = await Activity.countDocuments({ isRead: false });

    console.log('\n📊 After cleanup:');
    console.log(`   Total: ${totalAfter}`);
    console.log(`   Read: ${readAfter}`);
    console.log(`   Unread: ${unreadAfter}`);

    const totalDeleted = readDeleteResult.deletedCount + unreadDeleteResult.deletedCount;
    console.log(`\n✨ Cleanup complete! Deleted ${totalDeleted} total activities`);

    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run cleanup
cleanupActivities();
