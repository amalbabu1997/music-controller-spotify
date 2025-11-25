import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
  Alert,
  Container,
  Grid,
} from "@mui/material";
import PublicIcon from "@mui/icons-material/Public"; // ← GLOBE ICON

const CreateRoomPage = ({
  update = false,
  roomCode = null,
  updateCallback,
}) => {
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (update && roomCode) {
      fetch(`/api/get-room?code=${roomCode}`)
        .then((response) => response.json())
        .then((data) => {
          setGuestCanPause(data.guest_can_pause);
          setVotesToSkip(data.votes_to_skip);
        })
        .catch((error) => console.error("Error loading room data:", error));
    }
  }, [update, roomCode]);

  const handleVotesChange = (e) => setVotesToSkip(e.target.value);
  const handleGuestCanPauseChange = (e) =>
    setGuestCanPause(e.target.value === "true");

  const handleCreateRoom = () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
      }),
    };

    fetch("/api/create-room", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setSuccessMsg("Room created! Redirecting...");
        setLoading(false);
        navigate(`/room/${data.code}`, { replace: true });
      })
      .catch((error) => {
        setErrorMsg("Error creating room. Please try again.");
        setSuccessMsg("");
        setLoading(false);
      });
  };

  const handleUpdateRoom = () => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const requestOptions = {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        votes_to_skip: votesToSkip,
        guest_can_pause: guestCanPause,
        code: roomCode,
      }),
    };

    fetch("/api/update-room", requestOptions)
      .then((response) =>
        response
          .json()
          .then((data) => ({ status: response.status, body: data }))
      )
      .then(({ status, body }) => {
        if (status === 200) {
          setSuccessMsg("Room updated! Redirecting...");
          setErrorMsg("");
          setLoading(false);
          navigate(`/room/${roomCode}`, { replace: true });
          updateCallback?.();
        } else {
          setErrorMsg(body.message || "Error updating room.");
          setSuccessMsg("");
          setLoading(false);
        }
      })
      .catch((error) => {
        setErrorMsg("Error updating room. Please try again.");
        setSuccessMsg("");
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/static/images/create-room-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        position: "relative",
        overflow: "hidden",

        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: 0,
        },
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
          }}
        >
          {/* Success/Error Messages */}
          <Grid item xs={12}>
            <Collapse in={Boolean(successMsg || errorMsg)}>
              {successMsg && (
                <Alert severity="success" onClose={() => setSuccessMsg("")}>
                  {successMsg}
                </Alert>
              )}
              {errorMsg && (
                <Alert severity="error" onClose={() => setErrorMsg("")}>
                  {errorMsg}
                </Alert>
              )}
            </Collapse>
          </Grid>

          {/* Title with Icon */}
          <Grid item xs={12} align="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
            >
              {/* PARTY GLOBE ICON - RESIZED */}
              <PublicIcon
                sx={{
                  fontSize: "4rem", // Size of icon (3rem = 48px)
                  color: "#1DB954", // Green color
                  animation: "spin 3s linear infinite",
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: "#1DB954",
                  mb: 0,
                  fontSize: "4rem",
                }}
              >
                {update ? "Update Room" : "Create Room"}
              </Typography>
            </Box>
          </Grid>

          {/* Guest Control Selection */}
          <Grid item xs={12} align="center">
            <FormControl component="fieldset">
              <FormHelperText
                sx={{
                  mb: 1.5,
                  textAlign: "center",
                  color: "#fff",
                  fontSize: "1.6rem ",
                }}
              >
                Guest Control of Playback
              </FormHelperText>
              <RadioGroup
                row
                value={guestCanPause.toString()}
                onChange={handleGuestCanPauseChange}
                sx={{ justifyContent: "center" }}
              >
                <FormControlLabel
                  value="true"
                  control={
                    <Radio
                      color="primary"
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        "&.Mui-checked": {
                          color: "#1DB954",
                        },
                      }}
                    />
                  }
                  label="Play/Pause"
                  sx={{ color: "#fff", mr: 3 }}
                />
                <FormControlLabel
                  value="false"
                  control={
                    <Radio
                      color="primary"
                      sx={{
                        color: "rgba(255, 255, 255, 0.5)",
                        "&.Mui-checked": {
                          color: "#1DB954",
                        },
                      }}
                    />
                  }
                  label="No Control"
                  sx={{ color: "#fff" }}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* Votes to Skip Input */}
          <Grid item xs={12} align="center">
            <FormControl fullWidth>
              <FormHelperText
                sx={{
                  textAlign: "center",
                  color: "#fff",
                  mb: 1,
                  fontSize: "1.6rem ",
                }}
              >
                Votes Required to Skip Song
              </FormHelperText>
              <TextField
                type="number"
                value={votesToSkip}
                onChange={handleVotesChange}
                inputProps={{ min: 1, max: 10 }}
                disabled={loading}
                variant="outlined"
                sx={{
                  maxWidth: "200px",
                  margin: "0 auto",
                  display: "block",
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
                  "& .MuiOutlinedInput-input": {
                    color: "#fff",
                    textAlign: "center",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                  },
                }}
              />
            </FormControl>
          </Grid>

          {/* Buttons */}
          <Grid
            item
            xs={12}
            sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={update ? handleUpdateRoom : handleCreateRoom}
              disabled={loading}
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
              {loading
                ? update
                  ? "Updating..."
                  : "Creating..."
                : update
                ? "Update Room"
                : "Create Room"}
            </Button>

            {!update && (
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
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CreateRoomPage;
