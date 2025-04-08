import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

class ScreenshotPreventionService {
  constructor() {
    this.isEnabled = false;
  }

  // Enable screenshot prevention
  enablePrevention = async () => {
    if (Platform.OS === 'android') {
      try {
        // Prevent screen capture
        await ScreenCapture.preventScreenCaptureAsync();
        this.isEnabled = true;
        console.log('Screenshot prevention enabled');
      } catch (error) {
        console.error('Failed to enable screenshot prevention:', error);
      }
    }
  };

  // Disable screenshot prevention
  disablePrevention = async () => {
    if (Platform.OS === 'android') {
      try {
        // Allow screen capture
        await ScreenCapture.allowScreenCaptureAsync();
        this.isEnabled = false;
        console.log('Screenshot prevention disabled');
      } catch (error) {
        console.error('Failed to disable screenshot prevention:', error);
      }
    }
  };

  // Add screenshot attempt listener
  addScreenshotListener = (callback) => {
    if (Platform.OS === 'android') {
      return ScreenCapture.addScreenshotListener(callback);
    }
    return null;
  };

  // Check if prevention is currently enabled
  isPreventionEnabled = async () => {
    if (Platform.OS === 'android') {
      try {
        const status = await ScreenCapture.getPreventScreenCaptureAsync();
        return status;
      } catch (error) {
        console.error('Failed to get prevention status:', error);
        return false;
      }
    }
    return false;
  };
}

export default new ScreenshotPreventionService();