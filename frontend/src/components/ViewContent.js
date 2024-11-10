import React, { useEffect, useState, useCallback } from "react";
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
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  Category,
  Link,
  Group,
  Share,
  Info,
  VisibilityOff,
  PictureAsPdf,
  Person,
  AccessTime,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { fetchAllContent } from "../services/web3Service";
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
  const itemsPerPage = 6;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const allContent = await fetchAllContent();
      // Convert BigInt fields to appropriate types
      const convertedContent = allContent.map((content) => ({
        ...content,
        timestamp: Number(content.timestamp), // Explicit conversion for timestamp
        accessCount: Number(content.accessCount), // Explicit conversion for access count if needed
      }));
      setContentList(convertedContent);
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

      {errorMessage && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {!loading && contentList.length === 0 && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          No content registered yet.
        </Typography>
      )}

      <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: 2 }}>
        {paginatedContent.map((content) => (
          <Grid item xs={12} sm={6} md={4} key={content.id}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                bgcolor: "#ffffff",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom color="textPrimary">
                  {content.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <Category sx={{ mr: 1, color: theme.palette.info.main }} />
                  Category: {content.category}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mt: 1,
                    wordWrap: "break-word",
                  }}
                >
                  <Link sx={{ mr: 1, color: theme.palette.warning.main }} />
                  IPFS Hash:{" "}
                  <span
                    style={{
                      wordBreak: "break-all",
                      marginLeft: "0.3em",
                      color: theme.palette.primary.dark,
                      fontSize: "0.85em",
                    }}
                  >
                    {content.ipfsHash}
                  </span>
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <Group sx={{ mr: 1, color: theme.palette.success.main }} />
                  Access Count: {content.accessCount}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <Person sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  Owner: {content.owner}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  <AccessTime
                    sx={{ mr: 1, color: theme.palette.text.secondary }}
                  />
                  Registered On:{" "}
                  {new Date(content.timestamp * 1000).toLocaleString()}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ display: "flex", alignItems: "center", mt: 1 }}
                >
                  {content.isPublic ? (
                    <Visibility
                      sx={{ mr: 1, color: theme.palette.info.main }}
                    />
                  ) : (
                    <VisibilityOff
                      sx={{ mr: 1, color: theme.palette.error.main }}
                    />
                  )}
                  Visibility: {content.isPublic ? "Public" : "Private"}
                </Typography>
              </CardContent>
              <CardActions>
                <Tooltip title="Share" placement="top">
                  <IconButton color="primary">
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More Info" placement="top">
                  <IconButton color="primary">
                    <Info />
                  </IconButton>
                </Tooltip>
                <Tooltip title="View Document" placement="top">
                  <IconButton
                    color="primary"
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

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={Math.ceil(contentList.length / itemsPerPage)}
          page={page}
          onChange={handlePageChange}
          color="primary"
          size="large"
          variant="outlined"
          shape="rounded"
        />
      </Box>

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
    </Box>
  );
};

export default AllContent;
