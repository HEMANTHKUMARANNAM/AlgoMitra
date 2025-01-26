import React, { useContext, useState, useEffect } from "react";
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { AuthContext } from "../utility/AuthContext";
import { Image } from "react-bootstrap"; // Import Bootstrap Image component
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import { name } from "../constants";
import icon from '../assets/icon.png';

import accounticonlight from "../assets/accountlight.png";
import accounticondark from "../assets/accountdark.png";

import lightmode from "../assets/lightmode.png";
import darkmode from "../assets/darkmode.png";


import back_black from '../assets/back-black.png';
import back_light from '../assets/back-white.png';


const MainNavbar = ( {command} ) => {
  const { theme, toggleTheme } = useTheme(); // Access theme and toggleTheme from ThemeContext
  const { user } = useContext(AuthContext); // Access user from AuthContext
  const [photoURL, setPhotoURL] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate for routing

  const { overallProgress} = useQuestions(); // Get totalQuestions from the custom hook


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

  
  function prevwindow() {
    navigate(`/home`);
  }


  // Dynamic classes based on theme
  const navbarBgClass = theme === "light" ? "bg-light" : "bg-dark";
  const navbarTextClass = theme === "light" ? "text-dark" : "text-light";

  return (
    <nav className={`navbar navbar-expand-lg ${navbarBgClass} ${navbarTextClass}`}>
      <div className="container-fluid">

        { command===true ? ( <Image
                  src={    theme === "light" ? back_black : back_light }
                  alt="back"
                  roundedCircle
                  width={30}
                  height={30}
                  className="me-2"
                  onClick={prevwindow}
                />) : (<></>) }
     
       
      <Link to="/home">
        <img src= {icon} />

        </Link>
        <Link to="/home" className="navbar-brand" style={{ color: theme === "light" ? "rgb(29, 30, 35)" : "#f8f9fa", textDecoration: "none" }}>
  {name}
</Link>

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
          
          {overallProgress !== 0 && <progress value={overallProgress/100} />}
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
                // <FaUser size={30} className="me-2" />
                <Image
                  src={theme === 'light' ? accounticondark : accounticonlight}
                  alt="Profile"
                  roundedCircle
                  width={30}
                  height={30}
                  className="me-2"
                  onError={handleImageError} // Handle fallback on image load error
                />
              )}
              <span>{user ? user.displayName || "User" : "Login"}</span>
            </li>


            
 
            {/* Theme Toggle Button */}
            <li className="nav-item">
            
                <Image
                  src={theme === 'light' ? darkmode : lightmode}
                  alt="Profile"
                  roundedCircle
                  width={30}
                  height={30}
                  className="me-2"
                  onError={handleImageError} // Handle fallback on image load error
                  onClick={toggleTheme}
                />
            </li> 
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default MainNavbar;
