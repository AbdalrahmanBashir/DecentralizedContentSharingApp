import React, { useEffect } from "react";
import {
  Box,
  CssBaseline,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  useTheme,
} from "@mui/material";
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
        height: "100vh",
        overflow: "hidden",
        padding: 4,
        background: `linear-gradient(to bottom, ${theme.palette.primary.light}, ${theme.palette.background.default})`,
        color: theme.palette.text.primary,
      }}
    >
      <CssBaseline />

      {/* Header Section */}
      <Typography
        variant="h2"
        gutterBottom
        sx={{
          fontSize: { xs: "2.5rem", md: "3.5rem" },
          fontWeight: "bold",
          color: theme.palette.primary.contrastText,
        }}
      >
        🌐 Decentralized App
      </Typography>

      {/* Welcome Message */}
      <Typography
        variant="h5"
        sx={{ mb: 4, fontSize: { xs: "1.25rem", md: "1.5rem" } }}
      >
        Welcome to the Decentralized Content Management Platform!
      </Typography>

      {/* Main Content Card */}
      <Card
        sx={{
          width: { xs: "95%", sm: "80%", md: "60%" },
          maxWidth: "700px",
          maxHeight: "60vh",
          overflow: "auto",
          borderRadius: "16px",
          boxShadow: 5,
          transition: "transform 0.2s",
          "&:hover": {
            transform: "scale(1.02)",
          },
          bgcolor: isVerified ? "success.main" : "error.main",
          color: isVerified ? "success.contrastText" : "error.contrastText",
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  fontWeight: "medium",
                }}
              >
                {isVerified
                  ? "✅ Your Account is Verified!"
                  : "⚠️ Your Account is Not Verified"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {isVerified
                  ? "You have full access to all features of the platform."
                  : "Please complete the verification process to gain full access."}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
