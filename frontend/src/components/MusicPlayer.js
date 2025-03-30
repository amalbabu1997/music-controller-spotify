import React from "react";
import { Grid, Typography, Card, CardContent, IconButton, LinearProgress } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import PauseIcon from "@mui/icons-material/Pause";

const MusicPlayer = ({ song }) => {
  if (!song || !song.title) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
        <Typography variant="h6">No song is currently playing</Typography>
      </Grid>
    );
  }

  const pauseSong = async () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    await fetch("/spotify/pause-song", requestOptions);
  };

  const playSong = async () => {
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    };
    await fetch("/spotify/play-song", requestOptions);
  };

  const skipSong = async () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    await fetch("/spotify/skip-song", requestOptions);
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
      <Grid item xs={12} sm={8} md={6}>
        <Card sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 3, borderRadius: 3 }}>
          <CardContent sx={{ width: "100%" }}>
            <Grid container spacing={2} justifyContent="center" alignItems="center">

              {/* Song Title */}
              <Grid item xs={12} align="center">
                <Typography variant="h6">Now Playing: {song.title}</Typography>
              </Grid>

              {/* Album Image */}
              <Grid item xs={12} align="center">
                <img src={song.album_image} alt="Album Cover" width="200" style={{ borderRadius: "8px" }} />
              </Grid>

              {/* Artist Name */}
              <Grid item xs={12} align="center">
                <Typography variant="h6">Artist: {song.artist}</Typography>
              </Grid>

              {/* Controls */}
              <Grid item xs={12} align="center">
                <IconButton onClick={pauseSong}>
                  <PauseIcon />
                </IconButton>
                <IconButton onClick={playSong}>
                  <PlayArrowIcon />
                </IconButton>
                <IconButton onClick={skipSong}>
                  <SkipNextIcon />
                </IconButton>
                <Typography variant="h6">
                  Votes: {song.votes} / {song.votes_required}  {/* ✅ Corrected Vote Display */}
                </Typography>
              </Grid>

              {/* Progress Bar */}
              <Grid item xs={12}>
                <LinearProgress
                  variant="determinate"
                  value={(song.progress_ms / song.duration_ms) * 100}
                  sx={{ borderRadius: 5, height: 10 }}
                />
              </Grid>

            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default MusicPlayer;
