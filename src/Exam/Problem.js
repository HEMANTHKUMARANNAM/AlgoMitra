import React, { useState, useEffect , useContext } from "react";
import CodeWindow from "./elements/CodeWindow";
import ProblemNavbar from "./elements/ProblemNavbar";
import LoadingScreen from "../LoadingScreen";
import { Navbar, Image, Container, Button , Badge } from "react-bootstrap";
import { useTheme } from "../ThemeContext";
import { FaCode, FaCheck, FaTimes } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utility/AuthContext";

import menu_light from "../assets/menu_light.png";
import menu_dark from "../assets/menu_dark.png";
import { ref, onValue, off } from "firebase/database";
import { database } from "../firebase";


function Problem({ data, timeLeft }) {
  const [lan, setLan] = useState(localStorage.getItem("lan") || "java");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const { theme } = useTheme();
  const [questionStatuses, setQuestionStatuses] = useState({});
    const { testid } = useParams();
      const { user, loading } = useContext(AuthContext);
    

  const questionsArray = data ? Object.entries(data) : [];
  const isValidData = questionsArray.length > 0;
  const questionData = isValidData ? questionsArray[currentIndex][1] : null;

  useEffect(() => {
    console.log("Current Index Updated:", currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    console.log("Sidebar state changed:", isSidebarExpanded);
  }, [isSidebarExpanded]);

  const handleNext = () => {
    if (isValidData && currentIndex < questionsArray.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  


  
  useEffect(() => {
    if (loading || !user?.uid || !testid ) return;

    if (!user || !testid || !questionsArray.length) return;

    const listeners = {};

    questionsArray.forEach((question, index) => {
      console.log(question.toString());
      const questionName = question[1].questionname;
      const resultRef = ref(database, `exam/results/${user.uid}/${testid}/${questionName}`);

      listeners[questionName] = onValue(resultRef, (snapshot) => {
        setQuestionStatuses((prev) => ({
          ...prev,
          [questionName]: snapshot.exists() ? snapshot.val().status ?? snapshot.val() : null,
        }));
      });
    });

    // Cleanup listeners when component unmounts
    return () => {
      Object.values(listeners).forEach((unsubscribe) => unsubscribe());
    };

  ;
  }, [user, loading, testid, data?.questionname]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  const handleIndexClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="d-flex">
     {/* Sidebar */}
{/* Sidebar */}
<Navbar
  bg={theme === "light" ? "light" : "dark"}
  variant={theme}
  className={`d-flex flex-column min-vh-100 p-3 ${isSidebarExpanded ? "" : "d-none"}`}
  style={{ width: "220px", position: "fixed" }}
>
  {/* Sidebar Toggle */}
  <Container fluid className="d-flex justify-content-between align-items-center mb-3">
    <Image
      src={theme === "light" ? menu_dark : menu_light}
      alt="Toggle Sidebar"
      roundedCircle
      width={30}
      height={30}
      className="me-2"
      onClick={() => setIsSidebarExpanded((prev) => !prev)}
      style={{ cursor: "pointer" }}
    />
  </Container>

  {/* Question Buttons */}
  <div className="flex-grow-1 w-100 overflow-auto">
    {questionsArray.map((_, index) => (
      <Button
        key={index}
        variant={theme === "light" ? "outline-dark" : "outline-light"}
        className="w-100 mb-2 fw-bold text-start rounded shadow-sm"
        style={{
          padding: "8px 12px",
          fontSize: "12px",
          textTransform: "lowercase",
          opacity: 0.8,
          transition: "all 0.3s ease-in-out",
        }}
        onClick={() => handleIndexClick(index)}

      >
        {index + 1}. {questionsArray[index][1].questionname}
        <Badge pill bg={questionStatuses[questionsArray[index][1].questionname] === true ? "success" : questionStatuses[questionsArray[index][1].questionname] === false ? "danger" : "secondary"} className="me-3">
            {questionStatuses[questionsArray[index][1].questionname] === true ? <FaCheck /> : questionStatuses[questionsArray[index][1].questionname] === false ? <FaTimes /> : "Not Attempted"}
          </Badge>
      </Button>
    ))}
  </div>

  {/* Finish Button */}
  <Button
    variant="danger"
    className="mt-3 w-100 fw-bold rounded shadow-sm"
    style={{
      padding: "12px",
      fontSize: "14px",
      textTransform: "lowercase",
      opacity: 0.8,
      transition: "all 0.3s ease-in-out",
    }}
    // onClick={handleFinishClick}

  >
    finish
  </Button>
</Navbar>



      {/* Main Content */}
      <div className="d-flex flex-column vh-100 flex-grow-1" style={{ marginLeft: isSidebarExpanded ? "200px" : "0" }}>
        <ProblemNavbar
          setlan={setLan}
          lan={lan}
          onNext={handleNext}
          onPrev={handlePrev}
          timeLeft={timeLeft}
          data={questionData}
          toggleSidebar={() => setIsSidebarExpanded((prev) => !prev)}
          isSidebarExpanded={isSidebarExpanded}
        />

        <div className="flex-grow-1 d-flex flex-column overflow-hidden">
          {questionData ? <CodeWindow data={questionData} lan={lan} /> : <LoadingScreen />}
        </div>
      </div>
    </div>
  );
}

export default Problem;
