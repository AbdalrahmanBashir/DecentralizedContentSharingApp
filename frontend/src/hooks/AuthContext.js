// hooks/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize the state with the value from localStorage
  const [isVerified, setIsVerified] = useState(
    () => localStorage.getItem("isVerified") === "true"
  );

  // Verify function to update state and localStorage
  const verify = (userMeta) => {
    setIsVerified(true);
    localStorage.setItem("isVerified", "true");
    console.log("User meta:", userMeta);
  };

  // Logout function to reset state and localStorage
  const logout = () => {
    setIsVerified(false);
    localStorage.removeItem("isVerified");
  };

  return (
    <AuthContext.Provider value={{ isVerified, verify, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
