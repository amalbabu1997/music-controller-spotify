// ThemeContext.js - Create this new file
import React, { createContext, useState, useContext } from "react";
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";

const ThemeContext = createContext();

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
};

const THEME_CONFIGS = {
  dark: {
    palette: {
      mode: "dark",
      primary: { main: "#1DB954" },
      secondary: { main: "#191414" },
      background: { default: "#121212", paper: "#1e1e1e" },
      text: { primary: "#ffffff" },
    },
  },
  light: {
    palette: {
      mode: "light",
      primary: { main: "#1DB954" },
      secondary: { main: "#f0f0f0" },
      background: { default: "#ffffff", paper: "#f5f5f5" },
      text: { primary: "#000000" },
    },
  },
  blue: {
    palette: {
      mode: "dark",
      primary: { main: "#0066cc" },
      secondary: { main: "#0052a3" },
      background: { default: "#0a1428", paper: "#132752" },
      text: { primary: "#e0e0e0" },
    },
  },
  grey: {
    palette: {
      mode: "dark",
      primary: { main: "#757575" },
      secondary: { main: "#424242" },
      background: { default: "#212121", paper: "#303030" },
      text: { primary: "#ffffff" },
    },
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState("dark");

  const muiTheme = createTheme({
    ...THEME_CONFIGS[themeName],
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h3: { fontWeight: 700, letterSpacing: 2 },
      h4: { fontWeight: 600 },
    },
  });

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, THEME_CONFIGS }}>
      <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
