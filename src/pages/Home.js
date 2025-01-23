import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { encryptParam } from "../cryptoUtils";
import MainNavbar from "./MainNavbar";
import { useTheme } from "../ThemeContext";
import { Badge, Container } from "react-bootstrap";
import { AuthContext } from "../utility/AuthContext";
import { FaCheck, FaTimes } from "react-icons/fa";
import LoadingScreen from "../LoadingScreen";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({});
  const [loadingc, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user === undefined) {
      setUserLoading(true);
      return;
    }
    setUserLoading(false);
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsSnapshot = await get(ref(database, "/algomitra"));
        const fetchedQuestions = questionsSnapshot.val() || {};
        const userId = user?.uid;
        let fetchedStatuses = {};

        if (user) {
          const statusesSnapshot = await get(ref(database, `/results/${userId}`));
          fetchedStatuses = statusesSnapshot.val() || {};
        }

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


  const cardStyle = {
    backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)", // Apply light or dark background color
    color: theme === "light" ? "#000" : "#fff", // Apply light or dark text color

  };
  const buttonClass = theme === "light" ? "btn-primary" : "btn-outline-light";

  if (userLoading || loadingc || error) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Upper Div (fits its content dynamically) */}
      <div style={{ backgroundColor: "#343a40", color: "white", width: "100%" }}>
        <MainNavbar />
      </div>

      {/* Scrollable Lower Div */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        width: "100%",
        backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)", // Apply light or dark background color
      }}>
        <Container
          style={{
            flex: 1,
            overflowY: "auto",
            width: "100%",
          }}
        >
          {/* <div className="container" > */}
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div className="mb-4" key={category}>
                <h5 className="text-capitalize mb-3"
                  style={cardStyle}
                >
                  {index + 1}. {category}
                </h5>
                <ul className="list-group">
                  {Object.keys(data[category] || {}).map((key, questionIndex) => {
                    const encryptedCourse = encryptParam(category);
                    const encryptedQuestionId = encryptParam(key);
                    const problemData = data[category][key] || {};
                    const questionName = problemData.questionname || "Unnamed Question";
                    const status = problemData.status;

                    // Determine badge color and text based on status
                    let statusBadge = "secondary";
                    if (status === true) statusBadge = "success";
                    else if (status === false) statusBadge = "warning";

                    return (
                      <li
                        className={`list-group-item d-flex justify-content-between align-items-center `}
                        key={key}
                        // style={cardStyle}

                        style={{
                          ...cardStyle,
                          borderColor: theme === 'light' ? "#f8f9fa" : theme=== 'dark' ? "rgb(29, 30, 35)" : 'gray', // Customize as needed
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                        
                      >
                        <div className="d-flex align-items-center flex-grow-1">
                          <span className="me-2" style={{ flex: 1 }}>
                            {index + 1}.{questionIndex + 1} {questionName}
                          </span>
                          {user && (
                            <Badge pill bg={statusBadge} className="me-2">
                              {status === true ? (
                                <FaCheck />
                              ) : status === false ? (
                                <FaTimes />
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
        </Container>
      </div>
    </div>
  );
};

export default Home;
