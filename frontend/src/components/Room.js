import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Grid,
  Button,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Container,
} from "@mui/material";
import MusicPlayer from "./MusicPlayer";
import SettingsDialog from "./Settings";

const Room = ({ leaveRoomCallback }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch room details
  const getRoomDetails = async () => {
    console.log(" getRoomDetails() called with roomCode:", roomCode);
    try {
      const response = await fetch(`/api/get-room?code=${roomCode}`);
      console.log(" Response status:", response.status);

      if (!response.ok) {
        console.warn(" /api/get-room not OK - Status:", response.status);
        leaveRoomCallback?.();
        navigate("/");
        return;
      }

      const text = await response.text();
      console.log(" Raw text from API:", text);
      const data = JSON.parse(text);
      console.log(" Room API Response:", data);
      console.log(" Host Status from API:", data.is_host);

      console.log(" Setting isHost to:", data.is_host);
      setIsHost(data.is_host);
      setVotesToSkip(data.votes_to_skip || 2);
      setGuestCanPause(data.guest_can_pause || false);

      if (data.is_host) {
        console.log(" User is host, authenticating Spotify...");
        authenticateSpotify();
      } else {
        console.log(" User is NOT host");
        setLoading(false);
      }
    } catch (error) {
      console.error(" Error fetching room details:", error);
      setLoading(false);
    }
  };

  // Spotify authentication (host only)
  const authenticateSpotify = async () => {
    try {
      const response = await fetch("/spotify/is_authenticated");
      const data = await response.json();

      if (data.status) {
        console.log(" Spotify already authenticated");
        setSpotifyAuthenticated(true);
      } else {
        console.log(" Spotify not authenticated, redirecting to auth...");
        const authUrl = await fetch("/spotify/get-auth-url").then((r) =>
          r.json()
        );
        window.location.href = authUrl.url;
      }
    } catch (error) {
      console.error(" Error authenticating Spotify:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current song
  const getCurrentSong = async () => {
    try {
      const response = await fetch("/spotify/current-song");
      if (!response.ok) {
        console.warn(` HTTP error! Status: ${response.status}`);
        return;
      }

      const text = await response.text();
      if (!text) {
        setSong(null);
        return;
      }

      const data = JSON.parse(text);
      if (!data || Object.keys(data).length === 0) {
        setSong(null);
      } else {
        console.log(" Current song:", data);
        setSong(data);
      }
    } catch (error) {
      console.error(" Error fetching current song:", error);
    }
  };

  // Leave room
  const leaveButtonPressed = async () => {
    try {
      await fetch("/api/leave-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(" Error leaving room:", error);
    }
    leaveRoomCallback?.();
    navigate("/");
  };

  // Update settings
  const handleSettingsSave = async ({ newVotesToSkip, newGuestCanPause }) => {
    try {
      const response = await fetch("/api/update-room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: roomCode,
          votes_to_skip: Number(newVotesToSkip),
          guest_can_pause: Boolean(newGuestCanPause),
        }),
      });

      if (!response.ok) {
        alert(" Failed to update settings. Try again.");
        return;
      }

      setVotesToSkip(Number(newVotesToSkip));
      setGuestCanPause(Boolean(newGuestCanPause));
      setShowSettings(false);
      alert(" Room settings updated successfully!");
    } catch (error) {
      console.error(" Error updating room settings:", error);
      alert(" Error saving settings.");
    }
  };

  // Lifecycle hooks
  useEffect(() => {
    console.log(" Room component mounted, roomCode:", roomCode);
    if (roomCode) {
      getRoomDetails();
      getCurrentSong();
    }
  }, [roomCode]);

  useEffect(() => {
    const interval = setInterval(getCurrentSong, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      >
        <CircularProgress sx={{ color: "#1DB954" }} size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
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

      <Container maxWidth="md">
        <Box sx={{ position: "relative", zIndex: 1, py: 4 }}>
          <Grid container spacing={3}>
            {/* Title */}
            <Grid item xs={12} align="center">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  letterSpacing: 2,
                  background: "linear-gradient(45deg, #1DB954, #1ed760)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  mb: 1,
                }}
              >
                MUSIC ROOM
              </Typography>
            </Grid>

            {/* Room Info Card */}
            <Grid item xs={12}>
              <Card
                sx={{
                  background: "rgba(30, 30, 30, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(29, 185, 84, 0.3)",
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    {/* Room Code */}
                    <Grid item xs={12} sm={6} align="center">
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#888", mb: 0.5 }}
                      >
                        Room Code
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: "#1DB954",
                          fontWeight: 700,
                          letterSpacing: 2,
                          fontFamily: "monospace",
                        }}
                      >
                        {roomCode}
                      </Typography>
                    </Grid>

                    {/* Host Status */}
                    <Grid item xs={12} sm={6} align="center">
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#888", mb: 0.5 }}
                      >
                        {isHost ? " Host" : " Guest"}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: isHost ? "#1DB954" : "#888",
                          fontWeight: 700,
                        }}
                      >
                        {isHost ? "You are Host" : "You are Guest"}
                      </Typography>
                    </Grid>

                    {/* Votes to Skip */}
                    <Grid item xs={12} sm={6} align="center">
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#888", mb: 0.5 }}
                      >
                        Votes to Skip
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#fff" }}>
                        {votesToSkip}
                      </Typography>
                    </Grid>

                    {/* Guest Pause Control */}
                    <Grid item xs={12} sm={6} align="center">
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#888", mb: 0.5 }}
                      >
                        Guest Control
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: guestCanPause ? "#1DB954" : "#ff6b6b",
                        }}
                      >
                        {guestCanPause ? "✅ Allowed" : "❌ Disabled"}
                      </Typography>
                    </Grid>

                    {/* Spotify Status */}
                    <Grid item xs={12} align="center">
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "#888", mb: 0.5 }}
                      >
                        Spotify Status
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: spotifyAuthenticated ? "#1DB954" : "#ff6b6b",
                        }}
                      >
                        {spotifyAuthenticated ? " Connected" : " Not Connected"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Music Player */}
            <Grid item xs={12}>
              <MusicPlayer song={song} />
            </Grid>

            {/* Action Buttons */}
            <Grid
              item
              xs={12}
              sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 2 }}
            >
              {isHost && (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    console.log(" Opening Settings Dialog");
                    setShowSettings(true);
                  }}
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
                  Settings
                </Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={leaveButtonPressed}
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
                Leave Room
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Settings Dialog */}
      {isHost && (
        <SettingsDialog
          open={showSettings}
          defaultVotes={votesToSkip}
          defaultGuestCanPause={guestCanPause}
          onCancel={() => setShowSettings(false)}
          onSave={({ votes, canPause }) =>
            handleSettingsSave({
              newVotesToSkip: votes,
              newGuestCanPause: canPause,
            })
          }
        />
      )}
    </Box>
  );
};

export default Room;
