import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import UploadIcon from "@mui/icons-material/CloudUpload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WalletIcon from "@mui/icons-material/AccountBalanceWallet";
import useWallet from "../hooks/useWallet";
import { useAuth } from "../hooks/AuthContext";

const Navbar = () => {
  const {
    account: walletAddress,
    isConnected,
    connectWallet,
    disconnectWallet,
  } = useWallet();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [walletMenuAnchorEl, setWalletMenuAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleWalletMenuOpen = (event) =>
    setWalletMenuAnchorEl(event.currentTarget);
  const handleWalletMenuClose = () => setWalletMenuAnchorEl(null);

  const handleLogout = () => {
    disconnectWallet();
    logout();
    navigate("/verify", { replace: true });
  };

  const handleReconnect = async () => {
    disconnectWallet();
    connectWallet();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: theme.palette.primary.main,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: "white", fontWeight: "bold" }}
        >
          Decentralized Content Platform
        </Typography>

        {isMobile ? (
          <>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                <DashboardIcon sx={{ mr: 1 }} /> Dashboard
              </MenuItem>
              <MenuItem component={Link} to="/upload" onClick={handleMenuClose}>
                <UploadIcon sx={{ mr: 1 }} /> Upload Research
              </MenuItem>
              <MenuItem
                component={Link}
                to="/view-content"
                onClick={handleMenuClose}
              >
                <VisibilityIcon sx={{ mr: 1 }} /> View Content
              </MenuItem>
              <MenuItem
                component={Link}
                to="/user-management"
                onClick={handleMenuClose}
              >
                <AccountCircleIcon sx={{ mr: 1 }} /> User Management
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              startIcon={<DashboardIcon />}
            >
              Dashboard
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/upload"
              startIcon={<UploadIcon />}
            >
              Upload Research
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/view-content"
              startIcon={<VisibilityIcon />}
            >
              View Content
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/user-management"
              startIcon={<AccountCircleIcon />}
            >
              User Management
            </Button>
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
          {/* Wallet Section */}
          {isConnected ? (
            <>
              <Tooltip title="Wallet Options">
                <IconButton onClick={handleWalletMenuOpen} color="inherit">
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    {formatAddress(walletAddress)[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={walletMenuAnchorEl}
                open={Boolean(walletMenuAnchorEl)}
                onClose={handleWalletMenuClose}
              >
                <MenuItem disabled>{formatAddress(walletAddress)}</MenuItem>
                <MenuItem onClick={handleReconnect}>Reconnect</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleReconnect}
              startIcon={<WalletIcon />}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
