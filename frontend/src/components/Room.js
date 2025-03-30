import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Grid, Button, Typography } from "@mui/material";
import MusicPlayer from "./MusicPlayer"; // ✅ Import the new component

const Room = ({ leaveRoomCallback }) => {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const [votesToSkip, setVotesToSkip] = useState(2);
  const [guestCanPause, setGuestCanPause] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
  const [song, setSong] = useState(null);

  // Fetch Room Details
  const getRoomDetails = async () => {
    try {
        const response = await fetch(`/api/get-room?code=${roomCode}`);
        if (!response.ok) {
            leaveRoomCallback?.();
            navigate("/");
            return;
        }
        const data = await response.json();
        setVotesToSkip(data.votes_to_skip);
        setGuestCanPause(data.guest_can_pause);
        setIsHost(data.is_host);

        // 🔥 Ensure joined user stores `room_code`
        await fetch("/api/get-room?code=" + roomCode, {
            method: "GET",
            credentials: "include", //  Ensures session cookies are sent
        });

        if (data.is_host) {
            authenticateSpotify(); // Only the host should authenticate
        } else {
            console.log("[DEBUG] Joined user - No authentication needed.");
        }
    } catch (error) {
        console.error("Error fetching room details:", error);
    }
  };

  // Handle Spotify Authentication
  const authenticateSpotify = async () => {
    try {
      const response = await fetch("/spotify/is_authenticated");
      const data = await response.json();

      if (data.status) {
        setSpotifyAuthenticated(true);
        getCurrentSong(); //  Fetch song immediately after authentication
      } else {
        fetch("/spotify/get-auth-url")
          .then((response) => response.json())
          .then((data) => {
            window.location.href = data.url;
          });
      }
    } catch (error) {
      console.error("Error authenticating Spotify:", error);
    }
  };

  // Fetch Current Song
  const getCurrentSong = async () => {
    try {
        const response = await fetch("/spotify/current-song"); // All users call this endpoint
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const text = await response.text(); //  Convert to text first

        if (!text) {
            console.log("No song data received (empty response).");
            setSong(null);
            return;
        }

        const data = JSON.parse(text); //  Safely parse JSON
        if (!data || Object.keys(data).length === 0) {
            console.log("No song is currently playing.");
            setSong(null);
        } else {
            setSong(data);
        }
    } catch (error) {
        console.error("Error fetching current song:", error);
    }
  };

  // Leave Room Handler
  const leaveButtonPressed = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    await fetch("/api/leave-room", requestOptions);
    leaveRoomCallback?.();
    navigate("/");
  };

  // Fetch Room Details & Song Immediately When Room Loads
  useEffect(() => {
    getRoomDetails();
    getCurrentSong(); // 🔥 Fetch song immediately when the room loads
  }, [roomCode]);

  // Fetch Current Song Every 5 Seconds
  useEffect(() => {
    const interval = setInterval(getCurrentSong, 5000); // ✅ Fetch every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <Grid container spacing={1}>
      {/* Room Info */}
      <Grid item xs={12} align="center">
        <Typography variant="h4">Room Code: {roomCode}</Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6">Votes to Skip: {votesToSkip}</Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6">
          Guest Can Pause: {guestCanPause ? "Yes" : "No"}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6">Host: {isHost ? "Yes" : "No"}</Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6">
          Spotify Authenticated: {spotifyAuthenticated ? "Yes" : "No"}
        </Typography>
      </Grid>

      {/* Music Player Component */}
      {<MusicPlayer song={song} />}

      {/* Settings & Leave Room Buttons */}
      {isHost && (
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </Button>
        </Grid>
      )}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
  );
};

export default Room;
