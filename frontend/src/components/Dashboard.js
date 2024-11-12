import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Add,
  Visibility,
  Group,
  AccountCircle,
  EventNote,
} from "@mui/icons-material";
import Sidebar from "./Sidebar";
import useWallet from "../hooks/useWallet";
import {
  fetchUserContent,
  fetchCollaborativeContent,
} from "../services/web3Service";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";

const Dashboard = React.memo(() => {
  const theme = useTheme();
  const { account, isConnected, error, loading, networkId } = useWallet();
  const { isVerified, userMeta } = useAuth();
  const [userContent, setUserContent] = useState([]);
  const [collaborativeContent, setCollaborativeContent] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [fetchError, setFetchError] = useState(null);
  const navigate = useNavigate();

  // Redirect if not verified
  useEffect(() => {
    if (!isVerified) {
      navigate("/verify");
    }
  }, [isVerified, navigate]);

  // Fetch content data
  const fetchData = useCallback(async () => {
    if (isConnected && account) {
      try {
        const [userContentData, collaborativeContentData] = await Promise.all([
          fetchUserContent(account),
          fetchCollaborativeContent(account),
        ]);
        setUserContent(userContentData);
        setCollaborativeContent(collaborativeContentData);
        setRecentActivities([
          { id: 1, title: "Added new content", timestamp: "10 mins ago" },
          { id: 2, title: "Collaborated on content", timestamp: "1 hour ago" },
        ]);
      } catch (err) {
        console.error("Error fetching data:", err);
        setFetchError("Failed to load content data. Please try again.");
      }
    }
  }, [isConnected, account]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatAddress = (address) =>
    address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar account={formatAddress(account)} />

      <Box
        component="main"
        sx={{ flexGrow: 1, mx: "auto", p: 3, maxWidth: "1200px" }}
      >
        <Toolbar />

        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: theme.palette.primary.main, mb: 4 }}
        >
          Dashboard Overview
        </Typography>

        {isConnected && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h6">
              <AccountCircle sx={{ mr: 1 }} /> Connected Wallet:{" "}
              {formatAddress(account)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Network ID: {networkId}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Loading data...
            </Typography>
          </Box>
        ) : fetchError ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {fetchError}
          </Alert>
        ) : (
          <>
            <Box
              sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => navigate("/upload")}
              >
                Register New Content
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Visibility />}
                onClick={() => navigate("/view-content")}
              >
                View My Content
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Recent Activities Section */}
            <Box sx={{ bgcolor: "#ffffff", p: 2, borderRadius: 2 }}>
              <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                Recent Activities
              </Typography>
              <Grid container spacing={2}>
                {recentActivities.length ? (
                  recentActivities.map((activity) => (
                    <Grid item xs={12} sm={6} md={4} key={activity.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2">
                            <EventNote
                              sx={{ mr: 1, color: theme.palette.info.main }}
                            />
                            {activity.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {activity.timestamp}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    No recent activities yet.
                  </Typography>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* User Content Section */}
            <Box sx={{ bgcolor: "#ffffff", p: 2, borderRadius: 2 }}>
              <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                My Content
              </Typography>
              <Grid container spacing={2}>
                {userContent.length ? (
                  userContent.map((content) => (
                    <Grid item xs={12} sm={6} md={4} key={content.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{content.title}</Typography>
                          <Typography variant="body2">
                            Category: {content.category}
                          </Typography>
                          <Typography variant="body2">
                            Access Count: {content.accessCount}
                          </Typography>
                          <Typography variant="body2">
                            Visibility:{" "}
                            {content.isPublic ? "Public" : "Private"}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/content/${content.id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    You have no registered content.
                  </Typography>
                )}
              </Grid>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Collaborative Content Section */}
            <Box sx={{ bgcolor: "#ffffff", p: 2, borderRadius: 2 }}>
              <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                Collaborative Content
              </Typography>
              <Grid container spacing={2}>
                {collaborativeContent.length ? (
                  collaborativeContent.map((content) => (
                    <Grid item xs={12} sm={6} md={4} key={content.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{content.title}</Typography>
                          <Typography variant="body2">
                            <Group sx={{ mr: 1 }} />
                            Owned by {formatAddress(content.owner)}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/content/${content.id}`)}
                          >
                            View Details
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    No collaborative content available.
                  </Typography>
                )}
              </Grid>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
});

export default Dashboard;
