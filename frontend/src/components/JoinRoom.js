import React, { useState } from "react";
import { TextField, Button, Grid, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

const JoinRoom = () => {
  const [roomDetails, setRoomDetails] = useState({
    roomCode: "",
    error: "",
  });

  const navigate = useNavigate();

  const roomButtonPressed = async () => {
    if (roomDetails.roomCode.trim() === "") {
      setRoomDetails((prevDetails) => ({
        ...prevDetails,
        error: "Room Code cannot be empty.",
      }));
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: roomDetails.roomCode,
      }),
    };

    try {
      const response = await fetch(`/api/join-room`, requestOptions);
      if (response.ok) {
        navigate(`/room/${roomDetails.roomCode}`);
      } else {
        const errorData = await response.json();
        setRoomDetails((prevDetails) => ({
          ...prevDetails,
          error: errorData.error || "Room not found.",
        }));
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
      setRoomDetails((prevDetails) => ({
        ...prevDetails,
        error: "An error occurred. Please try again.",
      }));
    }
  };

  return (
    <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Join a Room
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <TextField
          error={roomDetails.error !== ""}
          label="Code"
          placeholder="Enter Room Code here"
          value={roomDetails.roomCode}
          helperText={roomDetails.error}
          variant="outlined"
          onChange={(e) => {
            const value = e.target.value;
            setRoomDetails((prevDetails) => ({
              ...prevDetails,
              roomCode: value,
              error: value.trim() === "" ? "Room Code cannot be empty." : "",
            }));
          }}
        />
      </Grid>
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={roomButtonPressed}
          style={{ marginRight: "10px" }}
        >
          Enter Room
        </Button>
        <Button variant="contained" color="secondary" to="/" component={Link}>
          Back
        </Button>
      </Grid>
    </Grid>
  );
};

export default JoinRoom;
