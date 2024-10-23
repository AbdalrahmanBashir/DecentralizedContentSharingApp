import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { uploadToIPFS } from "../services/ipfsService"; // Use the local IPFS service

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file.");
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage("Uploading file to IPFS...");

      // Upload file to your local IPFS node
      const ipfsHash = await uploadToIPFS(file);
      setIpfsHash(ipfsHash);
      setStatusMessage(`File uploaded to IPFS with hash: ${ipfsHash}`);
    } catch (error) {
      setErrorMessage("Error uploading file to IPFS. " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, p: 3, bgcolor: "#f5f5f5", height: "100vh" }}
    >
      <Typography variant="h4" gutterBottom>
        Upload Research
      </Typography>

      {statusMessage && <Alert severity="info">{statusMessage}</Alert>}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Research Title" margin="normal" required />
        <input
          accept="application/pdf"
          type="file"
          onChange={handleFileChange}
          style={{ margin: "20px 0" }}
        />

        {isUploading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <Button type="submit" variant="contained" color="primary">
            Upload to IPFS
          </Button>
        )}
      </form>

      {ipfsHash && <p>IPFS Hash: {ipfsHash}</p>}
    </Box>
  );
};

export default UploadPage;
