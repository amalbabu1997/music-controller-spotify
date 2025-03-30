import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Grid,
  Typography,
  TextField,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
  Alert,
} from "@mui/material";

const CreateRoomPage = ({
  update = false,
  roomCode = null,
  updateCallback,
}) => {
  const [guestCanPause, setGuestCanPause] = useState(true);
  const [votesToSkip, setVotesToSkip] = useState(2);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newRoomCode, setNewRoomCode] = useState(null); // Store created room code
  const [roomUpdated, setRoomUpdated] = useState(false); // Track if room is updated
  const navigate = useNavigate();

  // Fetch existing room data if updating
  useEffect(() => {
    if (update && roomCode) {
      fetch(`/api/get-room?code=${roomCode}`)
        .then((response) => response.json())
        .then((data) => {
          setGuestCanPause(data.guest_can_pause);
          setVotesToSkip(data.votes_to_skip);
        });
    }
  }, [update, roomCode]);

  // Handle input changes
  const handleVotesChange = (e) => setVotesToSkip(e.target.value);
  const handleGuestCanPauseChange = (e) =>
    setGuestCanPause(e.target.value === "true");

  // Handle creating a room
  const handleCreateRoom = () => {
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
        setSuccessMsg("Room created successfully!");
        setErrorMsg("");
        setNewRoomCode(data.code); // Set the new room code

        // Wait for 2 seconds before navigating
        setTimeout(() => {
          navigate(`/room/${data.code}`); // Redirect to the new room
        }, 2000); // Adjust time as needed
      })
      .catch(() => {
        setSuccessMsg("");
        setErrorMsg("Error creating room...");
      });
  };

  // Handle updating a room
  const handleUpdateRoom = () => {
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
      .then((response) => {
        return response.json().then((data) => ({
          status: response.status,
          body: data,
        }));
      })
      .then(({ status, body }) => {
        console.log("Status Code:", status); // Log the status code
        console.log("Response Body:", body); // Log the response body

        if (status === 200) {
          setSuccessMsg("Room updated successfully!");
          setErrorMsg(""); // Clear error message if success
          setRoomUpdated(true); // Mark room update as successful

          // Display success message for a short time before redirecting
          setTimeout(() => {
            // Navigate after success message display
            navigate(`/room/${roomCode}`); // Redirect to the updated room page
            // Call updateCallback only after redirection
            updateCallback();
          }, 2000); // Adjust this time as needed for user to see the success message
        } else {
          setSuccessMsg(""); // Clear success message if error
          setErrorMsg(body.message || "Error updating room...");
        }
      })
      .catch((error) => {
        console.error("Error:", error); // Log the error in case of failure
        setSuccessMsg("");
        setErrorMsg("Error updating room...");
      });
  };

  return (
    <Grid container spacing={1}>
      {/* Success/Error Messages */}
      <Grid item xs={12} align="center">
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

      {/* Title */}
      <Grid item xs={12} align="center">
        <Typography variant="h4">
          {update ? "Update Room" : "Create Room"}
        </Typography>
      </Grid>

      {/* Guest Control Selection */}
      <Grid item xs={12} align="center">
        <FormControl component="fieldset">
          <FormHelperText>Guest Control of Playback State</FormHelperText>
          <RadioGroup
            row
            value={guestCanPause.toString()}
            onChange={handleGuestCanPauseChange}
          >
            <FormControlLabel
              value="true"
              control={<Radio color="primary" />}
              label="Play/Pause"
              labelPlacement="bottom"
            />
            <FormControlLabel
              value="false"
              control={<Radio color="secondary" />}
              label="No Control"
              labelPlacement="bottom"
            />
          </RadioGroup>
        </FormControl>
      </Grid>

      {/* Votes to Skip Input */}
      <Grid item xs={12} align="center">
        <FormControl>
          <TextField
            type="number"
            value={votesToSkip}
            onChange={handleVotesChange}
            inputProps={{ min: 1 }}
          />
          <FormHelperText>Votes Required to Skip Song</FormHelperText>
        </FormControl>
      </Grid>

      {/* Buttons */}
      {update ? (
        // Update Button
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateRoom}
          >
            Update Room
          </Button>
        </Grid>
      ) : (
        <Grid item xs={12} align="center">
          {/* Create Room Button */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateRoom}
          >
            Create Room
          </Button>
        </Grid>
      )}

      {/* Back Button */}
      {!update && (
        <Grid item xs={12} align="center">
          <Button color="secondary" variant="contained" component={Link} to="/">
            Back
          </Button>
        </Grid>
      )}
    </Grid>
  );
};

export default CreateRoomPage;
