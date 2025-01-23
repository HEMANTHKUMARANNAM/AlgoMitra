import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { encryptParam } from "../cryptoUtils"; // Import encryption utility
import MainNavbar from "./MainNavbar";
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { Badge } from "react-bootstrap"; // Badge for status display
import { AuthContext } from "../utility/AuthContext"; // Import AuthProvider
import { FaCheck, FaTimes } from "react-icons/fa"; // Import React Icons
import LoadingScreen from "../LoadingScreen";
import { Container } from "react-bootstrap";

const Home = () => {
  const [categories, setCategories] = useState([]); // State to store category keys
  const [data, setData] = useState({}); // State to store the merged data
  const [loadingc, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [userLoading, setUserLoading] = useState(true); // User loading state
  // const { theme } = useTheme(); // Access the current theme
  const { user } = useContext(AuthContext); // User from AuthContext


  const theme = "light";

  useEffect(() => {
    if (user === undefined) {
      setUserLoading(true); // If user is undefined, set loading to true
      return;
    }

    setUserLoading(false); // User has been loaded
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsSnapshot = await get(ref(database, "/algomitra"));
        const fetchedQuestions = questionsSnapshot.val() || {};

        const userId = user?.uid; // Get user ID
        let fetchedStatuses = {};

        if (user) {
          const statusesSnapshot = await get(ref(database, `/results/${userId}`));
          fetchedStatuses = statusesSnapshot.val() || {};
        }

        // Merge statuses into question data
        const mergedData = { ...fetchedQuestions };
        for (const category in fetchedQuestions) {
          if (fetchedQuestions[category]) {
            for (const questionId in fetchedQuestions[category]) {
              if (fetchedQuestions[category][questionId]) {
                mergedData[category][questionId].status =
                  fetchedStatuses[questionId] !== null &&
                  (fetchedStatuses[questionId] === true ||
                    fetchedStatuses[questionId] === false)
                    ? fetchedStatuses[questionId]
                    : "unknown";
              }
            }
          }
        }

        setCategories(Object.keys(mergedData));
        setData(mergedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const containerClass =
    theme === "light" ? "bg-light text-dark" : "bg-dark text-light";
  const cardClass = theme === "light" ? "bg-light text-dark" : "bg-dark text-light";
  const buttonClass = theme === "light" ? "btn-primary" : "btn-outline-light";

  if (userLoading) {
    return <LoadingScreen/>;
  }

  if (loadingc) {
    return <LoadingScreen/>;
  }

  if (error) {
    return <LoadingScreen/>;
  }

  return (

    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
    {/* Upper Div (fits its content dynamically) */}
    <div
      style={{
        backgroundColor: "#343a40",
        color: "white",
        width:'100%',
      }}
    >
      <MainNavbar />

    </div>

    {/* Scrollable Lower Div */}
    <div
      style={{
        flex: 1, // Fills the remaining height
        overflowY: "auto", // Makes it scrollable
        padding: "20px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Container>


        
    <div className={`min-vh-100 ${containerClass}`}>
      <div className="container py-4">
        {categories.length > 0 ? (
          categories.map((category, index) => (
            <div className="mb-4" key={category}>
              <h5 className="text-capitalize mb-3">
                {index + 1}. {category}
              </h5>
              <ul className="list-group">
                {Object.keys(data[category] || {}).map((key, questionIndex) => {
                  const encryptedCourse = encryptParam(category);
                  const encryptedQuestionId = encryptParam(key);

                  const problemData = data[category][key] || {};
                  const questionName =
                    problemData.questionname || "Unnamed Question";
                  const status = problemData.status;

                  // Determine badge color and text based on status
                  let statusBadge = "secondary"; // Default color
                  if (status === true) statusBadge = "success";
                  else if (status === false) statusBadge = "warning";

                  return (
                    <li
                      className={`list-group-item d-flex justify-content-between align-items-center ${cardClass}`}
                      key={key}
                    >
                      <div className="d-flex align-items-center flex-grow-1">
                        <span className="me-2">
                          {index + 1}.{questionIndex + 1} {questionName}
                        </span>
                        {user && (
                          <Badge pill bg={statusBadge} className="me-2">
                            {status === true ? (
                              <FaCheck /> // Check icon for completed status
                            ) : status === false ? (
                              <FaTimes /> // Cross icon for failed status
                            ) : null}
                          </Badge>
                        )}
                      </div>
                      <Link
                        to={`/prob/${encryptedCourse}/${encryptedQuestionId}`}
                        className={`btn btn-sm ${buttonClass}`}
                      >
                        View Problem
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-center">No categories available.</div>
        )}
      </div>
    </div>

        
        
      </Container>
    </div>
  </div>

  
  );
};

export default Home; 