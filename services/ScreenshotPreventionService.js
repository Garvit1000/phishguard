import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

class ScreenshotPreventionService {
  constructor() {
    this.isEnabled = false;
    this.inTransition = false;
    this.lastProtectedRoute = null;
    this.transitionTimeoutId = null;
    this.retryAttempts = 0;
    this.initialize();
  }

  initialize = async () => {
    if (Platform.OS === 'android') {
      try {
        if (!ScreenCapture || typeof ScreenCapture.getPreventScreenCaptureAsync !== 'function') {
          console.warn('ScreenCapture module is not properly initialized');
          this.isEnabled = false;
          return;
        }
        const status = await ScreenCapture.getPreventScreenCaptureAsync();
        this.isEnabled = status;
        console.log('Screenshot prevention initialized:', status);
      } catch (error) {
        console.warn('Failed to initialize screenshot prevention:', error);
        this.isEnabled = false;
      }
    }
  };

  // Enable screenshot prevention with route tracking
  enablePrevention = async (routeName = null) => {
    if (Platform.OS === 'android') {
      try {
        this.inTransition = true;
        clearTimeout(this.transitionTimeoutId);
        
        // Store the route that requested prevention
        if (routeName) {
          this.lastProtectedRoute = routeName;
        }

        // Check if already enabled for current route
        const currentState = await this.isPreventionEnabled();
        if (currentState && this.isEnabled && this.lastProtectedRoute === routeName) {
          console.log('Screenshot prevention already enabled for:', this.lastProtectedRoute);
          this.inTransition = false;
          return true;
        }

        // Prevent screen capture with retry mechanism
        await this.retryOperation(async () => {
          await ScreenCapture.preventScreenCaptureAsync();
        }, 3);

        this.isEnabled = true;
        console.log('Screenshot prevention enabled for:', this.lastProtectedRoute);
        
        // Clear transition state after a delay
        this.transitionTimeoutId = setTimeout(() => {
          this.inTransition = false;
          this.retryAttempts = 0;
        }, 1000);
        
        return true;
      } catch (error) {
        console.error('Failed to enable screenshot prevention:', error);
        this.inTransition = false;
        throw error;
      }
    }
    return false;
  };

  // Disable screenshot prevention with route checking
  disablePrevention = async (routeName = null) => {
    if (Platform.OS === 'android') {
      try {
        // Don't disable if in transition or if route doesn't match
        if (this.inTransition || (routeName && this.lastProtectedRoute && routeName !== this.lastProtectedRoute)) {
          console.log('Prevention disable skipped:', {
            inTransition: this.inTransition,
            currentRoute: routeName,
            lastRoute: this.lastProtectedRoute
          });
          return true;
        }

        await ScreenCapture.allowScreenCaptureAsync();
        this.isEnabled = false;
        this.lastProtectedRoute = null;
        console.log('Screenshot prevention disabled');
        return true;
      } catch (error) {
        console.error('Failed to disable screenshot prevention:', error);
        throw error;
      }
    }
    return false;
  };

  // Add screenshot attempt listener with state verification
  addScreenshotListener = (callback) => {
    if (Platform.OS === 'android') {
      try {
        return ScreenCapture.addScreenshotListener(async () => {
          // Verify prevention is still active
          const isActive = await this.isPreventionEnabled();
          if (!isActive && this.isEnabled) {
            // Try to re-enable if it was disabled externally
            await this.enablePrevention(this.lastProtectedRoute);
          }
          callback();
        });
      } catch (error) {
        console.error('Failed to add screenshot listener:', error);
        return null;
      }
    }
    return null;
  };

  // Check prevention status with retry
  isPreventionEnabled = async () => {
    if (Platform.OS === 'android') {
      try {
        if (!ScreenCapture || typeof ScreenCapture.getPreventScreenCaptureAsync !== 'function') {
          console.warn('ScreenCapture module is not properly initialized');
          return this.isEnabled;
        }
        const status = await this.retryOperation(async () => {
          return await ScreenCapture.getPreventScreenCaptureAsync();
        }, 2);
        return status;
      } catch (error) {
        console.error('Failed to get prevention status:', error);
        return this.isEnabled; // Fall back to internal state
      }
    }
    return false;
  };

  // Retry operation with exponential backoff
  retryOperation = async (operation, maxRetries, attempt = 1) => {
    try {
      return await operation();
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryOperation(operation, maxRetries, attempt + 1);
      }
      throw error;
    }
  };
}

export default new ScreenshotPreventionService();