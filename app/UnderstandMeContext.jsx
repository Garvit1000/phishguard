import React, { createContext, useState, useContext } from "react";

const UnderstandMeContext = createContext();

function UnderstandMeProvider({ children }) {
  const [moduleOneAnswers, setModuleOneAnswers] = useState({});
  const [moduleTwoAnswers, setModuleTwoAnswers] = useState({});
  const [moduleThreeAnswers, setModuleThreeAnswers] = useState({});

  return (
    <UnderstandMeContext.Provider
      value={{
        moduleOneAnswers,
        setModuleOneAnswers,
        moduleTwoAnswers,
        setModuleTwoAnswers,
        moduleThreeAnswers,
        setModuleThreeAnswers,
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