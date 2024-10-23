import React from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import Sidebar from "./Sidebar";
import useWallet from "../hooks/useWallet";

const Dashboard = () => {
  const {
    account,
    isConnected,
    error,
    connectWallet,
    disconnectWallet,
    loading,
  } = useWallet();

  // Function to format the wallet address for a cleaner display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Pass the account to the Sidebar */}
      <Sidebar account={formatAddress(account)} />

      {/* Main content area */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", height: "100vh" }}
      >
        <Toolbar />
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1">
          Welcome to your decentralized content platform dashboard.
        </Typography>

        {/* Show loading state if connection is in progress */}
        {loading && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Connecting to wallet...
            </Typography>
          </Box>
        )}

        {/* Button to connect to wallet if not connected */}
        {!loading && !isConnected && (
          <Button
            onClick={connectWallet}
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Connect Wallet
          </Button>
        )}

        {/* Display account address and disconnect button if connected */}
        {isConnected && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6">
              Connected Wallet: {formatAddress(account)}
            </Typography>
            <Button
              onClick={disconnectWallet}
              variant="outlined"
              color="secondary"
              sx={{ mt: 2 }}
            >
              Disconnect Wallet
            </Button>
          </Box>
        )}

        {/* Error message display */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
