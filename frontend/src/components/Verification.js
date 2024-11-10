import React, { useState } from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import useWallet from "../hooks/useWallet"; // Hook for wallet connection
import { verifyDID } from "../services/didService"; // Service function for DID verification

const VerificationPage = () => {
  const { account, connectWallet } = useWallet(); // Get wallet information
  const [isVerified, setIsVerified] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleVerification = async () => {
    try {
      // Call DID verification function
      const isValid = await verifyDID(account);
      setIsVerified(isValid);
      setVerificationStatus("Verification successful");
    } catch (error) {
      console.error("Verification failed:", error);
      setVerificationStatus("Verification failed. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 5,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Decentralized Identity Verification
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Please connect your wallet and verify your identity to access restricted
        content.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={connectWallet}
        sx={{ mb: 2 }}
      >
        Connect Wallet
      </Button>

      <Button
        variant="contained"
        color="secondary"
        disabled={!account}
        onClick={handleVerification}
      >
        Verify Identity
      </Button>

      {verificationStatus && (
        <Alert severity={isVerified ? "success" : "error"} sx={{ mt: 3 }}>
          {verificationStatus}
        </Alert>
      )}
    </Box>
  );
};

export default VerificationPage;
