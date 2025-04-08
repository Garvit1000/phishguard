import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        try {
          // Sign in with Firebase
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const { user } = userCredential;

          // Store user data in state
          const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || ''
          };

          // Save user ID for Firestore operations
          await AsyncStorage.setItem('userId', user.uid);

          set({ user: userData, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      signup: async (name, email, password) => {
        try {
          // Create user in Firebase
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const { user } = userCredential;

          // Update profile with name
          await updateProfile(user, { displayName: name });

          // Store user data in state
          const userData = {
            uid: user.uid,
            email: user.email,
            name: name
          };

          // Save user ID for Firestore operations
          await AsyncStorage.setItem('userId', user.uid);

          set({ user: userData, isAuthenticated: true });
          return true;
        } catch (error) {
          console.error('Signup error:', error);
          return false;
        }
      },
      
      logout: async () => {
        try {
          await signOut(auth);
          await AsyncStorage.removeItem('userId');
          set({ user: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);