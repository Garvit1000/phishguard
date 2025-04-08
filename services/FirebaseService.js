import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

class FirebaseService {
  // Save user's understand-me test results
  static async saveTestResults(userId, results) {
    try {
      const userDoc = doc(db, 'users', userId);
      const resultsDoc = doc(collection(userDoc, 'test_results'), 'understand_me');
      
      await setDoc(resultsDoc, {
        moduleOne: results.moduleOne,
        moduleTwo: results.moduleTwo,
        moduleThree: results.moduleThree,
        scores: {
          personality: results.scores.personality,
          phishing: results.scores.phishing,
          behavior: results.scores.behavior
        },
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error saving test results:', error);
      return false;
    }
  }

  // Get user's understand-me test results
  static async getTestResults(userId) {
    try {
      const userDoc = doc(db, 'users', userId);
      const resultsDoc = doc(collection(userDoc, 'test_results'), 'understand_me');
      const results = await getDoc(resultsDoc);

      if (results.exists()) {
        return results.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting test results:', error);
      return null;
    }
  }

  // Get training history
  static async getTrainingHistory(userId) {
    try {
      const userDoc = doc(db, 'users', userId);
      const historyDoc = doc(collection(userDoc, 'training'), 'history');
      const history = await getDoc(historyDoc);

      if (history.exists()) {
        return history.data();
      }

      return null;
    } catch (error) {
      console.error('Error getting training history:', error);
      return null;
    }
  }

  // Save training session
  static async saveTrainingSession(userId, session) {
    try {
      const userDoc = doc(db, 'users', userId);
      const historyDoc = doc(collection(userDoc, 'training'), 'history');
      
      const currentHistory = await getDoc(historyDoc);
      const sessions = currentHistory.exists() ? currentHistory.data().sessions || [] : [];

      sessions.push({
        ...session,
        timestamp: new Date().toISOString()
      });

      await setDoc(historyDoc, {
        sessions: sessions.slice(-10) // Keep only last 10 sessions
      });

      return true;
    } catch (error) {
      console.error('Error saving training session:', error);
      return false;
    }
  }
}

export default FirebaseService;