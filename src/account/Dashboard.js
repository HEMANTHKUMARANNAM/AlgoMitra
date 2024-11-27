import React, { useContext, useState, useEffect } from "react";
import { Navbar, Nav, Container, Image, Button } from "react-bootstrap";
import { FaSignInAlt, FaUser } from "react-icons/fa"; // Default icon
import { AuthContext } from "../utility/AuthContext";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../LoadingScreen";
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import { name } from "../constants";

const AppNavbar = () => {
  const { user, signInWithGoogle, logOut, isLoading } = useContext(AuthContext);
  const [photoURL, setPhotoURL] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  const [progress, setProgress] = useState(0);

  const { totalQuestions} = useQuestions(); // Get totalQuestions from the custom hook

  



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
      {/* Navbar */}
      <Navbar bg="light" variant="light" expand="lg">
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

      {/* Main Content for User Authentication */}
      <Container className="mt-4 text-center">
        {isLoading ? (
          <LoadingScreen/>
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
              <p className="text-muted">Problems Solved: <strong>{progress}%</strong></p> {/* Example percentage */}
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
    </>
  );
};

export default AppNavbar;
