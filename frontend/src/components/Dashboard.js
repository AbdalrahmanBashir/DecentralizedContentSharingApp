import React, { useEffect } from "react";
import { Box, CssBaseline, Typography, useTheme } from "@mui/material";
import { useAuth } from "../hooks/AuthContext";

const Dashboard = () => {
  const theme = useTheme();
  const { isVerified } = useAuth();

  // Display verification status
  useEffect(() => {
    console.log(
      "Verification status:",
      isVerified ? "Verified" : "Not Verified"
    );
  }, [isVerified]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        textAlign: "center",
        padding: 2,
      }}
    >
      <CssBaseline />

      {/* App Name */}
      <Typography
        variant="h1"
        gutterBottom
        sx={{ fontSize: { xs: "2rem", md: "3rem" } }}
      >
        🌐 Decentralized App
      </Typography>

      {/* Welcome Message */}
      <Typography
        variant="h3"
        sx={{ mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
      >
        Welcome to the Decentralized Content Management Platform!
      </Typography>
    </Box>
  );
};

export default Dashboard;
