import React, { useCallback, useEffect, useContext, useState } from "react";
import { Navbar, Button, Dropdown, Container, Badge, Image } from "react-bootstrap";
import { FaCode, FaCheck, FaTimes } from "react-icons/fa";
import { useTheme } from "../../ThemeContext";
import { AuthContext } from "../../utility/AuthContext";
import LoadingScreen from "../../LoadingScreen";
import { ref, onValue, off } from "firebase/database";
import { database } from "../../firebase";
import lightmode from "../../assets/lightmode.png";
import darkmode from "../../assets/darkmode.png";
import { CODE_SNIPPETS } from "../../constants";
import { useParams } from "react-router-dom";
import menu_light from "../../assets/menu_light.png";
import menu_dark from "../../assets/menu_dark.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const ProblemNavbar = ({ setlan, lan, onNext, onPrev, timeLeft, data, toggleSidebar, isSidebarExpanded }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useContext(AuthContext);
  const [photoURL, setPhotoURL] = useState(null);
  const [status, setStatus] = useState(null);

  const { testid } = useParams();

  useEffect(() => {
    if (user) {
      setPhotoURL(user.photoURL);
    }
  }, [user]);

  useEffect(() => {
    if (loading || !user?.uid || !testid || !data?.questionname) return;

    const resultRef = ref(database, `exams/results/${testid}/${user.uid}/${data.questionname}`);
    const listener = onValue(resultRef, (snapshot) => {
      if (snapshot.exists()) {
        const resultData = snapshot.val();
        setStatus(resultData.status ?? resultData);
      } else {
        setStatus(null);
      }
    });

    return () => off(resultRef, listener);
  }, [user, loading, testid, data?.questionname]);

  const displayLan = lan.charAt(0).toUpperCase() + lan.slice(1);

  const handleLanguageChange = useCallback((language) => {
    setlan(language);
    localStorage.setItem("lan", language);
  }, [setlan]);

  if (loading) return <LoadingScreen />;
  if (!user) return <LoadingScreen />;

  return (
    <Navbar bg={theme === "light" ? "light" : "dark"} variant={theme} expand="lg" sticky="top" className="shadow-sm">
      <Container fluid className="d-flex justify-content-between align-items-center">
        <div>
          {!isSidebarExpanded ?
            (
              <Image
                src={theme === 'light' ? menu_dark : menu_light}
                alt="Toggle Sidebar"
                width={30}
                height={30}
                className="me-2"
                onClick={toggleSidebar}
                style={{ cursor: "pointer" }}
              />
            ) : (<></>)
          }
        </div>
        <div className="d-flex align-items-center">
          <p
            className={`lead mb-0 font-mono ${theme === "dark" ? "text-light" : "text-dark"
              }`}
            style={{ minWidth: "60px", textAlign: "center", paddingRight: "20px" }}
          >
            Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
          </p>

          <Dropdown className="me-3">
            <Dropdown.Toggle variant={theme === "light" ? "outline-primary" : "outline-secondary"} id="dropdown-languages">
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
          <span className={theme === "light" ? "text-dark me-2" : "text-light me-2"} style={{ fontSize: "1rem" }}>
            Progress
          </span>
          <Badge pill bg={status === true ? "success" : status === false ? "danger" : "secondary"} className="me-3">
            {status === true ? <FaCheck /> : status === false ? <FaTimes /> : "Not Attempted"}
          </Badge>
          {user && photoURL && (
            <Image src={photoURL} alt="Profile" roundedCircle width={30} height={30} className="me-3" />
          )}
          <Image
            src={theme === 'light' ? darkmode : lightmode}
            alt="Toggle Theme"
            roundedCircle
            width={30}
            height={30}
            className="me-3"
            onClick={toggleTheme}
            style={{ cursor: "pointer" }}
          />
          {/* <Button variant="primary" className="me-2" onClick={onPrev}>
            Prev
          </Button>
          <Button variant="primary" className="me-3" onClick={onNext}>
            Next
          </Button> */}

        </div>
      </Container>
    </Navbar>
  );
};

export default ProblemNavbar;