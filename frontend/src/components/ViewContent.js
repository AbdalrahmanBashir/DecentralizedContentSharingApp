import React, { useEffect, useState, useCallback } from "react";
import useWallet from "../hooks/useWallet";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  Alert,
  Pagination,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Button,
  TextField,
  Chip,
} from "@mui/material";
import {
  Category,
  Link,
  PictureAsPdf,
  Person,
  AccessTime,
  ReportProblem,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import {
  getAllContentIds,
  getLatestContent,
  voteToFlagContent,
  voteToRestoreContent,
  voteToVerifyContent,
  getActionHistory,
} from "../services/web3Service";
import { retrieveFromIPFS } from "../services/ipfsService";

const AllContent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState(null);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [openActionForm, setOpenActionForm] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const { account, connectWallet } = useWallet();

  const itemsPerPage = 6;

  // Fetch content details and user account
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const allContentIds = await getAllContentIds();
      const allContentDetails = await Promise.all(
        allContentIds.map(async (id) => {
          const content = await getLatestContent(id);
          return {
            id,
            ...content,
            timestamp: Number(content.timestamp),
          };
        })
      );
      setContentList(allContentDetails);
    } catch (error) {
      setErrorMessage("Failed to load content: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleViewDocument = async (ipfsHash) => {
    try {
      const fileContent = await retrieveFromIPFS(ipfsHash);
      const pdfUrl = URL.createObjectURL(fileContent);
      setPdfUrl(pdfUrl);
      setOpenDialog(true);
    } catch (error) {
      setErrorMessage("Failed to retrieve document.");
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setPdfUrl(null);
  };

  const handleActionClick = (action, contentId) => {
    setActionType(action);
    setSelectedContentId(contentId);
    setOpenActionForm(true);
  };

  const handleActionFormClose = () => {
    setOpenActionForm(false);
    setActionMessage("");
  };

  const performAction = async () => {
    if (!account) {
      await connectWallet();
      if (!account) {
        setErrorMessage("Please connect your wallet to proceed.");
        return;
      }
    }
    setActionLoading(true);
    try {
      setActionMessage("Processing your request...");

      if (actionType === "flag") {
        await voteToFlagContent(selectedContentId);
        setActionMessage("Content flagged successfully!");
      } else if (actionType === "restore") {
        await voteToRestoreContent(selectedContentId);
        setActionMessage("Content restored successfully!");
      } else if (actionType === "verify") {
        await voteToVerifyContent(selectedContentId);
        setActionMessage("Content verified successfully!");
      }

      // Refetch latest content details
      await fetchData();
      handleActionFormClose();
    } catch (error) {
      setActionMessage(error.message);
      setErrorMessage("Action failed: " + error.message);
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const fetchActionHistory = async (contentId) => {
    setActionLoading(true);
    setErrorMessage("");
    try {
      const history = await getActionHistory(contentId);
      if (history.length === 0) {
        setActionHistory([]); // Ensure it's an empty array
        setActionMessage("No action history available for this content.");
      } else {
        setActionHistory(history);
        setActionMessage(""); // Clear any previous message
      }
      setOpenHistoryDialog(true);
    } catch (error) {
      setErrorMessage("Failed to retrieve action history: " + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleHistoryDialogClose = () => {
    setOpenHistoryDialog(false);
    setActionHistory([]);
  };

  const paginatedContent = contentList.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: theme.palette.primary.main }}
      >
        All Content
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 2 }}>
        {paginatedContent.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card
              variant="elevation"
              elevation={6}
              sx={{
                height: "100%",
                borderRadius: "16px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.5s",
                "&:hover": {
                  transform: "scale(1.02)",
                },
                bgcolor: content.flagged ? "#fff0f1" : "#f0f5ff",
              }}
            >
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
                <Box
                  sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}
                >
                  <Chip
                    label={content.verified ? "Verified" : "Not Verified"}
                    color={content.verified ? "success" : "warning"}
                    icon={
                      content.verified ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Cancel color="warning" />
                      )
                    }
                    sx={{ mt: 1, fontWeight: "bold", borderRadius: "8px" }}
                  />

                  <Chip
                    label={content.flagged ? "Flagged" : "Good"}
                    color={content.flagged ? "error" : "primary"}
                    icon={
                      content.flagged ? (
                        <ReportProblem color="error" />
                      ) : (
                        <CheckCircle color="primary" />
                      )
                    }
                    sx={{
                      mt: 1,
                      ml: 1,
                      fontWeight: "bold",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: "space-between", mt: 0.5 }}>
                <IconButton
                  onClick={() => handleActionClick("flag", content.id)}
                  color="error"
                >
                  Flag
                </IconButton>
                <IconButton
                  onClick={() => handleActionClick("restore", content.id)}
                  color="warning"
                >
                  Restore
                </IconButton>
                <IconButton
                  onClick={() => handleActionClick("verify", content.id)}
                  color="primary"
                >
                  Verify
                </IconButton>
                <IconButton
                  onClick={() => fetchActionHistory(content.id)}
                  color="info"
                >
                  View History
                </IconButton>

                <Tooltip title="View Document">
                  <IconButton
                    onClick={() => handleViewDocument(content.ipfsHash)}
                  >
                    <PictureAsPdf />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Action Form Dialog */}
      <Dialog open={openActionForm} onClose={handleActionFormClose}>
        <DialogContent>
          <Typography variant="h6">
            Confirm{" "}
            {actionType === "flag"
              ? "Flag"
              : actionType === "restore"
              ? "Restore"
              : "Verify"}{" "}
            Action
          </Typography>
          <TextField
            fullWidth
            label="Content ID"
            value={selectedContentId}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Your Account"
            value={account}
            InputProps={{ readOnly: true }}
            sx={{ mt: 2 }}
          />
          {actionMessage && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {actionMessage}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionFormClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={performAction}
            color="primary"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} />
            ) : (
              `Confirm ${actionType}`
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Document"
              width="100%"
              height="500px"
              style={{ border: "none" }}
            />
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
      </Dialog>

      {/* Action History Dialog */}
      <Dialog
        open={openHistoryDialog}
        onClose={handleHistoryDialogClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <Typography variant="h5" gutterBottom>
            Action History
          </Typography>
          {actionLoading ? (
            <CircularProgress />
          ) : actionHistory.length === 0 ? (
            <Typography color="textSecondary" sx={{ mt: 2 }}>
              {actionMessage || "No action history available for this content."}
            </Typography>
          ) : (
            <Box sx={{ mt: 2, maxHeight: "600px", overflowY: "auto" }}>
              {actionHistory.map((action, index) => (
                <Box
                  key={index}
                  sx={{
                    mt: 2,
                    p: 2,
                    border: "1px solid #e0e0e0",
                    borderRadius: "12px",
                    bgcolor: "#f9f9f9",
                  }}
                >
                  <Typography variant="subtitle1">
                    <strong>Action {index + 1}</strong>
                  </Typography>
                  <Typography variant="body1">
                    <strong>Description:</strong> {action.description}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type:</strong>{" "}
                    {
                      [
                        "Metadata Update",
                        "Collaborator Added",
                        "Collaborator Removed",
                        "Ownership Transferred",
                        "Verified",
                      ][action.actionType]
                    }
                  </Typography>
                  <Typography variant="body1">
                    <strong>User:</strong> {action.user}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Timestamp:</strong>{" "}
                    {new Date(action.timestamp * 1000).toLocaleString()}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <strong>Content Hash:</strong> {action.contentHash}
                    <Tooltip title="Copy Content Hash">
                      <Button
                        sx={{ ml: 2 }}
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigator.clipboard.writeText(action.contentHash)
                        }
                      >
                        Copy Hash
                      </Button>
                    </Tooltip>
                  </Typography>
                  <Typography variant="body1">
                    <strong>Version:</strong> {action.version}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoryDialogClose} color="secondary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={Math.ceil(contentList.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AllContent;
