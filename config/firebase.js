// config/firebase.js
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyDAI1CnnZ6SzXDCHZKZVOVi5kbnwlEBRoE",
    authDomain: "attendence-f20d2.firebaseapp.com",
    projectId: "attendence-f20d2",
    storageBucket: "attendence-f20d2.firebasestorage.app",
    messagingSenderId: "605402503960",
    appId: "1:605402503960:web:79a2af6b321abe8411dc6d"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get Firestore instance
const db = getFirestore(app);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { db, auth };