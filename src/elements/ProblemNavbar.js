import React, { useCallback, useEffect, useContext, useState } from "react";
import { Navbar, Nav, Button, Dropdown, Container, Badge } from "react-bootstrap";
import { CODE_SNIPPETS } from "../constants"; // Adjust path as needed
import { FaCode,  FaCheck, FaTimes } from "react-icons/fa"; // Icons for theme toggle, success, and failure
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { useNavigate, useParams } from "react-router-dom"; // Hook for navigation
import { ref, onValue } from "firebase/database";
import { database } from "../firebase";
import { decryptParam } from "../cryptoUtils";
import { AuthContext } from "../utility/AuthContext"; // Import AuthProvider
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import LoadingScreen from "../LoadingScreen";
import { name } from "../constants";
import { Image } from "react-bootstrap"; // Import Bootstrap Image component
import lightmode from "../assets/lightmode.png";
import darkmode from "../assets/darkmode.png";

const ProblemNavbar = ({ toggleMode, activeMode, setlan, lan , nextQuestionUrl , prevQuestionUrl}) => {
  const { theme, toggleTheme } = useTheme(); // Access theme and toggle function
  const navigate = useNavigate(); // Hook for navigation
  const { course, questionId } = useParams();
    const [photoURL, setPhotoURL] = useState(null);
    
  

    const {courseProgress , isLoading} = useQuestions();

    // Set photoURL when user is authenticated
      useEffect(() => {
        if (user) {
          setPhotoURL(user.photoURL); // Update photoURL with user's profile picture
        }
      });
    


  // Decrypt URL parameters
  const decryptedQuestionId = decryptParam(questionId);

  // Set status icon state
  const [status, setStatus] = useState(null);

  // Get current user and loading state
  const { user, loading } = useContext(AuthContext);

  // Handler for the Next button
  function handlenext() {
    if (nextQuestionUrl) {
      navigate(`${nextQuestionUrl}`);
    } else {
      navigate(`/category/${course}`);
    }
  }
  // Handler for the Next button
  function handleprev() {
    if (prevQuestionUrl) {
      navigate(`${prevQuestionUrl}`);
    } else {
      navigate(`/category/${course}`);
    }
  }

  // Fetch data and listen for changes in user status for current question
  useEffect(() => {
    if (loading) return ; // Wait until loading is complete
    if (!user || !user.uid) {
      console.warn("User is not authenticated");
      setStatus(null); // Clear status icon if user is not authenticated
      return;
    }

    // Reference Firebase data for user results on the current question
    const dataRef = ref(database, `results/${user.uid}/${decryptedQuestionId}`);

    // Set up real-time listener for status changes
    const unsubscribe = onValue(dataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("Data changed:", data);

        // Update status icon based on data
        if (data === true) {
          setStatus(true);
        } else {
          setStatus(false);
        }
      } else {
        console.error("No data available for the given path.");
        setStatus(null);
      }
    });

    // Clean up the listener when the component unmounts or questionId changes
    return () => unsubscribe();
  }, [decryptedQuestionId, user, loading]);


  // Format language display
  const displayLan = lan.charAt(0).toUpperCase() + lan.slice(1);

 

  // Memoized function to update language and data
  const handleLanguageChange = useCallback(async(language) => {
    setlan(language);  // Update the language
    localStorage.setItem("lan" , language);
    console.log(language);
  }, [setlan , localStorage]);


  // Handle loading state or unauthorized access
  if (loading || isLoading) {
    return <LoadingScreen/> // Replace with your custom loading spinner
  }

  if (!user) {
    return <LoadingScreen/>;
  }

  return (
    <Navbar
      bg={theme === "light" ? "light" : "dark"}
      variant={theme === "light" ? "light" : "dark"}
      expand="lg"
      sticky="top"
      className="shadow-sm"
    >
      <Container fluid>
        {/* Brand Name with Navigation */}
        <Navbar.Brand
          className={theme === "light" ? "text-dark" : "text-light"}
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/home")}
        >
          {name}
        </Navbar.Brand>

        {/* Nav Links for modes */}
        <Nav className="me-auto">
          <Nav.Link
            onClick={() => toggleMode("statement")}
            active={activeMode === "statement"}
            className={theme === "light" ? "text-dark" : "text-light"}
          >
            Statement
          </Nav.Link>
          <Nav.Link
            onClick={() => toggleMode("solution")}
            active={activeMode === "solution"}
            className={theme === "light" ? "text-dark" : "text-light"}
          >
            Solution
          </Nav.Link>
        </Nav>

        {/* Right Section */}
        <div className="d-flex align-items-center">
          {/* Theme Toggle Button */}
          <Image
                  src={theme === 'light' ? darkmode : lightmode}
                  alt="Profile"
                  roundedCircle
                  width={30}
                  height={30}
                  className="me-2"
                  onClick={toggleTheme}
                />
          {/* Language Dropdown */}
          <Dropdown className="ms-3">
            <Dropdown.Toggle
              variant={theme === "light" ? "outline-primary" : "outline-secondary"}
              id="dropdown-languages"
              className="d-flex align-items-center"
            >
              <FaCode className="me-2" />
              {displayLan}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(CODE_SNIPPETS).map((language) => (
                <Dropdown.Item key={language} onClick={() => handleLanguageChange(language)}>
                  {language.charAt(0).toUpperCase() + language.slice(1)}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Progress Bar */}
          <div className="ms-3 d-flex align-items-center justify-content-between" style={{ width: '100%' }}>
  <span className={theme === "light" ? "text-dark me-2" : "text-light me-2"} style={{ fontSize: '1rem' }}>
    Progress
  </span>
  
  <div className="d-flex align-items-center">
    <progress 
      value={courseProgress[decryptParam(course)].percentage / 100} 
      max="1" 
      style={{ width: '100px', height: '20px', marginRight: '10px' }} 
    />
    <p style={{ marginBottom: 0, fontSize: '1rem' , color: theme === "light" ? "black" : "white"  }}>
      {`${parseInt(decryptParam(questionId).substring(0, 3))} of ${courseProgress[decryptParam(course)].total}`}
    </p>
  </div>
</div>

          {/* Status Icon (Tick or X) */}
<div className="ms-3 d-flex align-items-center">
  <Badge pill bg={status === true ? "success" : status === false ? "danger" : "secondary"} className="me-2">
    {status === true ? <FaCheck /> : status === false ? <FaTimes /> : "Not Attempted"}
  </Badge>
</div>

{user && photoURL ? (
                <Image
                  src={photoURL}
                  alt="Profile"
                  roundedCircle
                  width={30}
                  height={30}
                  className="me-2"
                />
              ) : (<></>
              )}


          {/* Next Button */}
          <Button variant="primary" className="ms-3" onClick={handleprev}>
            Prev
          </Button>
          <Button variant="primary" className="ms-3" onClick={handlenext}>
            Next
          </Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default ProblemNavbar;
