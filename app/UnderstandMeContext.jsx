import React, { createContext, useState, useContext, useEffect } from "react";
import { useScreenshotPrevention } from "./ScreenshotPreventionContext";

const UnderstandMeContext = createContext();

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

  // Enable/disable screenshot prevention based on current module
  useEffect(() => {
    if (PROTECTED_ROUTES.includes(currentModule)) {
      enablePrevention();
      console.log(`Screenshot prevention enabled for module: ${currentModule}`);
    } else {
      disablePrevention();
      console.log('Screenshot prevention disabled');
    }

    return () => {
      disablePrevention();
    };
  }, [currentModule, enablePrevention, disablePrevention]);

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
        setCurrentModule,
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