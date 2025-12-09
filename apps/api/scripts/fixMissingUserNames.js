/**
 * Emergency Fix: Add userName to posts missing it
 * This fixes the production issue where posts don't show user names
 */

const mongoose = require('mongoose');

const uri =
  process.env.MONGO_URI ||
  'mongodb+srv://logosilappuser:logosilappsimplepassword@cluster0.2xkguvj.mongodb.net/prod?retryWrites=true&w=majority';

async function fixMissingUserNames() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('Connected successfully');

    const Post = mongoose.model('Post', new mongoose.Schema({}, { strict: false }), 'posts');
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');

    // Find ALL posts missing userName
    const totalMissing = await Post.countDocuments({ 'user.userName': { $exists: false } });
    console.log(`Total posts missing userName: ${totalMissing}`);

    if (totalMissing === 0) {
      console.log('✅ All posts have userName!');
      process.exit(0);
    }

    const posts = await Post.find({ 'user.userName': { $exists: false } });
    let updated = 0;
    let errors = 0;

    for (const post of posts) {
      try {
        const user = await User.findOne({ userId: post.user.userId });
        if (user && user.userName) {
          await Post.updateOne({ _id: post._id }, { $set: { 'user.userName': user.userName } });
          updated++;
          if (updated % 50 === 0) {
            console.log(`Progress: ${updated} posts updated...`);
          }
        } else {
          console.warn(`⚠️  User not found for post ${post._id} (userId: ${post.user.userId})`);
          errors++;
        }
      } catch (err) {
        console.error(`Error processing post ${post._id}:`, err.message);
        errors++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated: ${updated} posts`);
    console.log(`   Errors: ${errors} posts`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

fixMissingUserNames();
