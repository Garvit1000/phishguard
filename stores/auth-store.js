import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      const userData = {
        uid: user.uid,
        email: user.email,
        name: user.displayName || ''
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },
  
  signup: async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      await updateProfile(user, { displayName: name });

      const userData = {
        uid: user.uid,
        email: user.email,
        name: name
      };

      await AsyncStorage.setItem('user', JSON.stringify(userData));
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
      await AsyncStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Initialize auth state
  initAuth: () => {
    console.log('Setting up Firebase auth listener');
    
    // Try to restore user from storage
    AsyncStorage.getItem('user')
      .then(storedUser => {
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          set({ user: userData, isAuthenticated: true });
        }
      })
      .catch(error => {
        console.error('Error restoring user:', error);
      });

    // Set up Firebase auth listener
    return auth.onAuthStateChanged((user) => {
      console.log('Firebase auth state changed:', user ? 'logged in' : 'logged out');
      
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || ''
        };
        AsyncStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: true });
      } else {
        AsyncStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      }
    });
  }
}));