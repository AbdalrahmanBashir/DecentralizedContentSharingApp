import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Web3 from "web3";
import Dashboard from "./components/Dashboard";
import UploadPage from "./components/UploadPage";

function App() {
  console.log("App is rendering..."); // Log to see if the App component is running

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
