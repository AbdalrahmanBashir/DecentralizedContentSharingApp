import React from "react";
import { Button } from "@mui/material";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/verify", { replace: true });
  };

  return (
    <Button variant="outlined" color="error" onClick={handleLogout}>
      Logout
    </Button>
  );
};

export default LogoutButton;
