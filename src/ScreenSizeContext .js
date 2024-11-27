import React, { createContext, useState, useEffect } from 'react';

// Create a context to provide screen size info
export const ScreenSizeContext = createContext();

// ScreenSizeProvider component to provide screen size state to the app
export const ScreenSizeProvider = ({ children }) => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Update screenWidth when the window is resized
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ScreenSizeContext.Provider value={{ screenWidth }}>
      {screenWidth < 968 ? (
        <div style={styles.messageContainer}>
          <p style={styles.messageText}>AlgoMitra cannot be displayed on small screens.</p>
        </div>
      ) : (
        children // Render children (main app content) if the screen is large enough
      )}
    </ScreenSizeContext.Provider>
  );
};

// Inline styles to enhance UI
const styles = {
  messageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    // backgroundColor: '#f8d7da',
    backgroundColor: '#d8e8dc',
    color: '#721c24',
    padding: '20px',
    textAlign: 'center',
  },
  messageText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
};
