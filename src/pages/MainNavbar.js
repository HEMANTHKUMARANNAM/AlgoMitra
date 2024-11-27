import React, { useContext, useState, useEffect } from "react";
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { FaSun, FaMoon, FaUser } from "react-icons/fa"; // Import icons
import { AuthContext } from "../utility/AuthContext";
import { Image } from "react-bootstrap"; // Import Bootstrap Image component
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { Navbar, Nav, ProgressBar, Button, Dropdown, Container, Badge } from "react-bootstrap";
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import { name } from "../constants";

const MainNavbar = () => {
  // const { theme, toggleTheme } = useTheme(); // Access theme and toggleTheme from ThemeContext
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const [photoURL, setPhotoURL] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate for routing
  const [progress, setProgress] = useState(0);

  const { totalQuestions} = useQuestions(); // Get totalQuestions from the custom hook

  // Watch for progress changes (total questions)
  useEffect(() => {
    if (totalQuestions !== undefined) {
      const updatedProgress = totalQuestions * 100; // Convert to percentage
      setProgress(updatedProgress);
    }
  }, [totalQuestions]);



   // Determine progress bar color based on progress value
   const getProgressBarColor = (progress) => {
    if (progress < 30) return "danger";
    if (progress < 70) return "warning";
    return "success";
  };
  const theme = "light";

  // Set photoURL when user is authenticated
  useEffect(() => {
    if (user) {
      setPhotoURL(user.photoURL); // Update photoURL with user's profile picture
    }
  }, [user]);

  // Fallback handler when the profile photo fails to load
  const handleImageError = () => {
    setPhotoURL(null); // Use default icon if image fails to load
  };

  // Navigate to dashboard or login page
  const handleProfileClick = () => {
    navigate("/dashboard"); // Redirect based on authentication status
  };

  // Dynamic classes based on theme
  const navbarBgClass = theme === "light" ? "bg-light" : "bg-dark";
  const navbarTextClass = theme === "light" ? "text-dark" : "text-light";
  const themeIcon = theme === "light" ? <FaMoon /> : <FaSun />; // Icon for theme toggle

  return (
    <nav className={`navbar navbar-expand-lg ${navbarBgClass} ${navbarTextClass}`}>
      <div className="container-fluid">
        {/* Brand Name */}
        <a className="navbar-brand">
          {name}
        </a>

        {/* Navbar Toggler for mobile view */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Right-side navigation */}
          <ul className="navbar-nav ms-auto align-items-center">

            {/* Progress Bar */}
          <div className="ms-3 d-flex align-items-center">
            <span className={theme === "light" ? "text-dark me-2" : "text-light me-2"}>
              Progress
            </span>
            <ProgressBar
              now={progress}
              label={`${progress.toFixed(2)}%`}
              variant={getProgressBarColor(progress)}
              style={{ width: "150px", height: "20px", borderRadius: "10px" }}
              className="my-auto"
            />
          </div>
          <div>

          </div>
            {/* User Profile or Default Login Icon */}
            <li
              className="nav-item d-flex align-items-center me-3"
              style={{ cursor: "pointer" }}
              onClick={handleProfileClick} // Handle click to navigate
            >
              {/* Profile Picture or Default Icon */}
              {user && photoURL ? (
                <Image
                  src={photoURL}
                  alt="Profile"
                  roundedCircle
                  width={30}
                  height={30}
                  className="me-2"
                  onError={handleImageError} // Handle fallback on image load error
                />
              ) : (
                <FaUser size={30} className="me-2" />
              )}
              <span>{user ? user.displayName || "User" : "Login"}</span>
            </li>


            
{/* 
            Theme Toggle Button
            <li className="nav-item">
              <button
                className={`btn ${theme === "light" ? "btn-dark" : "btn-light"}`}
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {themeIcon}
              </button>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
