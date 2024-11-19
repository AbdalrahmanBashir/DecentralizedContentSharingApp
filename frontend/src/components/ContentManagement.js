import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Alert,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Chip,
  Snackbar,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import {
  Category,
  Link,
  Person,
  AccessTime,
  Edit,
  TransferWithinAStation,
  GroupAdd,
  GroupRemove,
  PictureAsPdf,
  CheckCircle,
  Cancel,
  Verified,
  ErrorOutline,
  HighlightOff,
  Done,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  fetchUserContent,
  updateContentDetails,
  transferOwnership,
  addCollaborator,
  removeCollaborator,
} from "../services/web3Service";
import { retrieveFromIPFS } from "../services/ipfsService";
import useWallet from "../hooks/useWallet";

const ContentManagement = () => {
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [selectedContent, setSelectedContent] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [collaboratorAddress, setCollaboratorAddress] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false);
  const { account, connectWallet } = useWallet();
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const itemsPerPage = 9;

  // Fetch user's content
  const loadUserContent = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const userContent = await fetchUserContent();
      setContentList(userContent);
    } catch (error) {
      setErrorMessage("Failed to load content: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) loadUserContent();
  }, [account, loadUserContent]);

  // PDF Viewer
  const handleViewDocument = async (ipfsHash) => {
    setPdfLoading(true);
    try {
      const fileContent = await retrieveFromIPFS(ipfsHash);
      const pdfUrl = URL.createObjectURL(fileContent);
      setPdfUrl(pdfUrl);
      setPdfDialogOpen(true); // Open the PDF Viewer Dialog
    } catch (error) {
      showSnackbar("Failed to retrieve document.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePdfDialogClose = () => {
    setPdfDialogOpen(false);
    setPdfUrl(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPdfUrl(null);
    setSelectedContent(null);
    setNewTitle("");
    setNewCategory("");
    setNewOwner("");
    setCollaboratorAddress("");
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const openActionDialog = (type, content) => {
    setDialogType(type);
    setSelectedContent(content);
    setDialogOpen(true);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Unified performAction function
  const performAction = async () => {
    if (!selectedContent) return;
    setActionLoading(true);
    try {
      switch (dialogType) {
        case "update":
          await updateContentDetails(
            selectedContent.id,
            newTitle,
            newCategory,
            userAccount
          );
          showSnackbar("Content updated successfully!");
          break;
        case "transfer":
          await transferOwnership(selectedContent.id, newOwner, userAccount);
          showSnackbar("Ownership transferred successfully!");
          break;
        case "addCollaborator":
          await addCollaborator(
            selectedContent.id,
            collaboratorAddress,
            userAccount
          );
          showSnackbar("Collaborator added successfully!");
          break;
        case "removeCollaborator":
          await removeCollaborator(
            selectedContent.id,
            collaboratorAddress,
            userAccount
          );
          showSnackbar("Collaborator removed successfully!");
          break;
        default:
          throw new Error("Invalid action type");
      }

      await loadUserContent();
      handleDialogClose();
    } catch (error) {
      showSnackbar("Action failed: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };
  const totalPages = Math.ceil(contentList.length / itemsPerPage);
  const paginatedContent = contentList.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ p: 3, bgcolor: "#f0f0f0", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Content Management
      </Typography>

      {loading && <CircularProgress />}
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      {contentList.length === 0 && (
        <Alert severity="info">
          You do not own any content yet. Please register or upload content to
          see it here.
        </Alert>
      )}

      <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 2 }}>
        {paginatedContent.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card variant="outlined" sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6">{content.title}</Typography>
                <Typography>
                  <Category /> Category: {content.category}
                </Typography>
                <Typography>
                  <Link /> IPFS Hash: {content.ipfsHash}
                </Typography>
                <Typography>
                  <Person /> Owner: {content.owner}
                </Typography>
                <Typography>
                  <AccessTime /> Registered On:{" "}
                  {new Date(content.timestamp * 1000).toLocaleString()}
                </Typography>
                <Chip
                  label={content.verified ? "Verified" : "Not Verified"}
                  color={content.verified ? "success" : "warning"}
                  icon={content.verified ? <Verified /> : <ErrorOutline />}
                  sx={{ mt: 1 }}
                />
                <Chip
                  label={content.flagged ? "Flagged" : "Good"}
                  color={content.flagged ? "error" : "primary"}
                  icon={content.flagged ? <HighlightOff /> : <Done />}
                  sx={{ mt: 1, ml: 1 }}
                />
              </CardContent>
              <CardActions>
                <Tooltip title="Update Details">
                  <IconButton
                    onClick={() => openActionDialog("update", content)}
                    color="info"
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Transfer Ownership">
                  <IconButton
                    onClick={() => openActionDialog("transfer", content)}
                    color="warning"
                  >
                    <TransferWithinAStation />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add Collaborator">
                  <IconButton
                    onClick={() => openActionDialog("addCollaborator", content)}
                    color="success"
                  >
                    <GroupAdd />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove Collaborator">
                  <IconButton
                    onClick={() =>
                      openActionDialog("removeCollaborator", content)
                    }
                    color="error"
                  >
                    <GroupRemove />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Document">
                  <IconButton
                    onClick={() => handleViewDocument(content.ipfsHash)}
                    color="primary"
                  >
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />

      <Dialog
        open={pdfDialogOpen}
        onClose={handlePdfDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          {pdfLoading ? (
            <CircularProgress />
          ) : (
            <iframe
              src={pdfUrl}
              title="PDF Document"
              width="100%"
              height="600px"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePdfDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        <DialogContent>
          {dialogType === "update" ? (
            <>
              <Typography variant="h6" gutterBottom>
                Update Content Details
              </Typography>
              <TextField
                label="New Title"
                fullWidth
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                sx={{ mt: 2 }}
              />
              <TextField
                label="New Category"
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          ) : dialogType === "transfer" ? (
            <>
              <Typography variant="h6" gutterBottom>
                Transfer Ownership
              </Typography>
              <TextField
                label="New Owner Address"
                fullWidth
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          ) : dialogType === "addCollaborator" ? (
            <>
              <Typography variant="h6" gutterBottom>
                Add Collaborator
              </Typography>
              <TextField
                label="Collaborator Address"
                fullWidth
                value={collaboratorAddress}
                onChange={(e) => setCollaboratorAddress(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          ) : dialogType === "removeCollaborator" ? (
            <>
              <Typography variant="h6" gutterBottom>
                Remove Collaborator
              </Typography>
              <TextField
                label="Collaborator Address"
                fullWidth
                value={collaboratorAddress}
                onChange={(e) => setCollaboratorAddress(e.target.value)}
                sx={{ mt: 2 }}
              />
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={performAction} disabled={actionLoading}>
            {actionLoading ? "Processing..." : "Confirm"}
          </Button>
          <Button onClick={handleDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
          //variant="outlined"
          //shape="rounded"
        />
      </Box>
    </Box>
  );
};

export default ContentManagement;
