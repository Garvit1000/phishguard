const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Cleaning up Expo project...');

try {
  // Remove node_modules
  console.log('Removing node_modules...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }

  // Remove package-lock.json if it exists
  console.log('Removing package-lock.json...');
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install expo-cli locally
  console.log('Installing expo-cli locally...');
  execSync('npm install --save-dev expo-cli', { stdio: 'inherit' });

  // Run the fix-dependencies script
  console.log('Running fix-dependencies script...');
  execSync('node fix-dependencies.js', { stdio: 'inherit' });

  console.log('Cleanup completed successfully!');
  console.log('\nTo start your app, use: npx expo start');
} catch (error) {
  console.error('Error during cleanup:', error.message);
} 