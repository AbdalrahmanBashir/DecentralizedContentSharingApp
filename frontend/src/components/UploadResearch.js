import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
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
  Public,
  Lock,
  Category,
  FileUpload,
  InsertDriveFile,
} from "@mui/icons-material";
import { uploadToIPFS, retrieveFromIPFS } from "../services/ipfsService";
import { registerContent, getWeb3 } from "../services/web3Service";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [registeredContent, setRegisteredContent] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [fileContent, setFileContent] = useState(null); // Store file content for display
  const [openDialog, setOpenDialog] = useState(false); // Dialog for displaying file content

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrorMessage("");
  };

  const handleSnackbarClose = () => setOpenSnackbar(false);

  const handleDialogClose = () => {
    setOpenDialog(false);
    if (fileContent) {
      URL.revokeObjectURL(fileContent); // Clean up the Object URL
      setFileContent(null);
    }
  };

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
      setStatusMessage(`File uploaded to IPFS with hash: ${uploadedIpfsHash}`);

      const web3 = getWeb3();
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];

      const contentId = await registerContent(
        title,
        uploadedIpfsHash,
        category,
        isPublic,
        account
      );
      setStatusMessage("Content successfully registered on the blockchain!");

      setRegisteredContent({
        id: contentId,
        title,
        category,
        ipfsHash: uploadedIpfsHash,
        isPublic,
      });

      setTitle("");
      setCategory("");
      setFile(null);
      setIsPublic(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        "Error uploading file or interacting with the blockchain: " +
          error.message
      );
      setOpenSnackbar(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewContent = async () => {
    if (registeredContent?.ipfsHash) {
      try {
        const content = await retrieveFromIPFS(registeredContent.ipfsHash);
        const url = URL.createObjectURL(content); // Create Object URL for PDF Blob
        setFileContent(url); // Set the Blob URL for the iframe
        setOpenDialog(true); // Open the dialog to display the PDF
      } catch (error) {
        setErrorMessage("Error retrieving content from IPFS: " + error.message);
        setOpenSnackbar(true);
      }
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

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Research Title"
          margin="normal"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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

        <FormControlLabel
          control={
            <Checkbox
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              color="primary"
              icon={<Lock />}
              checkedIcon={<Public />}
            />
          }
          label="Make Public"
        />

        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<FileUpload />}
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

        {isUploading ? (
          <CircularProgress sx={{ mt: 2 }} />
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Upload to IPFS & Register
          </Button>
        )}
      </form>

      {registeredContent && (
        <Card sx={{ mt: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Registered Content
            </Typography>
            <Typography variant="body1">
              <strong>Title:</strong> {registeredContent.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Category sx={{ mr: 1 }} />
              <strong>Category:</strong> {registeredContent.category}
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <InsertDriveFile sx={{ mr: 1 }} />
              <strong>IPFS Hash:</strong> {registeredContent.ipfsHash}
            </Typography>
            <Typography
              variant="body1"
              sx={{ display: "flex", alignItems: "center" }}
            >
              {registeredContent.isPublic ? (
                <Public sx={{ mr: 1 }} />
              ) : (
                <Lock sx={{ mr: 1 }} />
              )}
              <strong>Visibility:</strong>{" "}
              {registeredContent.isPublic ? "Public" : "Private"}
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
