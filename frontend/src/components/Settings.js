import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useThemeContext } from "./ThemeContext";

const SettingsDialog = ({
  open,
  defaultVotes,
  defaultGuestCanPause,
  onSave,
  onCancel,
}) => {
  const [votes, setVotes] = useState(defaultVotes);
  const [canPause, setCanPause] = useState(defaultGuestCanPause);
  const { themeName, setThemeName } = useThemeContext();

  // Reset fields when dialog reopens
  useEffect(() => {
    setVotes(defaultVotes);
    setCanPause(defaultGuestCanPause);
  }, [defaultVotes, defaultGuestCanPause]);

  const handleSubmit = () => {
    onSave({ votes, canPause });
  };

  const THEME_OPTIONS = [
    { value: "dark", label: " Dark", icon: "🌙" },
    { value: "light", label: " Light", icon: "☀️" },
    { value: "blue", label: " Blue", icon: "🔵" },
    { value: "grey", label: " Grey", icon: "⚙️" },
  ];

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: 3,
          padding: 2,
          minWidth: 400,
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.5rem",
          mb: 2,
        }}
      >
        Room Settings
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Votes to Skip Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Votes to Skip
          </Typography>
          <TextField
            margin="dense"
            type="number"
            fullWidth
            variant="outlined"
            value={votes}
            onChange={(e) => setVotes(e.target.value)}
            inputProps={{ min: 1, max: 10 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {/* Guest Control Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Guest Control
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={canPause}
                onChange={(e) => setCanPause(e.target.checked)}
                color="primary"
              />
            }
            label={
              canPause ? "Guests can play/pause" : "Guests have no control"
            }
          />
        </Box>

        {/* Theme Selector Section */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Theme
          </Typography>
          <ToggleButtonGroup
            value={themeName}
            exclusive
            onChange={(event, newTheme) => {
              if (newTheme !== null) {
                setThemeName(newTheme);
              }
            }}
            fullWidth
            sx={{
              gap: 1,
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              "& .MuiToggleButton-root": {
                borderRadius: 2,
                border: "2px solid rgba(255, 255, 255, 0.2)",
                padding: "12px",
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  borderColor: "primary.main",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "primary.main",
                  },
                },
                "&:hover": {
                  borderColor: "primary.main",
                },
              },
            }}
          >
            {THEME_OPTIONS.map((theme) => (
              <ToggleButton key={theme.value} value={theme.value}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "1.5rem" }}>
                    {theme.icon}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                    {theme.value.charAt(0).toUpperCase() + theme.value.slice(1)}
                  </Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3, pt: 2 }}>
        <Button onClick={onCancel} color="error" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          sx={{
            px: 4,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsDialog;
