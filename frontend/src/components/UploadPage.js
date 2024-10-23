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
import { registerContent, getWeb3 } from "../services/web3Service"; // Smart contract interaction

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(""); // Store research title
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

      // Upload file to IPFS
      const ipfsHash = await uploadToIPFS(file);
      setIpfsHash(ipfsHash);
      setStatusMessage(`File uploaded to IPFS with hash: ${ipfsHash}`);

      // Now, register the content in the smart contract
      setStatusMessage("Registering content to the smart contract...");

      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0]; // Assuming the first account is used

      await registerContent(title, ipfsHash, account);
      setStatusMessage("Content successfully registered in the blockchain!");
    } catch (error) {
      setErrorMessage(
        "Error uploading file or interacting with the blockchain: " +
          error.message
      );
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
        <TextField
          fullWidth
          label="Research Title"
          margin="normal"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)} // Track title input
        />
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
            Upload to IPFS & Register
          </Button>
        )}
      </form>

      {ipfsHash && <p>IPFS Hash: {ipfsHash}</p>}
    </Box>
  );
};

export default UploadPage;
