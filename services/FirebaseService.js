import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';

class FirebaseService {
  static async saveTestResults(userId, results) {
    const userDoc = doc(db, 'users', userId);
    const resultsDoc = doc(collection(userDoc, 'test_results'), 'understand_me');
    
    await setDoc(resultsDoc, {
      moduleOne: results.moduleOne || {},
      moduleTwo: results.moduleTwo || {},
      moduleThree: results.moduleThree || {},
      moduleFour: results.moduleFour || {},
      scores: {
        Report: results.scores.Report,
        Behavior: results.scores.Behavior,
        Cognition: results.scores.Cognition,
        Risk: results.scores.Risk
      },
      timestamp: new Date().toISOString()
    });

    return true;
  }

  static async getTestResults(userId) {
    const userDoc = doc(db, 'users', userId);
    const resultsDoc = doc(collection(userDoc, 'test_results'), 'understand_me');
    const results = await getDoc(resultsDoc);

    if (!results.exists()) {
      return null;
    }

    return results.data();
  }

  static async getTrainingHistory(userId) {
    const userDoc = doc(db, 'users', userId);
    const historyDoc = doc(collection(userDoc, 'training'), 'history');
    const history = await getDoc(historyDoc);

    if (!history.exists()) {
      return { sessions: [] };
    }

    return history.data();
  }

  static async saveTrainingSession(userId, session) {
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
  }
}

export default FirebaseService;