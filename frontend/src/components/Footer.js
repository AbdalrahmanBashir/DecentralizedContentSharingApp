// Footer.js
import React from "react";
import { Box, Typography } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        textAlign: "center",
        bgcolor: "background.paper",
        boxShadow: "0 -1px 5px rgba(0, 0, 0, 0.1)",
        mt: "auto",
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} Decentralized Content Platform. All rights
        reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
