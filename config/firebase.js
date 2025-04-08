// config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDAI1CnnZ6SzXDCHZKZVOVi5kbnwlEBRoE",
    authDomain: "attendence-f20d2.firebaseapp.com",
    projectId: "attendence-f20d2",
    storageBucket: "attendence-f20d2.firebasestorage.app",
    messagingSenderId: "605402503960",
    appId: "1:605402503960:web:79a2af6b321abe8411dc6d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };