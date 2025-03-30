import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Grid, Button, ButtonGroup, Typography } from "@mui/material";

const HomePage = () => {
  const [roomCode, setRoomCode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomCode = async () => {
      try {
        const response = await fetch("/api/user-in-room");
        const data = await response.json();
        console.log("API response:", data); // Debug log

        if (data.code) {
          setRoomCode(data.code);
          console.log("Redirecting to room:", data.code); // Debug log
          navigate(`/room/${data.code}`); // Redirect to room
        }
      } catch (error) {
        console.error("Error fetching room code:", error);
      }
    };

    fetchRoomCode();
  }, [navigate]);

  const renderHomePage = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} align="center">
        <Typography variant="h3" component="h3">
          House Party
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <ButtonGroup disableElevation variant="contained" color="primary">
          <Button color="primary" to="/join" component={Link}>
            Join a Room
          </Button>
          <Button color="secondary" to="/create" component={Link}>
            Create a Room
          </Button>
        </ButtonGroup>
      </Grid>
    </Grid>
  );

  // Render home page or redirect logic
  return roomCode ? null : renderHomePage();
};

export default HomePage;
