#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * VibesApp Monorepo Version Manager
 *
 * This script updates versions across all packages and files in the monorepo.
 * Usage: node scripts/update-version.js [patch|minor|major]
 */

const VERSION_TYPES = ['patch', 'minor', 'major'];
const ROOT_DIR = path.resolve(__dirname, '..');

// Files that contain version numbers to update
const VERSION_FILES = [
  // Package.json files
  'package.json',
  'apps/web/package.json',
  'apps/api/package.json',
  'libs/shared/package.json',
  'libs/contracts/package.json',
  'libs/e2e-testing/package.json',

  // Code files with hardcoded versions
  {
    file: 'apps/web/src/App.tsx',
    pattern: /const VERSION = ['"][^'"]+['"];/,
    replacement: (version) => `const VERSION = '${version}';`,
  },
  {
    file: 'libs/shared/src/lib/constants.ts',
    pattern: /VERSION: ['"][^'"]+['"],/,
    replacement: (version) => `VERSION: '${version}',`,
  },
  {
    file: 'README.md',
    pattern: /version-[^-]+-blue/,
    replacement: (version) => `version-${version}-blue`,
  },
];

function getVersionType() {
  const type = process.argv[2];
  if (!type || !VERSION_TYPES.includes(type)) {
    console.error(`❌ Invalid version type. Use one of: ${VERSION_TYPES.join(', ')}`);
    console.log('\nUsage:');
    console.log('  npm run version:patch   # 0.20.0 → 0.20.1');
    console.log('  npm run version:minor   # 0.20.0 → 0.21.0');
    console.log('  npm run version:major   # 0.20.0 → 1.0.0');
    process.exit(1);
  }
  return type;
}

function getCurrentVersion() {
  const packagePath = path.join(ROOT_DIR, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  return packageJson.version;
}

function incrementVersion(currentVersion, type) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Invalid version type: ${type}`);
  }
}

function updatePackageJson(filePath, newVersion) {
  const fullPath = path.join(ROOT_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const packageJson = JSON.parse(content);
    packageJson.version = newVersion;

    fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function updateVersionFile(fileConfig, newVersion) {
  const filePath = typeof fileConfig === 'string' ? fileConfig : fileConfig.file;
  const fullPath = path.join(ROOT_DIR, filePath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');

    if (typeof fileConfig === 'string') {
      // This is a package.json file, handle it separately
      return updatePackageJson(filePath, newVersion);
    } else {
      // This is a custom file with pattern matching
      const { pattern, replacement } = fileConfig;
      const newContent = content.replace(pattern, replacement(newVersion));

      if (newContent === content) {
        console.warn(`⚠️  No version pattern found in ${filePath}`);
        return false;
      }

      fs.writeFileSync(fullPath, newContent);
      console.log(`✅ Updated ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function regeneratePackageLock() {
  console.log('\n📦 Regenerating package-lock.json...');
  try {
    // Remove old package-lock.json and regenerate
    const lockPath = path.join(ROOT_DIR, 'package-lock.json');
    if (fs.existsSync(lockPath)) {
      fs.unlinkSync(lockPath);
    }

    // Reinstall to regenerate lock file with new version
    execSync('npm install', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env, SKIP_POSTINSTALL: 'true' },
    });
    console.log('✅ Package-lock.json regenerated');
  } catch (error) {
    console.error('❌ Error regenerating package-lock.json:', error.message);
  }
}

function commitChanges(newVersion, versionType) {
  console.log('\n🔍 Checking for git repository...');

  try {
    // Check if we're in a git repository
    execSync('git rev-parse --git-dir', { cwd: ROOT_DIR, stdio: 'pipe' });

    console.log('📝 Staging version changes...');
    execSync('git add .', { cwd: ROOT_DIR });

    console.log(`💾 Committing version ${newVersion}...`);
    const commitMessage = `chore: bump version to ${newVersion} (${versionType})`;
    execSync(`git commit -m "${commitMessage}"`, { cwd: ROOT_DIR });

    console.log(`🏷️  Creating tag v${newVersion}...`);
    execSync(`git tag v${newVersion}`, { cwd: ROOT_DIR });

    console.log('✅ Changes committed and tagged');
    console.log('\n📤 To push changes run:');
    console.log(`   git push && git push origin v${newVersion}`);
  } catch (error) {
    console.log('⚠️  Skipping git operations (not a git repository or git not available)');
  }
}

function main() {
  console.log('🚀 VibesApp Version Manager\n');

  const versionType = getVersionType();
  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, versionType);

  console.log(`📋 Current version: ${currentVersion}`);
  console.log(`📈 New version: ${newVersion} (${versionType})\n`);

  // Update all version files
  let successCount = 0;
  let totalFiles = 0;

  VERSION_FILES.forEach((fileConfig) => {
    totalFiles++;
    if (updateVersionFile(fileConfig, newVersion)) {
      successCount++;
    }
  });

  console.log(`\n📊 Updated ${successCount}/${totalFiles} files`);

  if (successCount > 0) {
    // Regenerate package-lock.json
    regeneratePackageLock();

    // Commit changes
    commitChanges(newVersion, versionType);

    console.log(`\n🎉 Version successfully updated to ${newVersion}!`);
  } else {
    console.log('\n❌ No files were updated. Please check for errors above.');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  getCurrentVersion,
  incrementVersion,
  updateVersionFile,
};
