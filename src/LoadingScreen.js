import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from './ThemeContext';

const LoadingScreen = () => {
  const {theme} = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)",
        flexDirection: 'column',
      }}
    >
      <GoogleLoader/>
      <Typography
        variant="h6"
        sx={{
          marginTop: 2,
          color: theme === "light" ? "#3f51b5" : "#bb86fc", // Adjust text color for light/dark themes
        }}
      >
        Loading, please wait...
      </Typography>
    </Box>
  );
};




const GoogleLoader = () => {
  const loaderStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
  };

  const dotStyle = {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    animation: "scale 1.4s infinite cubic-bezier(0.4, 0, 0.6, 1)",
  };

  const keyframes = `
    @keyframes scale {
      0%, 100% {
        transform: scale(1);
        opacity: 0.6;
      }
      50% {
        transform: scale(1.5);
        opacity: 1;
      }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={loaderStyle}>
        <div
          style={{
            ...dotStyle,
            backgroundColor: "#4285F4",
            animationDelay: "0s",
          }}
        ></div>
        <div
          style={{
            ...dotStyle,
            backgroundColor: "#EA4335",
            animationDelay: "0.2s",
          }}
        ></div>
        <div
          style={{
            ...dotStyle,
            backgroundColor: "#FBBC05",
            animationDelay: "0.4s",
          }}
        ></div>
        <div
          style={{
            ...dotStyle,
            backgroundColor: "#34A853",
            animationDelay: "0.6s",
          }}
        ></div>
      </div>
    </>
  );
};


export default LoadingScreen;
