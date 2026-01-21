#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Generate new cache version based on current timestamp
const newVersion = `${Math.floor(Date.now() / 1000)}`;
const swPath = path.join(__dirname, 'public', 'sw.js');

console.log('🚀 Starting Firebase deployment...');
console.log(`📦 Updating cache version to: ${newVersion}`);

// Read current service worker
let swContent = fs.readFileSync(swPath, 'utf8');

// Update cache version
const versionRegex = /const CACHE_VERSION = '[^']+'/;
swContent = swContent.replace(versionRegex, `const CACHE_VERSION = '${newVersion}'`);

// Write updated service worker
fs.writeFileSync(swPath, swContent);
console.log('✅ Service worker cache version updated');

try {
  // Build the project
  console.log('🔨 Building project...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Deploy to Firebase
  console.log('☁️  Deploying to Firebase...');
  execSync('firebase deploy', { stdio: 'inherit' });
  
  console.log('🎉 Deployment successful!');
  console.log(`📱 Users will be prompted to update to version ${newVersion}`);
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}