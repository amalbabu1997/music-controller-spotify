import React, { useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  Container,
} from "@mui/material";
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      }}
    >
      {/* Animated background blobs */}
      <Box
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(29, 185, 84, 0.1)",
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
          background: "rgba(29, 185, 84, 0.05)",
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

      <Container maxWidth="sm">
        <Grid
          container
          spacing={3}
          sx={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
          }}
        >
          {/* Title */}
          <Grid item xs={12}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                letterSpacing: 2,
                color: "#1DB954",
                mb: 2,
              }}
            >
              Join a Room
            </Typography>
          </Grid>

          {/* Text Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              error={roomDetails.error !== ""}
              label="Room Code"
              placeholder="Enter Room Code here"
              value={roomDetails.roomCode}
              helperText={roomDetails.error}
              variant="outlined"
              size="medium"
              onChange={(e) => {
                const value = e.target.value;
                setRoomDetails((prevDetails) => ({
                  ...prevDetails,
                  roomCode: value,
                  error:
                    value.trim() === "" ? "Room Code cannot be empty." : "",
                }));
              }}
              sx={{
                // Style the label (caption)
                "& .MuiInputLabel-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "1rem",
                  "&.Mui-focused": {
                    color: "#1DB954",
                  },
                  "&.MuiInputLabel-shrink": {
                    // When label floats up
                    backgroundColor: "rgba(15, 12, 41, 0.9)", // Match your background
                    padding: "0 8px",
                    marginLeft: "-4px",
                  },
                },

                // Style the input box
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  border: "2px solid rgba(29, 185, 84, 0.5)",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    border: "2px solid #1DB954",
                    backgroundColor: "rgba(29, 185, 84, 0.1)",
                  },
                  "&.Mui-focused": {
                    border: "2px solid #1DB954",
                    backgroundColor: "rgba(29, 185, 84, 0.15)",
                    boxShadow: "0 0 10px rgba(29, 185, 84, 0.3)",
                  },
                },

                // Style the text inside
                "& .MuiOutlinedInput-input": {
                  color: "#fff",
                  fontSize: "1.1rem",
                  padding: "14px 16px",
                  "&::placeholder": {
                    color: "rgba(255, 255, 255, 0.5)",
                    opacity: 1,
                  },
                },

                // Style the error message (helper text)
                "& .MuiFormHelperText-root": {
                  color: "#ff6b6b",
                  marginTop: "8px",
                },
              }}
            />
          </Grid>

          {/* Buttons */}
          <Grid
            item
            xs={12}
            sx={{ display: "flex", gap: 2, justifyContent: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={roomButtonPressed}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
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
              Enter Room
            </Button>
            <Button
              variant="outlined"
              to="/"
              component={Link}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
                transition: "all 0.3s ease",
                color: "#fff",
                borderColor: "#fff",
                "&:hover": {
                  transform: "translateY(-3px)",
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Light white on hover
                },
              }}
            >
              Back
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default JoinRoom;
