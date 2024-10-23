import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Toolbar,
  Divider,
  ListItemIcon,
  Typography,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadIcon from "@mui/icons-material/CloudUpload";
import useWallet from "../hooks/useWallet";

const drawerWidth = 240;

const Sidebar = () => {
  const { account: walletAddress, isConnected } = useWallet();

  // Function to format the wallet address for a cleaner display
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      {/* Display the connected wallet address if available */}
      {isConnected && walletAddress && (
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="subtitle1" color="primary">
            Connected Wallet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatAddress(walletAddress)}
          </Typography>
        </Box>
      )}
      <Divider />
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>

        <ListItem button component={Link} to="/upload">
          <ListItemIcon>
            <UploadIcon />
          </ListItemIcon>
          <ListItemText primary="Upload Research" />
        </ListItem>
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
