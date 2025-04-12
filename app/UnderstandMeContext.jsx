import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useScreenshotPrevention } from "./ScreenshotPreventionContext";
import { Alert } from "react-native";

const UnderstandMeContext = createContext();

// Debounce helper
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// List of routes where screenshot prevention should be enabled
const PROTECTED_ROUTES = [
  "module-one",
  "module-two",
  "module-three",
  "module-four"
];

function UnderstandMeProvider({ children }) {
  const [moduleOneAnswers, setModuleOneAnswers] = useState({});
  const [moduleTwoAnswers, setModuleTwoAnswers] = useState({});
  const [moduleThreeAnswers, setModuleThreeAnswers] = useState({});
  const [moduleFourAnswers, setModuleFourAnswers] = useState({});
  const [currentModule, setCurrentModule] = useState(null);
  const [moduleOneQuestions, setModuleOneQuestions] = useState([]);
  const [moduleTwoQuestions, setModuleTwoQuestions] = useState([]);
  const [moduleThreeQuestions, setModuleThreeQuestions] = useState([]);
  const [moduleFourQuestions, setModuleFourQuestions] = useState([]);
  
  const { enablePrevention, disablePrevention } = useScreenshotPrevention();

  // Debounced module state updater
  const debouncedSetCurrentModule = useCallback(
    debounce((module) => {
      setCurrentModule(module);
    }, 300),
    []
  );

  // Enable/disable screenshot prevention based on current module
  useEffect(() => {
    let isMounted = true;
    
    const updatePrevention = async () => {
      try {
        if (PROTECTED_ROUTES.includes(currentModule)) {
          await enablePrevention(currentModule);
        } else if (currentModule === null) {
          // Only disable if explicitly set to null (not during transitions)
          await disablePrevention(currentModule);
        }
      } catch (error) {
        console.error('Failed to update screenshot prevention:', error);
        if (isMounted) {
          Alert.alert(
            'Security Notice',
            'Unable to enable security features. Please restart the application.'
          );
        }
      }
    };

    updatePrevention();

    return () => {
      isMounted = false;
      // Don't disable prevention in cleanup unless component is unmounting
      if (!PROTECTED_ROUTES.includes(currentModule)) {
        disablePrevention(currentModule);
      }
    };
  }, [currentModule, enablePrevention, disablePrevention]);

  const safeSetCurrentModule = useCallback((module) => {
    if (PROTECTED_ROUTES.includes(module) || module === null) {
      debouncedSetCurrentModule(module);
    } else {
      setCurrentModule(module);
    }
  }, [debouncedSetCurrentModule]);

  return (
    <UnderstandMeContext.Provider
      value={{
        moduleOneAnswers,
        setModuleOneAnswers,
        moduleTwoAnswers,
        setModuleTwoAnswers,
        moduleThreeAnswers,
        setModuleThreeAnswers,
        moduleFourAnswers,
        setModuleFourAnswers,
        currentModule,
        setCurrentModule: safeSetCurrentModule,
        moduleOneQuestions,
        setModuleOneQuestions,
        moduleTwoQuestions,
        setModuleTwoQuestions,
        moduleThreeQuestions,
        setModuleThreeQuestions,
        moduleFourQuestions,
        setModuleFourQuestions,
      }}
    >
      {children}
    </UnderstandMeContext.Provider>
  );
}

export const useUnderstandMeContext = () => {
  const context = useContext(UnderstandMeContext);
  if (!context) {
    throw new Error("useUnderstandMeContext must be used within a UnderstandMeProvider");
  }
  return context;
};

export { UnderstandMeProvider };
export default UnderstandMeProvider;