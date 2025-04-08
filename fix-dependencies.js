const { execSync } = require('child_process');

// List of packages to update with their required versions
const packagesToUpdate = [
  'expo-file-system@~18.0.12',
  'expo-image@~2.0.7',
  'expo-location@~18.0.9',
  'expo-system-ui@~4.0.9',
  'react-native@0.76.8',
  'react-native-svg@15.8.0'
];

console.log('Updating dependencies to compatible versions...');

try {
  // Install all packages at once
  execSync(`npx expo install ${packagesToUpdate.join(' ')}`, { stdio: 'inherit' });
  console.log('All dependencies updated successfully!');
} catch (error) {
  console.error('Error updating dependencies:', error.message);
} 