/**
 * Migration Script: Populate city/state for users with coordinates
 *
 * This script uses reverse geocoding to populate city and state fields
 * for users who have lat/lon coordinates but are missing city/state.
 *
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * Rate limited to 1 request per second per their usage policy.
 *
 * Usage:
 *   node scripts/populateLocationCityState.js [--dry-run] [--limit N]
 *
 * Options:
 *   --dry-run    Preview changes without writing to database
 *   --limit N    Only process first N users (for testing)
 */

const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

mongoose.connect(uri);

// Define minimal User schema for migration
const User = mongoose.model(
  'User',
  new mongoose.Schema({
    userId: String,
    userName: String,
    location: {
      lat: Number,
      lon: Number,
      city: String,
      state: String,
    },
  })
);

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null;

/**
 * Reverse geocode coordinates to get city and state
 * Uses OpenStreetMap Nominatim API (free, 1 req/sec limit)
 */
async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VibesApp/1.0 (location-migration-script)',
      },
    });

    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (!data.address) {
      console.error('No address data in response');
      return null;
    }

    // Extract city (try multiple fields as Nominatim varies by location)
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.municipality ||
      data.address.county ||
      null;

    // Extract state (or country for non-US locations)
    const state = data.address.state || data.address.region || data.address.country || null;

    return { city, state };
  } catch (error) {
    console.error(`Geocoding error: ${error.message}`);
    return null;
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function populateCityState() {
  console.log('='.repeat(60));
  console.log('Location Migration: Populate city/state from coordinates');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  if (limit) console.log(`Limit: ${limit} users`);
  console.log('');

  // Find users with coordinates but missing city OR state
  const query = {
    'location.lat': { $exists: true, $ne: null },
    'location.lon': { $exists: true, $ne: null },
    $or: [
      { 'location.city': { $exists: false } },
      { 'location.city': null },
      { 'location.city': '' },
      { 'location.state': { $exists: false } },
      { 'location.state': null },
      { 'location.state': '' },
    ],
  };

  let usersToUpdate = await User.find(query).select('userId userName location');

  if (limit) {
    usersToUpdate = usersToUpdate.slice(0, limit);
  }

  console.log(`Found ${usersToUpdate.length} users needing city/state population`);
  console.log('');

  if (usersToUpdate.length === 0) {
    console.log('No users to update. Exiting.');
    return;
  }

  // Show preview of users to update
  console.log('Users to process:');
  usersToUpdate.slice(0, 10).forEach((user) => {
    console.log(
      `  - ${user.userName} (${user.userId}): ${user.location.lat.toFixed(4)}, ${user.location.lon.toFixed(4)}`
    );
  });
  if (usersToUpdate.length > 10) {
    console.log(`  ... and ${usersToUpdate.length - 10} more`);
  }
  console.log('');

  let updated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < usersToUpdate.length; i++) {
    const user = usersToUpdate[i];
    const { lat, lon } = user.location;

    console.log(
      `[${i + 1}/${usersToUpdate.length}] Processing ${user.userName} (${lat.toFixed(4)}, ${lon.toFixed(4)})...`
    );

    // Rate limit: 1 request per second for Nominatim
    if (i > 0) {
      await sleep(1100);
    }

    const result = await reverseGeocode(lat, lon);

    if (!result) {
      console.log('  ❌ Failed to geocode');
      failed++;
      continue;
    }

    if (!result.city && !result.state) {
      console.log('  ⚠️  No city/state found in response');
      skipped++;
      continue;
    }

    console.log(`  📍 Found: ${result.city || '(no city)'}, ${result.state || '(no state)'}`);

    if (!dryRun) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            'location.city': result.city,
            'location.state': result.state,
          },
        }
      );
      console.log('  ✅ Updated');
    } else {
      console.log('  🔍 Would update (dry run)');
    }

    updated++;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total processed: ${usersToUpdate.length}`);
  console.log(`Updated: ${updated}`);
  console.log(`Failed: ${failed}`);
  console.log(`Skipped: ${skipped}`);
  if (dryRun) {
    console.log('');
    console.log('This was a DRY RUN. Run without --dry-run to apply changes.');
  }
}

// Run migration
populateCityState()
  .then(() => {
    console.log('');
    console.log('Migration complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
