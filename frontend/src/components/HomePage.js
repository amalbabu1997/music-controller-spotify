import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Grid, Button, Typography, Box, Container } from "@mui/material";
import { useThemeContext } from "./ThemeContext";

const HomePage = () => {
  const [showHome, setShowHome] = useState(true);
  const navigate = useNavigate();
  const { themeName } = useThemeContext();

  useEffect(() => {
    console.log(" HomePage mounted");

    const checkUserInRoom = async () => {
      try {
        const response = await fetch("/api/user-in-room");
        const data = await response.json();
        console.log(" API response:", data);

        if (data.code) {
          console.log(" User in room, navigating to:", data.code);
          setShowHome(false);
          navigate(`/room/${data.code}`, { replace: true });
        } else {
          console.log(" No existing room, show home");
          setShowHome(true);
        }
      } catch (error) {
        console.error(" Error checking room:", error);
        setShowHome(true);
      }
    };

    checkUserInRoom();
  }, [navigate]);

  if (!showHome) {
    return null;
  }

  const getBackgroundGradient = () => {
    switch (themeName) {
      case "light":
        return "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 50%, #ffffff 100%)";
      case "blue":
        return "linear-gradient(135deg, #0a1428 0%, #0d2b4e 50%, #1a4d7a 100%)";
      case "grey":
        return "linear-gradient(135deg, #212121 0%, #383838 50%, #4a4a4a 100%)";
      default:
        return "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)";
    }
  };

  const getAccentColor = () => {
    switch (themeName) {
      case "blue":
        return "rgba(0, 102, 204, 0.1)";
      case "grey":
        return "rgba(117, 117, 117, 0.1)";
      case "light":
        return "rgba(29, 185, 84, 0.08)";
      default:
        return "rgba(29, 185, 84, 0.1)";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: getBackgroundGradient(),
      }}
    >
      {/* Animated background blobs */}
      <Box
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: getAccentColor(),
          top: "-100px",
          left: "-100px",
          animation: "float 6s ease-in-out infinite",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: getAccentColor(),
          bottom: "-50px",
          right: "-50px",
          animation: "float 8s ease-in-out infinite reverse",
        }}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Main content */}
      <Container maxWidth="sm">
        <Grid
          container
          spacing={4}
          sx={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          {/* Title */}
          <Grid item xs={12}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                letterSpacing: 3,
                background: "linear-gradient(45deg, #1DB954, #1ed760)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                mb: 1,
              }}
            >
              HOUSE PARTY
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#defc48ff",
                opacity: 0.8,
                mb: 4,
                fontWeight: 300,
              }}
            >
              Stream music together with your friends
            </Typography>
          </Grid>

          {/* Join Room Button */}
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              component={Link}
              to="/join"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                py: 2,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                },
              }}
            >
              Join Room
            </Button>
          </Grid>

          {/* Create Room Button */}
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              component={Link}
              to="/create"
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                py: 2,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                },
              }}
            >
              + Create Room
            </Button>
          </Grid>

          {/* Footer */}
          <Grid item xs={12}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.6, color: "#edf24fff" }}
            >
              Connect with friends and enjoy music together
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
