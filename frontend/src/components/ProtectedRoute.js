// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/verify" replace />;
};

export default ProtectedRoute;
