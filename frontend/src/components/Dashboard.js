import React, { useState, useEffect } from "react";
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
  IconButton,
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

const Dashboard = () => {
  const theme = useTheme();
  const { account, isConnected, error, loading, networkId } = useWallet();
  const [userContent, setUserContent] = useState([]);
  const [collaborativeContent, setCollaborativeContent] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected && account) {
      fetchUserContent(account).then(setUserContent);
      fetchCollaborativeContent(account).then(setCollaborativeContent);
      setRecentActivities([
        { id: 1, title: "Added new content", timestamp: "10 mins ago" },
        { id: 2, title: "Collaborated on content", timestamp: "1 hour ago" },
      ]);
    }
  }, [isConnected, account]);

  const formatAddress = (address) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar account={formatAddress(account)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mx: "auto",
          p: 3,
          bgcolor: "#f5f5f5",
          maxWidth: "1200px",
        }}
      >
        <Toolbar />

        {/* Dashboard Title */}
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ color: theme.palette.primary.main, mb: 4 }}
        >
          Dashboard Overview
        </Typography>

        {/* Wallet Info */}
        {isConnected && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountCircle sx={{ mr: 1 }} /> Connected Wallet:{" "}
              {formatAddress(account)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Network ID: {networkId}
            </Typography>
          </Box>
        )}

        {/* Loading and Error Display */}
        {loading && (
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
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* Quick Actions */}
        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
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
            onClick={() => navigate("/my-content")}
          >
            View My Content
          </Button>
        </Box>

        {/* Recent Activities Section */}
        <Box sx={{ mt: 4, bgcolor: "#ffffff", p: 2, borderRadius: 2 }}>
          <Typography variant="h5" align="center" sx={{ mb: 2 }}>
            Recent Activities
          </Typography>
          <Grid container spacing={2}>
            {recentActivities.length ? (
              recentActivities.map((activity) => (
                <Grid item xs={12} sm={6} md={4} key={activity.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "#f9f9f9",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <CardContent>
                      <Typography
                        variant="body2"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <EventNote
                          sx={{ mr: 1, color: theme.palette.info.main }}
                        />
                        {activity.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 1, display: "block" }}
                      >
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
                sx={{ width: "100%", mt: 1 }}
              >
                No recent activities yet.
              </Typography>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* My Content Section */}
        <Box sx={{ mt: 4, bgcolor: "#ffffff", p: 2, borderRadius: 2 }}>
          <Typography variant="h5" align="center" sx={{ mb: 2 }}>
            My Content
          </Typography>
          <Grid container spacing={2}>
            {userContent.length ? (
              userContent.map((content) => (
                <Grid item xs={12} sm={6} md={4} key={content.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "#f9f9f9",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{content.title}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Category: {content.category}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Access Count: {content.accessCount}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Visibility: {content.isPublic ? "Public" : "Private"}
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
                sx={{ width: "100%", mt: 1 }}
              >
                You have no registered content.
              </Typography>
            )}
          </Grid>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Collaborative Content Section */}
        <Box sx={{ mt: 4, bgcolor: "#ffffff", p: 2, borderRadius: 2 }}>
          <Typography variant="h5" align="center" sx={{ mb: 2 }}>
            Collaborative Content
          </Typography>
          <Grid container spacing={2}>
            {collaborativeContent.length ? (
              collaborativeContent.map((content) => (
                <Grid item xs={12} sm={6} md={4} key={content.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: "#f9f9f9",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="h6">{content.title}</Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Group
                          sx={{ mr: 1, color: theme.palette.secondary.main }}
                        />
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
                sx={{ width: "100%", mt: 1 }}
              >
                No collaborative content available.
              </Typography>
            )}
          </Grid>
        </Box>

        {/* Footer Alert */}
        <Alert severity="info" sx={{ mt: 4 }}>
          Note: Make sure you're connected to the correct network for
          transactions.
        </Alert>
      </Box>
    </Box>
  );
};

export default Dashboard;
