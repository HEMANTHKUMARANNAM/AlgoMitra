import React, { useContext, useState, useEffect } from "react";
import { Navbar, Nav, Container, Image, Button } from "react-bootstrap";
import { FaSignInAlt, FaUser } from "react-icons/fa"; // Default icon
import { AuthContext } from "../utility/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../LoadingScreen";
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import { name } from "../constants";

import sigin from '../assets/sigin.jpg';  // Make sure this path is correct

const AppNavbar = () => {
  const { user, signInWithGoogle, logOut, isLoading } = useContext(AuthContext);
  const [photoURL, setPhotoURL] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const [progress, setProgress] = useState(0);

  const { totalQuestions } = useQuestions(); // Get totalQuestions from the custom hook

  // Watch for progress changes (total questions)
  useEffect(() => {
    if (totalQuestions !== undefined) {
      const updatedProgress = totalQuestions * 100; // Convert to percentage
      setProgress(updatedProgress);
    }
  }, [totalQuestions]);

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

  return (
    <>

<div className="container-fluid d-flex flex-column" style={{ height: '100vh' }}>
      {/* Upper div */}
      <div className="bg text-white p-4">
         {/* Navbar */}
      <Navbar bg="light" variant="light" expand="lg" style={{ zIndex: 10 }}>
        <Container>
          <Navbar.Brand className="text-dark">{name}</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={() => navigate("/home")} className="text-dark">Home</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      </div>
      
      {/* Lower div */}
      <div className="bg text-white flex-grow-1 p-4">
      <div className="container-fluid p-0" style={{ height: '100%' }}>
        <div className="row m-0" style={{ height: '100%' }}>
          {/* Left side with image */}
          <div
            className="col-md-6 p-0"
            style={{
              backgroundImage: `url(${sigin})`,  // Correct background image syntax
              backgroundSize: 'cover',  // Make the image cover the div
              backgroundPosition: 'center', // Center the image
              height: '100', // Ensure the height takes up the full viewport
            }}
          >
    
          </div>

          {/* Right side */}
          <div className="col-md-6 p-0" style={{ backgroundColor: '#e9ecef', height: '100%' }}>
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
        <h3 className="mt-2 text-dark">{user.displayName || "User"}</h3>
        <p className="text-muted">
          Problems Solved: <strong>{progress}%</strong>
        </p>
        {/* Example percentage */}
      </div>
      <Button variant="outline-dark" onClick={logOut}>
        Log Out
      </Button>
    </div>
  ) : (
    <div>
      <h2 className="text-dark">Please Sign In to Continue</h2>
      <Button variant="outline-dark" onClick={signInWithGoogle}>
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
