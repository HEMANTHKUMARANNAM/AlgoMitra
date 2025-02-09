import React, { useEffect, useState , useContext} from "react";
import { Link } from "react-router-dom";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import MainNavbar from "./MainNavbar";
import { useTheme } from "../ThemeContext";
import { Container, Card, Button } from "react-bootstrap";
import LoadingScreen from "../LoadingScreen";
import { AuthContext } from "../utility/AuthContext";

import exam_image from "../assets/9233873_4119037.svg";



// import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook

const Tests = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();


    
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsSnapshot = await get(ref(database, "/tests"));
        const fetchedQuestions = questionsSnapshot.val() || {};
        console.log(fetchedQuestions);
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
    backgroundColor: theme === "light" ? "#f8f9fa" : "#212529", // Light or dark background
    color: theme === "light" ? "#000" : "#fff", // Light or dark text
  };

  const buttonClass = theme === "light" ? "btn-primary" : "btn-outline-light";

  if (loading || error) {
    return <LoadingScreen />;
  }

 



  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "#343a40", color: "white", width: "100%" }}>
        <MainNavbar command= {false} showDashboard= {true}  />
      </div>

      {/* Scrollable content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          width: "100%",
          backgroundColor: theme === "light" ? "#f8f9fa" : "#212529",
        }}
      >
        <Container className="mt-4">
          {categories.length > 0 ? (
            <div className="row">
              {categories.map((category, index) => {
                // const encryptedCategory = encryptParam(category);
                // const imageUrl = categoryImages[category.toLowerCase()] ;
                const imageUrl = exam_image;
                console.log(category.toLowerCase());
                return (
                  <div className="col-md-4 mb-4 d-flex justify-content-center" key={category}>
                    <Card style={{ ...cardStyle, width: "320px" }}> {/* Set consistent card width */}
                      <Card.Img variant="top" src={imageUrl} alt={category}  />
                      <Card.Body>
                        <Card.Title className="text-capitalize">
                          {index + 1}. {String(category).substring(3)}
                        </Card.Title>
                        <Card.Text>
                          {/* Explore problems in the <strong>{String(category).substring(3)} Level</strong> category. */}
                              {
                                true ? (<div 
                                  className="progress-container" 
                                  style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px' }}
                                >
                                  {/* <progress
                                    value={courseProgress[category]?.percentage || 0}
                                    max="100"
                                    style={{ flex: '1', height: '20px' }}
                                  ></progress> */}
                                  <span style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                    {/* {`${courseProgress[category]?.completed || 0} / ${courseProgress[category]?.total || 0}`} */}
                                  </span>
                                </div>) : (<></>)
                              }
                        </Card.Text>
                        <Link to={`/test/${category}`}>
                          <Button className={buttonClass}>View Exam</Button>
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

export default Tests;
