import React, { useContext, useState, useEffect } from "react";
import { Container, Image, Button } from "react-bootstrap";
import { FaSignInAlt, FaUser } from "react-icons/fa"; // Default icon
import { AuthContext } from "../utility/AuthContext";
import LoadingScreen from "../LoadingScreen";
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import { useNavigate } from "react-router-dom";
import sigin from '../assets/rb_936.png';  // Make sure this path is correct
import MainNavbar from "../pages/MainNavbar";

import { useTheme } from "../ThemeContext";

const AppNavbar = () => {
  const { user, signInWithGoogle, logOut, isLoading } = useContext(AuthContext);
  const [photoURL, setPhotoURL] = useState(null);


  const { theme } = useTheme();

  const navigate = useNavigate();
 
  const { overallProgress  } = useQuestions(); // Get totalQuestions from the custom hook

  const handleSignIn = async () => {
    const result = await signInWithGoogle(); // Wait for the function to complete
    if (result.success) {
      console.log('Sign-in successful:', result.user);
      navigate("/home");
      // Proceed to the next step, e.g., navigate to a different page or update UI
    } else {
      console.error('Sign-in failed:', result.error);
      // Show an error message to the user
      alert(`Sign-in failed: ${result.error}`);
    }
  };
  

  
  // Set photoURL after user is authenticated
  useEffect(() => {
    if (user) {
      setPhotoURL(user.photoURL); // Update the photoURL when user is signed in
    }
  }, [user]);

  // Fallback handler when the profile photo fails to load
  const handleImageError = () => {
    setPhotoURL(null); // Fallback to default icon when the image fails to load
  };

  // Custom RGB values for light and dark themes
  const themeStyles = {
    light: {
      backgroundColor: "rgb(255, 255, 255)", // Light theme background
      textColor: "rgb(0, 0, 0)", // Dark text for light theme
      buttonColor: "rgb(0, 123, 255)", // Primary button color in light theme
    },
    dark: {
      backgroundColor: "rgb(29, 30, 35)", // Dark theme background
      textColor: "rgb(255, 255, 255)", // Light text for dark theme
      buttonColor: "rgb(52, 58, 64)", // Dark button color for dark theme
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <>
    <div className="container-fluid d-flex flex-column" style={{ height: '100vh', width: '100%', margin: 0, padding: 0 , backgroundColor: currentTheme.backgroundColor }}>

        {/* Upper div */}
        <div style={{ backgroundColor: currentTheme.backgroundColor ,  margin: 0, padding: 0 }}>
          <MainNavbar />
        </div>

        {/* Lower div */}
        <div className="flex-grow-1 p-4" style={{ backgroundColor: currentTheme.backgroundColor }}>
          <div className="container-fluid p-0" style={{ height: '100%' }}>
            <div className="row m-0" style={{ height: '100%' }}>
              {/* Left side with image */}
              <div
                className="col-md-6 p-0"
                style={{
                  backgroundImage: `url(${sigin })`,  // Correct background image syntax
                  backgroundSize: 'cover',  // Make the image cover the div
                  backgroundPosition: 'center', // Center the image
                  height: '100%', // Ensure the height takes up the full viewport
                }}
              >
              </div>

              {/* Right side */}
              <div className="col-md-6 p-0" style={{ backgroundColor: currentTheme.backgroundColor, height: '100%' }}>
                {/* Main Content for User Authentication */}
                <Container
                  className="d-flex flex-column justify-content-center align-items-center mt-4 text-center"
                  style={{ height: '100%' }} // Full viewport height for vertical centering
                >
                  {isLoading ? (
                    <LoadingScreen />
                  ) : user ? (
                    <div className="user-info">
                      <div className="profile-section mb-4">
                        {photoURL ? (
                          <Image
                            src={photoURL}
                            alt="Profile"
                            roundedCircle
                            width={120}
                            height={120}
                            className="mb-3 border border-secondary"
                            onError={handleImageError} // Fallback if image load fails
                          />
                        ) : (
                          <FaUser size={120} className="mb-3 text-secondary" /> // Default icon if photoURL is not available
                        )}
                        <h3 className="mt-2" style={{ color: currentTheme.textColor }}>
                          {user.displayName || "User"}
                        </h3>
                        <p  style={{ color: currentTheme.textColor }}>
  {`Problems Solved: ${Math.round(overallProgress)}%`}
</p>

                      </div>
                      <Button variant="outline-dark" onClick={logOut} style={{ backgroundColor: currentTheme.buttonColor , color: currentTheme.textColor }}>
                        Log Out
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <h2 style={{ color : currentTheme.textColor} }>Please Sign In to Continue</h2>
                      <Button variant="outline-dark" onClick={handleSignIn} style={{ backgroundColor: currentTheme.buttonColor , color: currentTheme.textColor }}>
                        <FaSignInAlt /> Sign In with Google
                      </Button>
                    </div>
                  )}
                </Container>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppNavbar;
