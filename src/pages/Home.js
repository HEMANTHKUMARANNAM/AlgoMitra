import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { encryptParam } from "../cryptoUtils";
import MainNavbar from "./MainNavbar";
import { useTheme } from "../ThemeContext";
import { Container, Card, Button } from "react-bootstrap";
import { AuthContext } from "../utility/AuthContext";
import LoadingScreen from "../LoadingScreen";

// Import assets
import algorithms from "../assets/algorithms.png";
import problems from "../assets/problems.png";
import others from "../assets/others.png";
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
    const {courseProgress} = useQuestions();
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsSnapshot = await get(ref(database, "/algomitra"));
        const fetchedQuestions = questionsSnapshot.val() || {};
        setCategories(Object.keys(fetchedQuestions));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const cardStyle = {
    backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)", // Light or dark background
    color: theme === "light" ? "#000" : "#fff", // Light or dark text
  };

  const buttonClass = theme === "light" ? "btn-primary" : "btn-outline-light";

  if (loading || error) {
    return <LoadingScreen />;
  }

  // Category-specific images
  const categoryImages = {
    problems : problems,
    algorithms: algorithms,

  };



  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "#343a40", color: "white", width: "100%" }}>
        <MainNavbar />
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          width: "100%",
          backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(29, 30, 35)",
        }}
      >
        <Container className="mt-4">
          {categories.length > 0 ? (
            <div className="row">
              {categories.map((category, index) => {
                const encryptedCategory = encryptParam(category);
                const imageUrl = categoryImages[category.toLowerCase()] || others;

                return (
                  <div className="col-md-4 mb-4 d-flex justify-content-center" key={category}>
                    <Card style={{ ...cardStyle, width: "320px" }}> {/* Set consistent card width */}
                      <Card.Img variant="top" src={imageUrl} alt={category}  />
                      <Card.Body>
                        <Card.Title className="text-capitalize">
                          {index + 1}. {category}
                        </Card.Title>
                        <Card.Text>
                          Explore problems in the <strong>{category}</strong> category.
                                   <div 
                            className="progress-container" 
                            style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}
                          >
                            <progress
                              value={courseProgress[category]?.percentage || 0}
                              max="100"
                              style={{ flex: '1', height: '20px' }}
                            ></progress>
                            <span style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                              {`${courseProgress[category]?.completed || 0} / ${courseProgress[category]?.total || 0}`}
                            </span>
                          </div>
                        </Card.Text>
                        <Link to={`/category/${encryptedCategory}`}>
                          <Button className={buttonClass}>View Category</Button>
                        </Link>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center">No categories available.</div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default Home;
