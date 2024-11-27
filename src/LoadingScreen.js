import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import { MoonLoader } from 'react-spinners';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
        flexDirection: 'column',
      }}
    >
      {/* You can replace the CircularProgress with a different animation */}
      <MoonLoader size={50} color="#3f51b5" />
      <Typography variant="h6" sx={{ marginTop: 2, color: '#3f51b5' }}>
        Loading, please wait...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
