import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  MenuItem,
  Snackbar,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import {
  Category,
  FileUpload,
  InsertDriveFile,
  CheckCircle,
} from "@mui/icons-material";
import { uploadToIPFS, retrieveFromIPFS } from "../services/ipfsService";
import { registerContent, getWeb3 } from "../services/web3Service";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [ipfsHash, setIpfsHash] = useState("");
  const [registeredContent, setRegisteredContent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [fileContent, setFileContent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("idle"); // "loading", "success"
  const [registerStatus, setRegisterStatus] = useState("idle"); // "loading", "success"

  // Handle file selection and auto-populate title
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setErrorMessage("");

      // Auto-populate the title with the file name (without the .pdf extension)
      const fileName = selectedFile.name.replace(/\.pdf$/i, "");
      if (!title) {
        setTitle(fileName);
      }
    }
  };

  const handleSnackbarClose = () => setOpenSnackbar(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
    if (fileContent) {
      URL.revokeObjectURL(fileContent);
      setFileContent(null);
    }
  };

  // Handle form submission and upload process
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setErrorMessage("Please select a file.");
      setOpenSnackbar(true);
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage("Uploading file to IPFS...");

      const uploadedIpfsHash = await uploadToIPFS(file);
      setIpfsHash(uploadedIpfsHash);
      setUploadStatus("success"); // Show green checkmark after success
      setStatusMessage(`File uploaded to IPFS with hash: ${uploadedIpfsHash}`);
      setRegisterStatus("loading");
      setStatusMessage("Registering content on the blockchain...");

      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const contentId = await registerContent(
        title,
        uploadedIpfsHash,
        category,
        account
      );
      setRegisterStatus("success"); // Show green checkmark after success
      setStatusMessage("Content successfully registered on the blockchain!");

      setRegisteredContent({
        id: contentId,
        title,
        category,
        ipfsHash: uploadedIpfsHash,
      });

      // Reset form fields
      setTitle("");
      setCategory("");
      setFile(null);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        "Error uploading file or interacting with the blockchain: " +
          error.message
      );
      setOpenSnackbar(true);
      setUploadStatus("idle");
      setRegisterStatus("idle");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle viewing content from IPFS
  const handleViewContent = async () => {
    if (registeredContent?.ipfsHash) {
      try {
        const content = await retrieveFromIPFS(registeredContent.ipfsHash);
        const url = URL.createObjectURL(content);
        setFileContent(url);
        setOpenDialog(true);
      } catch (error) {
        setErrorMessage("Error retrieving content from IPFS: " + error.message);
        setOpenSnackbar(true);
      }
    }
  };

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Upload Research
      </Typography>

      {statusMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {statusMessage}
        </Alert>
      )}
      {errorMessage && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert onClose={handleSnackbarClose} severity="error">
            {errorMessage}
          </Alert>
        </Snackbar>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 3,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          bgcolor: "#ffffff",
        }}
      >
        <TextField
          fullWidth
          label="Research Title"
          margin="normal"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title or leave as file name"
          InputProps={{
            startAdornment: (
              <IconButton edge="start">
                <InsertDriveFile />
              </IconButton>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Category"
          margin="normal"
          select
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          InputProps={{
            startAdornment: (
              <IconButton edge="start">
                <Category />
              </IconButton>
            ),
          }}
        >
          <MenuItem value="Science">Science</MenuItem>
          <MenuItem value="Technology">Technology</MenuItem>
          <MenuItem value="Engineering">Engineering</MenuItem>
          <MenuItem value="Mathematics">Mathematics</MenuItem>
        </TextField>

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUpload />}
            fullWidth
          >
            Choose File
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>
          {file && <Typography sx={{ mt: 1 }}>{file.name}</Typography>}
        </Box>
        <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Uploading to IPFS:
          </Typography>
          {uploadStatus === "loading" && (
            <CircularProgress size={20} color="primary" />
          )}
          {uploadStatus === "success" && <CheckCircle color="success" />}
        </Box>

        <Box sx={{ mt: 2, display: "flex", alignItems: "center" }}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Registering on Blockchain:
          </Typography>
          {registerStatus === "loading" && (
            <CircularProgress size={20} color="primary" />
          )}
          {registerStatus === "success" && <CheckCircle color="success" />}
        </Box>

        {isUploading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Upload to IPFS & Register
          </Button>
        )}
      </Box>

      {registeredContent && (
        <Card sx={{ mt: 4, width: "100%", maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Registered Content
            </Typography>
            <Typography variant="body1">
              <strong>Title:</strong> {registeredContent.title}
            </Typography>
            <Typography variant="body1">
              <strong>Category:</strong> {registeredContent.category}
            </Typography>
            <Typography variant="body1">
              <strong>IPFS Hash:</strong> {registeredContent.ipfsHash}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={handleViewContent}>
              View Content
            </Button>
          </CardActions>
        </Card>
      )}

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          {fileContent ? (
            <iframe
              src={fileContent}
              title="PDF Content"
              width="100%"
              height="500px"
              style={{ border: "none" }}
            />
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UploadPage;
