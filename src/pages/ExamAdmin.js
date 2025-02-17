import React, { useState, useEffect, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate, useParams } from "react-router-dom";
import { ref, get, child, set } from "firebase/database";
import { database } from "../firebase"; // Firebase configuration
import { useTheme } from "../ThemeContext";
import { AuthContext } from "../utility/AuthContext";

import accountlight from "../assets/accountlight.png";
import accountdark from "../assets/accountdark.png";
import dashboardimage from "../assets/dashboard.png";

import MainNavbar from "./MainNavbar";

const ExamAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersData, setUsersData] = useState([]); // Ensure it's always an array
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const { user, isLoading } = useContext(AuthContext);

  const navigate = useNavigate();
  const { testid } = useParams();

  useEffect(() => {
    if (isLoading) return; // Wait until auth context is loaded
    if (!user) {
      navigate("/home"); // Redirect if unauthorized
      return;
    }
    loadUsers();
    return () => {
      setUsersData([]);
    };
  }, [isLoading, user]);
  const loadUsers = async () => {
    setLoading(true);
    const dbRef = ref(database);
  
    try {
      const [usersSnapshot, examsSnapshot, resultsSnapshot, testSnapshot] = await Promise.all([
        get(child(dbRef, `users/`)),
        get(child(dbRef, `exams/${testid}`)),
        get(child(dbRef, `exams/results/${testid}`)),
        get(child(dbRef, `tests/${testid}`)),
      ]);
  
      const usersData = usersSnapshot.val() || {};
      const examsData = examsSnapshot.val() || {};
      const resultsData = resultsSnapshot.val() || {};
      const testData = testSnapshot.val() || [];
  
      // Calculate total questions once
      const totalQuestions = Object.keys(testData).length;

      
      // Combine users and exams data into an array
      const combinedData = Object.keys(examsData).map((key) => {
        let count = 0;
    
        // Calculate score from resultsData
        if (resultsData[key]) {
          
          Object.values(resultsData[key]).forEach((result) => {
            if (result === true) count++;
            // console.log( result );
          });
        }

        // console.log( Object.keys(testData).length);
  
        // Calculate percentage
        const percentage = totalQuestions > 0 ? (count / totalQuestions) * 100 : 0;
  
        return {
          ...usersData[key],
          ...examsData[key],
          percentage: percentage.toFixed(2), // Round to 2 decimal places
          uid: key, // Add UID for key
        };
      });
  
      // Sort by exit count
      combinedData.sort((a, b) => b.exitCount - a.exitCount);
  
      setUsersData(combinedData);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsersData([]);
    } finally {
      setLoading(false);
    }
  };
  
  function handleunblock(userId) {
    const dbRef = ref(database, `exams/${testid}/${userId}/exitCount`);
    set(dbRef, 0)
      .then(() => {
        console.log(`User ${userId} has been unblocked.`);
        // Reload users to reflect changes
        loadUsers();
      })
      .catch((error) => {
        console.error("Error unblocking user:", error);
      });
  }
  
  function handlereset(userId) {
    const dbRef = ref(database, `exams/${testid}/${userId}/`);
    set(dbRef, null)
      .then(() => {
        console.log(`User ${userId} has been unblocked.`);
        // Reload users to reflect changes
        loadUsers();
      })
      .catch((error) => {
        console.error("Error unblocking user:", error);
      });
    const dbRef2 = ref(database, `exams/results/${testid}/${userId}/`);
    set(dbRef2, null)
      .then(() => {
        console.log(`User ${userId} has been unblocked.`);
        // Reload users to reflect changes
        loadUsers();
      })
      .catch((error) => {
        console.error("Error unblocking user:", error);
      });
  }
  

  // Pagination and Filtering Logic
  const itemsPerPage = 5;
  const filteredPeople = usersData.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredPeople.length / itemsPerPage);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const paginatedPeople = filteredPeople.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: theme === "light" ? "#f8f9fa" : "#212529",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MainNavbar command={true} />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Half: Table */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px",
          }}
        >
          <div
            className={`d-flex flex-column ${
              theme === "dark" ? "bg-dark text-light" : "bg-light text-dark"
            }`}
          >
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: "10px", borderRadius: "10px" }}
              />
            </div>

            <table
              className={`table table-bordered ${
                theme === "dark" ? "table-dark" : ""
              }`}
            >
              <thead>
                <tr>
                  <th>Profile Photo</th>
                  <th>Name</th>
                  <th>Progress</th>
                  <th>Reset</th>
                  <th>Block/UnBlock</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedPeople.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedPeople.map((user, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={
                            user.profilePhoto
                              ? user.profilePhoto
                              : theme === "light"
                              ? accountlight
                              : accountdark
                          }
                          alt="Profile"
                          width="50"
                          height="50"
                          className="rounded-circle"
                        />
                      </td>
                      <td>{user.name || "N/A"}</td>
                      <td>{user.percentage || "N/A"}</td>
                      <td>
                        <button className="btn btn-warning" onClick={() => handlereset(user.uid)} >Reset</button>
                      </td>
                      <td>
                        {
                          user.exitCount >= 3 ?(

                            <button className="btn btn-danger" onClick={() => handleunblock(user.uid)}>
                            Unblock {user.exitCount}
                          </button>
                          

                          ):
                          (

                            <>
                            not blocked
                            </>

                          )

                        }
                       
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-4">
              <button
                className={`btn ${
                  theme === "dark" ? "btn-light" : "btn-primary"
                }`}
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                className={`btn ${
                  theme === "dark" ? "btn-light" : "btn-primary"
                }`}
                onClick={handleNext}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Half: Animation GIF */}
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={dashboardimage}
            alt="Always animating GIF"
            style={{ maxWidth: "80%", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExamAdmin;
