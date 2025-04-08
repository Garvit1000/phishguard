import React, { createContext, useContext, useEffect, useState } from 'react';
import ScreenshotPreventionService from '../services/ScreenshotPreventionService';
import * as Haptics from 'expo-haptics';

const ScreenshotPreventionContext = createContext({
  isPreventionEnabled: false,
  enablePrevention: () => {},
  disablePrevention: () => {},
});

export const ScreenshotPreventionProvider = ({ children }) => {
  const [isPreventionEnabled, setIsPreventionEnabled] = useState(false);

  // Function to enable screenshot prevention
  const enablePrevention = async () => {
    await ScreenshotPreventionService.enablePrevention();
    setIsPreventionEnabled(true);
  };

  // Function to disable screenshot prevention
  const disablePrevention = async () => {
    await ScreenshotPreventionService.disablePrevention();
    setIsPreventionEnabled(false);
  };

  useEffect(() => {
    // Set up screenshot attempt listener
    const subscription = ScreenshotPreventionService.addScreenshotListener(() => {
      // Trigger haptic feedback on screenshot attempt
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      console.log('Screenshot attempt detected');
    });

    // Clean up listener on unmount
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return (
    <ScreenshotPreventionContext.Provider
      value={{
        isPreventionEnabled,
        enablePrevention,
        disablePrevention,
      }}
    >
      {children}
    </ScreenshotPreventionContext.Provider>
  );
};

// Custom hook to use screenshot prevention
export const useScreenshotPrevention = () => {
  const context = useContext(ScreenshotPreventionContext);
  if (!context) {
    throw new Error('useScreenshotPrevention must be used within a ScreenshotPreventionProvider');
  }
  return context;
};