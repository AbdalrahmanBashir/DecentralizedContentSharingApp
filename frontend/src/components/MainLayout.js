// MainLayout.js
import React from "react";
import { Box, Toolbar } from "@mui/material";
import Navbar from "./Sidebar";
import Footer from "./Footer";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Toolbar /> {/* Offset for fixed AppBar */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default MainLayout;
