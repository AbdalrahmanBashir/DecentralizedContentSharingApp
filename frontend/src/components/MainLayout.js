import React from "react";
import { Box, Toolbar, AppBar, Typography, Button } from "@mui/material";
import Navbar from "./Sidebar";
import Footer from "./Footer";
import LogoutButton from "./LogoutButton";

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header with Navbar and Logout Button */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Decentralized Content Platform
          </Typography>
          <LogoutButton />
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation */}
      <Navbar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default MainLayout;
