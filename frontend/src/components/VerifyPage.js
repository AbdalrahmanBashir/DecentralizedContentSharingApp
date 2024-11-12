import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Card,
  CircularProgress,
  Alert,
  Tooltip,
  Fade,
} from "@mui/material";
import QRCode from "react-qr-code";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { fetchAuthRequest } from "../services/authService";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const VerifyPage = () => {
  const [authRequest, setAuthRequest] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [encodedRequest, setEncodedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [verified, setVerified] = useState(false);
  const { verify } = useAuth();
  const navigate = useNavigate();

  // Fetch the authorization request from the backend
  useEffect(() => {
    const getAuthRequest = async () => {
      try {
        setLoading(true);
        setStatusMessage("Fetching QR code...");
        const response = await fetchAuthRequest();
        const { request, sessionId } = response;

        console.log("Received Auth Request:", request);
        console.log("Received Session ID:", sessionId);

        setSessionId(sessionId);
        setAuthRequest(request);
        setEncodedRequest(btoa(JSON.stringify(request)));
        setStatusMessage("QR code ready. Please scan with your wallet.");
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch auth request:", error);
        setError("Failed to fetch auth request.");
        setLoading(false);
      }
    };

    getAuthRequest();
  }, []);

  // Set up Server-Sent Events (SSE) for real-time updates
  useEffect(() => {
    if (!sessionId) return;

    const sseUrl = `http://192.168.12.138:8009/api/verify-status?sessionId=${sessionId}`;
    const eventSource = new EventSource(sseUrl);

    console.log("Setting up SSE listener for session ID:", sessionId);

    eventSource.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received SSE message:", message);

      if (message.status === "DONE") {
        console.log("Verification successful:", message.data);
        setStatusMessage("✅ Verification Successful!");
        setVerified(true);
        verify(message.data.meta);
        eventSource.close();
        setTimeout(() => {
          console.log("Navigating to /dashboard...");
          navigate("/dashboard", { replace: true });
        }, 1500);
      } else if (message.status === "ERROR") {
        console.error("Verification error:", message.error);
        setStatusMessage(`❌ Verification Error: ${message.error}`);
        setError(message.error);
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setStatusMessage("❌ SSE connection error.");
      setError("Connection error. Please try again.");
      eventSource.close();
    };

    // Cleanup on component unmount
    return () => {
      console.log("Cleaning up SSE listener for session ID:", sessionId);
      eventSource.close();
    };
  }, [sessionId, verify, navigate]);

  // Helper function to handle errors
  const handleError = (message) => {
    console.error(message);
    setError(message);
    setStatusMessage(message);
    setLoading(false);
  };

  // Handle the verification process
  const handleVerification = () => {
    if (!encodedRequest) {
      handleError("No encoded request available. Please refresh the page.");
      return;
    }

    setStatusMessage("Waiting for proof submission...");
    window.open(`https://wallet.privado.id/#i_m=${encodedRequest}`, "_blank");
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading QR code...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Main UI
  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "60px auto",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Verify with Privado ID
      </Typography>

      <Button
        variant="contained"
        color="success"
        onClick={handleVerification}
        sx={{ mb: 2 }}
      >
        Verify
      </Button>

      <Card sx={{ mt: 2, p: 3, textAlign: "center", boxShadow: 3 }}>
        <Tooltip title="Scan this QR code with your wallet" arrow>
          <QRCode value={JSON.stringify(authRequest)} size={256} />
        </Tooltip>
      </Card>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Status: {statusMessage}
      </Typography>

      {/* Success Animation */}
      {verified && (
        <Fade in={verified}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mt: 2 }} />
        </Fade>
      )}

      {/* Error Animation */}
      {error && (
        <Fade in={Boolean(error)}>
          <ErrorIcon color="error" sx={{ fontSize: 60, mt: 2 }} />
        </Fade>
      )}
    </Box>
  );
};

export default VerifyPage;
