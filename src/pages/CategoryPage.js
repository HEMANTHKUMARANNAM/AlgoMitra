import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { decryptParam, encryptParam } from "../cryptoUtils";
import MainNavbar from "./MainNavbar";
import { useTheme } from "../ThemeContext";
import { Badge, Container, ListGroup, Button } from "react-bootstrap";
import { AuthContext } from "../utility/AuthContext";
import { FaCheck, FaTimes } from "react-icons/fa";
import LoadingScreen from "../LoadingScreen";
import myGiflight from '../assets/Data points - light.gif'; // If the GIF is in your src folder
import myGifdark from '../assets/Data points.gif'; // If the GIF is in your src folder


const CategoryPage = () => {
  const { categoryId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statuses, setStatuses] = useState({});
  const { theme } = useTheme();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchQuestionsAndStatuses = async () => {
      try {
        if (!user) return; // Wait for user context to load
        const userId = user.uid;

        // Fetch statuses
        const statusesSnapshot = await get(ref(database, `/results/${userId}`));
        const fetchedStatuses = statusesSnapshot.val() || {};

        // Fetch questions
        const categoryName = decryptParam(categoryId);
        const questionsSnapshot = await get(ref(database, `/algomitra/${categoryName}`));
        const fetchedQuestions = questionsSnapshot.val() || {};

        // Set state
        setQuestions(Object.entries(fetchedQuestions)); // Convert object to array of [id, data]
        setStatuses(fetchedStatuses);
      } catch (error) {
        console.error("Error fetching questions or statuses:", error);
        setError("Failed to load questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestionsAndStatuses();
  }, [categoryId, user]);

  const cardStyle = {
    backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)",
    color: theme === "light" ? "#000" : "#fff",
  };

  const badgeColors = {
    true: "success",
    false: "warning",
    unknown: "secondary",
  };

  if (loading) return <LoadingScreen />;
  if (error) return <div className="text-center text-danger">{error}</div>;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{ backgroundColor: "#343a40", color: "white", width: "100%" }}>
        <MainNavbar />
      </div>

      {/* Page Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          width: "100%",
          backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)",
        }}
      >
        {/* Left Half: Questions List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Container className="mt-4">
            <h3 className="mb-4" style={cardStyle}>
              Questions in {decryptParam(categoryId)}
            </h3>
            <ListGroup>
              {questions.map(([id, question]) => {
                const encryptedQuestionId = encryptParam(id);
                const questionStatus = statuses[id];
                const statusBadge = badgeColors[questionStatus === true ? "true" : questionStatus === false ? "false" : "unknown"];

                return (
                  <ListGroup.Item
                    key={id}
                    className="d-flex justify-content-between align-items-center"
                    style={{
                      ...cardStyle,
                      borderColor: theme === "light" ? "#dee2e6" : "#444",
                      borderWidth: "1px",
                      borderStyle: "solid",
                    }}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <span className="me-2">{question.questionname || "Unnamed Question"}</span>
                      {user && (
                        <Badge pill bg={statusBadge} className="me-2">
                          {questionStatus === true ? <FaCheck /> : questionStatus === false ? <FaTimes /> : "Not Attempted"}
                        </Badge>
                      )}
                    </div>
                    <Link to={`/prob/${categoryId}/${encryptedQuestionId}`}>
                      <Button variant={theme === "light" ? "primary" : "outline-light"} size="sm">
                        View Question
                      </Button>
                    </Link>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Container>
        </div>

        {/* Right Half: Animation GIF */}
        <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={theme === 'light' ? myGiflight : myGifdark} alt="Always animating GIF" style={{ width: '80%', height: 'auto' }} />
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
