/**
 * ============================================================================
 * VIBESAPP PROD DATABASE MIGRATION SCRIPT
 * Version: 2.0 - Web-V2 Schema Compatibility
 * ============================================================================
 *
 * PURPOSE:
 * Upgrades legacy prod database to Web-V2 compatible schema.
 * Adds missing fields, creates missing collections, and sets up indexes.
 *
 * USAGE:
 *   mongosh "mongodb+srv://..." --file migrate-prod-schema.js
 *   OR
 *   mongosh "mongodb://localhost:27017/vibesapp" --file migrate-prod-schema.js
 *
 * ⚠️  ALWAYS BACKUP YOUR DATABASE BEFORE RUNNING!
 *   mongodump --uri="your-connection-string" --out=./backup-before-migration
 *
 * ============================================================================
 */

print('');
print('╔════════════════════════════════════════════════════════════════════╗');
print('║       VIBESAPP PROD → WEB-V2 SCHEMA MIGRATION                      ║');
print('║       Version 2.0                                                   ║');
print('╚════════════════════════════════════════════════════════════════════╝');
print('');

const startTime = new Date();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function safeUpdateMany(collection, filter, update, description) {
  try {
    const result = db[collection].updateMany(filter, update);
    print('  ✓ ' + description + ': ' + result.modifiedCount + ' documents updated');
    return result;
  } catch (e) {
    print('  ✗ ERROR: ' + description + ' - ' + e.message);
    return null;
  }
}

function safeCreateIndex(collection, keys, options, description) {
  try {
    db[collection].createIndex(keys, options);
    print('  ✓ ' + description);
    return true;
  } catch (e) {
    if (e.message.includes('already exists')) {
      print('  ○ ' + description + ' (already exists)');
      return true;
    }
    print('  ✗ ERROR: ' + description + ' - ' + e.message);
    return false;
  }
}

function collectionExists(name) {
  return db.getCollectionNames().includes(name);
}

// ============================================================================
// SECTION 1: USERS COLLECTION
// Add all missing fields required by User.js model
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 1: USERS COLLECTION');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const totalUsers = db.users.countDocuments({});
print('  Total users in database: ' + totalUsers);
print('');

// 1.1 Add isBanned (Boolean, default: false)
safeUpdateMany(
  'users',
  { isBanned: { $exists: false } },
  { $set: { isBanned: false } },
  'Added isBanned field'
);

// 1.2 Add isDeleted (Boolean, default: false)
safeUpdateMany(
  'users',
  { isDeleted: { $exists: false } },
  { $set: { isDeleted: false } },
  'Added isDeleted field'
);

// 1.3 Add bannedAt (Date, default: null)
safeUpdateMany(
  'users',
  { bannedAt: { $exists: false } },
  { $set: { bannedAt: null } },
  'Added bannedAt field'
);

// 1.4 Add deletedAt (Date, default: null)
safeUpdateMany(
  'users',
  { deletedAt: { $exists: false } },
  { $set: { deletedAt: null } },
  'Added deletedAt field'
);

// 1.5 Add strikes array (Phase 3.4 moderation)
safeUpdateMany(
  'users',
  { strikes: { $exists: false } },
  { $set: { strikes: [] } },
  'Added strikes array'
);

// 1.6 Add profilePictureUrl (String, optional)
safeUpdateMany(
  'users',
  { profilePictureUrl: { $exists: false } },
  { $set: { profilePictureUrl: null } },
  'Added profilePictureUrl field'
);

// 1.7 Add bio (String, optional)
safeUpdateMany('users', { bio: { $exists: false } }, { $set: { bio: null } }, 'Added bio field');

// 1.8 Add notificationPreferences (Object with defaults)
safeUpdateMany(
  'users',
  { notificationPreferences: { $exists: false } },
  {
    $set: {
      notificationPreferences: {
        new_follower: true,
        following_post: true,
        nearby_post: true,
        comment: true,
        comment_reply: true,
        post_hidden: true,
        reactions: true,
      },
    },
  },
  'Added notificationPreferences'
);

// 1.9 Add createdAt - CRITICAL: Derive from _id timestamp or lastActiveAt
// MongoDB ObjectId contains creation timestamp in first 4 bytes
print('');
print('  Adding createdAt field (derived from ObjectId timestamp)...');

db.users.aggregate([
  { $match: { createdAt: { $exists: false } } },
  {
    $addFields: {
      createdAt: {
        $cond: {
          if: { $ne: [{ $type: '$_id' }, 'objectId'] },
          then: { $ifNull: ['$lastActiveAt', new Date()] },
          else: { $toDate: '$_id' }, // Extract timestamp from ObjectId
        },
      },
    },
  },
  { $merge: { into: 'users', whenMatched: 'merge' } },
]);

const usersWithCreatedAt = db.users.countDocuments({ createdAt: { $exists: true } });
print(
  '  ✓ Added createdAt field: ' +
    usersWithCreatedAt +
    '/' +
    totalUsers +
    ' users now have createdAt'
);

// 1.10 Add location.city and location.state if missing
safeUpdateMany(
  'users',
  { 'location.city': { $exists: false } },
  { $set: { 'location.city': null, 'location.state': null } },
  'Added location.city and location.state'
);

// ============================================================================
// SECTION 2: POSTS COLLECTION
// Add all missing fields required by Post.js model
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 2: POSTS COLLECTION');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const totalPosts = db.posts.countDocuments({});
print('  Total posts in database: ' + totalPosts);
print('');

// 2.1 Add isDeleted (Boolean, default: false, REQUIRED)
safeUpdateMany(
  'posts',
  { isDeleted: { $exists: false } },
  { $set: { isDeleted: false } },
  'Added isDeleted field'
);

// 2.2 Add isHidden (Boolean, default: false, REQUIRED)
safeUpdateMany(
  'posts',
  { isHidden: { $exists: false } },
  { $set: { isHidden: false } },
  'Added isHidden field'
);

// 2.3 Add hiddenAt (Date, default: null)
safeUpdateMany(
  'posts',
  { hiddenAt: { $exists: false } },
  { $set: { hiddenAt: null } },
  'Added hiddenAt field'
);

// 2.4 Add hiddenBy (String enum: 'auto', 'admin', null)
safeUpdateMany(
  'posts',
  { hiddenBy: { $exists: false } },
  { $set: { hiddenBy: null } },
  'Added hiddenBy field'
);

// 2.5 Add hiddenForUsers array (user IDs who reported this post)
safeUpdateMany(
  'posts',
  { hiddenForUsers: { $exists: false } },
  { $set: { hiddenForUsers: [] } },
  'Added hiddenForUsers array'
);

// 2.6 Add reports array (Phase 3.4 community moderation)
safeUpdateMany(
  'posts',
  { reports: { $exists: false } },
  { $set: { reports: [] } },
  'Added reports array'
);

// 2.7 Add commentOn (ObjectId ref to parent post for comments)
safeUpdateMany(
  'posts',
  { commentOn: { $exists: false } },
  { $set: { commentOn: null } },
  'Added commentOn field'
);

// 2.8 Add replyToCommentId (ObjectId ref for nested comment replies)
safeUpdateMany(
  'posts',
  { replyToCommentId: { $exists: false } },
  { $set: { replyToCommentId: null } },
  'Added replyToCommentId field'
);

// 2.9 Ensure proximal fields have defaults
safeUpdateMany(
  'posts',
  { proximal_likes: { $exists: false } },
  { $set: { proximal_likes: 0 } },
  'Added proximal_likes default'
);

safeUpdateMany(
  'posts',
  { proximal_dislikes: { $exists: false } },
  { $set: { proximal_dislikes: 0 } },
  'Added proximal_dislikes default'
);

safeUpdateMany(
  'posts',
  { proximal_users: { $exists: false } },
  { $set: { proximal_users: 0 } },
  'Added proximal_users default'
);

// 2.10 Add user.profilePictureUrl to embedded user docs if missing
safeUpdateMany(
  'posts',
  { 'user.profilePictureUrl': { $exists: false } },
  { $set: { 'user.profilePictureUrl': null } },
  'Added user.profilePictureUrl to embedded users'
);

// 2.11 Add user.userName if missing (required field!)
// Check for posts with missing userName in embedded user
const postsWithMissingUserName = db.posts.countDocuments({
  'user.userName': { $exists: false },
});
if (postsWithMissingUserName > 0) {
  print('  ⚠ WARNING: ' + postsWithMissingUserName + ' posts have missing user.userName');
  print('    Attempting to backfill from users collection...');

  db.posts.aggregate([
    { $match: { 'user.userName': { $exists: false } } },
    {
      $lookup: {
        from: 'users',
        localField: 'user.userId',
        foreignField: 'userId',
        as: 'userLookup',
      },
    },
    { $unwind: { path: '$userLookup', preserveNullAndEmptyArrays: true } },
    {
      $set: {
        'user.userName': { $ifNull: ['$userLookup.userName', 'Unknown'] },
      },
    },
    { $unset: 'userLookup' },
    { $merge: { into: 'posts', whenMatched: 'merge' } },
  ]);

  print('  ✓ Backfilled missing user.userName from users collection');
}

// ============================================================================
// SECTION 3: CONVERSATIONS COLLECTION
// Add readCursors for Phase 4.6 read tracking
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 3: CONVERSATIONS COLLECTION');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const totalConversations = db.conversations.countDocuments({});
print('  Total conversations in database: ' + totalConversations);
print('');

// 3.1 Add readCursors Map (CRITICAL for unread message tracking)
// Initialize with empty object - will be populated as users read messages
safeUpdateMany(
  'conversations',
  { readCursors: { $exists: false } },
  { $set: { readCursors: {} } },
  'Added readCursors field'
);

// 3.2 Ensure all messages have readBy array
db.conversations.updateMany(
  { 'messages.readBy': { $exists: false } },
  { $set: { 'messages.$[].readBy': [] } }
);
print('  ✓ Ensured messages have readBy arrays');

// 3.3 Add updatedAt if missing
safeUpdateMany(
  'conversations',
  { updatedAt: { $exists: false } },
  [{ $set: { updatedAt: { $ifNull: ['$createdAt', new Date()] } } }],
  'Added updatedAt field'
);

// ============================================================================
// SECTION 4: CREATE MISSING COLLECTIONS
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 4: CREATE MISSING COLLECTIONS');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('');

// 4.1 Activities collection (unified notifications)
if (!collectionExists('activities')) {
  db.createCollection('activities');
  print('  ✓ Created activities collection');
} else {
  print(
    '  ○ activities collection already exists (' + db.activities.countDocuments({}) + ' documents)'
  );
}

// 4.2 DMRequests collection (DM request flow)
if (!collectionExists('dmrequests')) {
  db.createCollection('dmrequests');
  print('  ✓ Created dmrequests collection');
} else {
  print(
    '  ○ dmrequests collection already exists (' + db.dmrequests.countDocuments({}) + ' documents)'
  );
}

// 4.3 Follows collection (following/watchers system)
if (!collectionExists('follows')) {
  db.createCollection('follows');
  print('  ✓ Created follows collection');
} else {
  print('  ○ follows collection already exists (' + db.follows.countDocuments({}) + ' documents)');
}

// 4.4 Settings collection (app configuration)
if (!collectionExists('settings')) {
  db.createCollection('settings');
  // Insert default settings document
  db.settings.insertOne({
    _id: 'app_settings',
    reportThreshold: 3,
    notificationEmail: 'admin@vibesapp.com',
    updatedAt: new Date(),
    updatedBy: 'migration_script',
  });
  print('  ✓ Created settings collection with defaults');
} else {
  print('  ○ settings collection already exists');
}

// ============================================================================
// SECTION 5: CREATE INDEXES
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 5: CREATE INDEXES');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('');

// USERS indexes
print('  Users collection:');
safeCreateIndex(
  'users',
  { pigeonId: 1 },
  { unique: true, background: true },
  'pigeonId unique index'
);
safeCreateIndex('users', { userId: 1 }, { unique: true, background: true }, 'userId unique index');
safeCreateIndex(
  'users',
  { 'location.lat': 1, 'location.lon': 1 },
  { background: true },
  'location geospatial index'
);

// POSTS indexes
print('');
print('  Posts collection:');
safeCreateIndex('posts', { 'user.userId': 1 }, { background: true }, 'user.userId index');
safeCreateIndex('posts', { createdAt: -1 }, { background: true }, 'createdAt descending index');
safeCreateIndex(
  'posts',
  { isDeleted: 1, isHidden: 1 },
  { background: true },
  'isDeleted + isHidden compound index'
);
safeCreateIndex(
  'posts',
  { commentOn: 1 },
  { background: true, sparse: true },
  'commentOn index (sparse)'
);
safeCreateIndex(
  'posts',
  { replyTo: 1 },
  { background: true, sparse: true },
  'replyTo index (sparse)'
);

// CONVERSATIONS indexes
print('');
print('  Conversations collection:');
safeCreateIndex(
  'conversations',
  { user1Id: 1, user2Id: 1 },
  { background: true },
  'user1Id + user2Id compound index'
);
safeCreateIndex('conversations', { status: 1 }, { background: true }, 'status index');
safeCreateIndex(
  'conversations',
  { updatedAt: -1 },
  { background: true },
  'updatedAt descending index'
);

// ACTIVITIES indexes
print('');
print('  Activities collection:');
safeCreateIndex(
  'activities',
  { recipientId: 1, createdAt: -1 },
  { background: true },
  'recipientId + createdAt compound index'
);
safeCreateIndex(
  'activities',
  { recipientId: 1, isRead: 1 },
  { background: true },
  'recipientId + isRead compound index'
);
safeCreateIndex('activities', { type: 1 }, { background: true }, 'type index');

// DMREQUESTS indexes
print('');
print('  DMRequests collection:');
safeCreateIndex('dmrequests', { sender: 1 }, { background: true }, 'sender index');
safeCreateIndex('dmrequests', { recipient: 1 }, { background: true }, 'recipient index');
safeCreateIndex(
  'dmrequests',
  { recipient: 1, status: 1 },
  { background: true },
  'recipient + status compound index'
);
safeCreateIndex(
  'dmrequests',
  { sender: 1, recipient: 1 },
  { background: true },
  'sender + recipient compound index'
);

// FOLLOWS indexes
print('');
print('  Follows collection:');
safeCreateIndex('follows', { follower: 1 }, { background: true }, 'follower index');
safeCreateIndex('follows', { following: 1 }, { background: true }, 'following index');
safeCreateIndex(
  'follows',
  { follower: 1, following: 1 },
  { unique: true, background: true },
  'follower + following unique compound index'
);

// ============================================================================
// SECTION 6: DATA INTEGRITY CHECKS
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 6: DATA INTEGRITY CHECKS');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('');

// Check for users without required fields
const usersWithoutPigeonId = db.users.countDocuments({ pigeonId: { $exists: false } });
if (usersWithoutPigeonId > 0) {
  print('  ⚠ WARNING: ' + usersWithoutPigeonId + ' users missing pigeonId (cannot authenticate!)');
} else {
  print('  ✓ All users have pigeonId');
}

const usersWithoutLocation = db.users.countDocuments({ 'location.lat': { $exists: false } });
if (usersWithoutLocation > 0) {
  print('  ⚠ WARNING: ' + usersWithoutLocation + ' users missing location');
} else {
  print('  ✓ All users have location');
}

// Check for posts without required fields
const postsWithoutUser = db.posts.countDocuments({ user: { $exists: false } });
if (postsWithoutUser > 0) {
  print('  ⚠ WARNING: ' + postsWithoutUser + ' posts missing user field');
} else {
  print('  ✓ All posts have user field');
}

const postsWithoutImage = db.posts.countDocuments({
  image: { $exists: false },
  commentOn: null,
  replyTo: null,
});
if (postsWithoutImage > 0) {
  print('  ○ ' + postsWithoutImage + ' top-level posts without images (may be intentional)');
}

// Check conversations without messages
const emptyConversations = db.conversations.countDocuments({
  $or: [{ messages: { $exists: false } }, { messages: { $size: 0 } }],
});
print('  ○ ' + emptyConversations + ' conversations with no messages');

// ============================================================================
// SECTION 7: FINAL VERIFICATION
// ============================================================================

print('');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('  SECTION 7: FINAL VERIFICATION');
print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
print('');

// Users verification
const finalUserCheck = {
  total: db.users.countDocuments({}),
  withIsBanned: db.users.countDocuments({ isBanned: { $exists: true } }),
  withIsDeleted: db.users.countDocuments({ isDeleted: { $exists: true } }),
  withStrikes: db.users.countDocuments({ strikes: { $exists: true } }),
  withCreatedAt: db.users.countDocuments({ createdAt: { $exists: true } }),
  withNotifPrefs: db.users.countDocuments({ notificationPreferences: { $exists: true } }),
};

print('  USERS:');
print('    Total: ' + finalUserCheck.total);
print(
  '    With isBanned: ' +
    finalUserCheck.withIsBanned +
    ' (' +
    Math.round((finalUserCheck.withIsBanned / finalUserCheck.total) * 100) +
    '%)'
);
print(
  '    With isDeleted: ' +
    finalUserCheck.withIsDeleted +
    ' (' +
    Math.round((finalUserCheck.withIsDeleted / finalUserCheck.total) * 100) +
    '%)'
);
print(
  '    With strikes: ' +
    finalUserCheck.withStrikes +
    ' (' +
    Math.round((finalUserCheck.withStrikes / finalUserCheck.total) * 100) +
    '%)'
);
print(
  '    With createdAt: ' +
    finalUserCheck.withCreatedAt +
    ' (' +
    Math.round((finalUserCheck.withCreatedAt / finalUserCheck.total) * 100) +
    '%)'
);
print(
  '    With notificationPreferences: ' +
    finalUserCheck.withNotifPrefs +
    ' (' +
    Math.round((finalUserCheck.withNotifPrefs / finalUserCheck.total) * 100) +
    '%)'
);

// Posts verification
const finalPostCheck = {
  total: db.posts.countDocuments({}),
  withIsDeleted: db.posts.countDocuments({ isDeleted: { $exists: true } }),
  withIsHidden: db.posts.countDocuments({ isHidden: { $exists: true } }),
  withReports: db.posts.countDocuments({ reports: { $exists: true } }),
  withHiddenForUsers: db.posts.countDocuments({ hiddenForUsers: { $exists: true } }),
};

print('');
print('  POSTS:');
print('    Total: ' + finalPostCheck.total);
print(
  '    With isDeleted: ' +
    finalPostCheck.withIsDeleted +
    ' (' +
    Math.round((finalPostCheck.withIsDeleted / finalPostCheck.total) * 100) +
    '%)'
);
print(
  '    With isHidden: ' +
    finalPostCheck.withIsHidden +
    ' (' +
    Math.round((finalPostCheck.withIsHidden / finalPostCheck.total) * 100) +
    '%)'
);
print(
  '    With reports: ' +
    finalPostCheck.withReports +
    ' (' +
    Math.round((finalPostCheck.withReports / finalPostCheck.total) * 100) +
    '%)'
);
print(
  '    With hiddenForUsers: ' +
    finalPostCheck.withHiddenForUsers +
    ' (' +
    Math.round((finalPostCheck.withHiddenForUsers / finalPostCheck.total) * 100) +
    '%)'
);

// Conversations verification
const finalConvCheck = {
  total: db.conversations.countDocuments({}),
  withReadCursors: db.conversations.countDocuments({ readCursors: { $exists: true } }),
};

print('');
print('  CONVERSATIONS:');
print('    Total: ' + finalConvCheck.total);
print(
  '    With readCursors: ' +
    finalConvCheck.withReadCursors +
    ' (' +
    (finalConvCheck.total > 0
      ? Math.round((finalConvCheck.withReadCursors / finalConvCheck.total) * 100)
      : 0) +
    '%)'
);

// Collections summary
print('');
print('  COLLECTIONS:');
print('    activities: ' + db.activities.countDocuments({}) + ' documents');
print('    dmrequests: ' + db.dmrequests.countDocuments({}) + ' documents');
print('    follows: ' + db.follows.countDocuments({}) + ' documents');
print('    settings: ' + db.settings.countDocuments({}) + ' documents');

// ============================================================================
// COMPLETE
// ============================================================================

const endTime = new Date();
const duration = (endTime - startTime) / 1000;

print('');
print('╔════════════════════════════════════════════════════════════════════╗');
print('║       MIGRATION COMPLETE                                           ║');
print('╠════════════════════════════════════════════════════════════════════╣');
print('║  Duration: ' + duration.toFixed(2) + ' seconds');
print('║                                                                    ║');
print('║  Next steps:                                                       ║');
print('║  1. Review warnings above (if any)                                 ║');
print('║  2. Test the application against this database                     ║');
print('║  3. Run E2E tests to verify functionality                          ║');
print('║  4. Monitor logs for any schema-related errors                     ║');
print('╚════════════════════════════════════════════════════════════════════╝');
print('');
