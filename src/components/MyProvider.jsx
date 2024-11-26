import AuthenticationService from "../service/AuthenticationService";
import React, { useState, useEffect, createContext } from "react";

export const MContext = createContext();

const MyProvider = ({ children }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const isLoggedIn = AuthenticationService.isUserLoggedIn();
    setIsUserLoggedIn(isLoggedIn);
  }, []);

  return (
    <MContext.Provider value={{
      state: { isUserLoggedIn },
      setIsUserLoggedIn
    }}>
      {children}
    </MContext.Provider>
  );
};

export default MyProvider;
