import AuthenticationService from "../service/AuthenticationService";
import React, { useState, useEffect, createContext } from "react";

export const MContext = createContext();

const MyProvider = ({ children }) => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const isLoggedIn = AuthenticationService.isUserLoggedIn();
    setIsUserLoggedIn(isLoggedIn);
    if (isLoggedIn) {
      // get user from sessionStorage
      const storedUser = JSON.parse(sessionStorage.getItem('authenticatedUser'));
      setUser(storedUser);
    }
  }, []);

  return (
    <MContext.Provider value={{
      state: { isUserLoggedIn, user },
      setIsUserLoggedIn,
      setUser,
    }}>
      {children}
    </MContext.Provider>
  );
};

export default MyProvider;
