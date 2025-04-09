const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Performing complete Expo reset...');

try {
  // Remove global expo-cli if it exists
  console.log('Removing global expo-cli...');
  try {
    execSync('npm uninstall -g expo-cli', { stdio: 'inherit' });
  } catch (e) {
    console.log('No global expo-cli found or unable to remove it.');
  }

  // Clear npm cache
  console.log('Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

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

  // Remove .expo folder if it exists
  console.log('Removing .expo folder...');
  if (fs.existsSync('.expo')) {
    execSync('rm -rf .expo', { stdio: 'inherit' });
  }

  // Remove expo-cli from package.json
  console.log('Removing expo-cli from package.json...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.dependencies && packageJson.dependencies['expo-cli']) {
      delete packageJson.dependencies['expo-cli'];
    }
    if (packageJson.devDependencies && packageJson.devDependencies['expo-cli']) {
      delete packageJson.devDependencies['expo-cli'];
    }
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  } catch (e) {
    console.error('Error updating package.json:', e.message);
  }

  // Install dependencies fresh
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Install specific expo version
  console.log('Installing specific expo version...');
  execSync('npm install expo@latest', { stdio: 'inherit' });

  // Install and fix core dependencies
  console.log('Installing and fixing core dependencies...');
  execSync('npx expo install expo-modules-autolinking@~2.0.0 @expo/config-plugins@~9.0.0 @expo/prebuild-config@~8.0.0 @expo/metro-config@~0.19.0', { stdio: 'inherit' });

  // Install metro and related packages
  console.log('Installing metro and related packages...');
  execSync('npx expo install metro@^0.81.0 metro-resolver@^0.81.0 metro-config@^0.81.0', { stdio: 'inherit' });

  // Fix other dependencies
  console.log('Fixing other dependencies...');
  execSync('npx expo install react-native-svg@15.8.0 expo-file-system@~18.0.12 expo-image@~2.0.7 expo-location@~18.0.9 expo-system-ui@~4.0.9 react-native@0.76.8', { stdio: 'inherit' });

  // Add exclusions for problematic packages
  console.log('Adding exclusions for problematic packages...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!packageJson.expo) {
      packageJson.expo = {};
    }
    if (!packageJson.expo.doctor) {
      packageJson.expo.doctor = {};
    }
    if (!packageJson.expo.doctor.reactNativeDirectoryCheck) {
      packageJson.expo.doctor.reactNativeDirectoryCheck = {};
    }
    if (!packageJson.expo.doctor.reactNativeDirectoryCheck.exclude) {
      packageJson.expo.doctor.reactNativeDirectoryCheck.exclude = [];
    }
    
    // Add problematic packages to exclusion list
    const excludePackages = ['lucide-react-native', 'react-native-chart-kit'];
    for (const pkg of excludePackages) {
      if (!packageJson.expo.doctor.reactNativeDirectoryCheck.exclude.includes(pkg)) {
        packageJson.expo.doctor.reactNativeDirectoryCheck.exclude.push(pkg);
      }
    }
    
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  } catch (e) {
    console.error('Error updating package.json exclusions:', e.message);
  }

  console.log('\nReset completed successfully!');
  console.log('\nTo start your app, use: npx expo start');
} catch (error) {
  console.error('Error during reset:', error.message);
} 