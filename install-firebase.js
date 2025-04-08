const { execSync } = require('child_process');

console.log('Installing Firebase dependencies...');

const dependencies = [
  'firebase',
  '@react-native-firebase/app',
  '@react-native-firebase/firestore',
  '@react-native-firebase/auth'
];

try {
  dependencies.forEach(dep => {
    console.log(`Installing ${dep}...`);
    execSync(`npm install ${dep} --save`, { stdio: 'inherit' });
  });

  console.log('\nFirebase dependencies installed successfully!');
  console.log('\nNext steps:');
  console.log('1. Add your Firebase configuration in config/firebase.js');
  console.log('2. Initialize Firebase in your app');
  console.log('3. Test the authentication and Firestore functionality');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
  process.exit(1);
}