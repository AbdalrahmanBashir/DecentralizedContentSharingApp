import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./components/Dashboard";
import UploadResearch from "./components/UploadResearch";
import ViewContent from "./components/ViewContent";
import UserManagement from "./components/UserManagement";
import VerifyPage from "./components/VerifyPage";
import { useAuth } from "./hooks/AuthContext";

const App = () => {
  const { isVerified } = useAuth();

  return (
    <Routes>
      {/* Public route for verification */}
      <Route path="/verify" element={<VerifyPage />} />

      {/* Protected routes - only accessible if verified */}
      {isVerified ? (
        <>
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/upload"
            element={
              <MainLayout>
                <UploadResearch />
              </MainLayout>
            }
          />
          <Route
            path="/view-content"
            element={
              <MainLayout>
                <ViewContent />
              </MainLayout>
            }
          />
          <Route
            path="/user-management"
            element={
              <MainLayout>
                <UserManagement />
              </MainLayout>
            }
          />
          {/* Redirect any unknown paths to the dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </>
      ) : (
        // Redirect all unknown paths to verification if not verified
        <Route path="*" element={<Navigate to="/verify" replace />} />
      )}
    </Routes>
  );
};

export default App;
