import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize the isVerified state with the value from localStorage
  // We use a function to lazily initialize the state to avoid unnecessary localStorage reads during re-renders
  const [isVerified, setIsVerified] = useState(
    () => localStorage.getItem("isVerified") === "true"
  );

  // The verify function is used to update the verification state
  // It sets isVerified to true and updates the localStorage to persist this state
  const verify = (userMeta) => {
    setIsVerified(true); // Update the state to reflect that the user is verified
    localStorage.setItem("isVerified", "true"); // Persist the verification state in localStorage
    console.log("User meta:", userMeta); // Log user metadata for debugging purposes
  };

  // The logout function resets the verification state
  // It sets isVerified to false and removes the related entry from localStorage
  const logout = () => {
    setIsVerified(false); // Update the state to reflect that the user is not verified
    localStorage.removeItem("isVerified"); // Remove the verification state from localStorage
  };

  // The AuthContext.Provider component provides the isVerified state and the verify and logout functions
  // to any descendant components that consume this context
  return (
    <AuthContext.Provider value={{ isVerified, verify, logout }}>
      {children} {/* Render any nested components passed as children */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
