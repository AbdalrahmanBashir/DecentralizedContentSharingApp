// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Dashboard from "./components/Dashboard";
import UploadResearch from "./components/UploadResearch";
import ViewContent from "./components/ViewContent";
import UserManagement from "./components/UserManagement";
import PlatformSettings from "./components/PlatformSettings";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
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
        <Route
          path="/settings"
          element={
            <MainLayout>
              <PlatformSettings />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
