import React, { useState, useEffect , useContext  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { ref, get, child } from "firebase/database";
import { database } from "../firebase"; // Firebase configuration
import { useTheme } from "../ThemeContext";
import { AuthContext } from "../utility/AuthContext";

import dashboardimage from "../assets/dashboard.png";

import MainNavbar from "./MainNavbar";

const PeopleTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme(); // Ensure the theme context is properly connected.

    const { user, signInWithGoogle, logOut, isLoading } = useContext(AuthContext);

  const navigate = useNavigate();

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
  }, [isLoading]);

  const loadUsers = async () => {
    setLoading(true);
    const dbRef = ref(database);

    try {
      const [usersSnapshot, questionsSnapshot] = await Promise.all([
        get(child(dbRef, `users/`)),
        get(child(dbRef, `questions/`)),
      ]);

      const usersData = usersSnapshot.val();
      const questionsData = questionsSnapshot.val();

      if (usersData && questionsData) {
        const totalQuestions = questionsData;
        const formattedData = Object.keys(usersData)
          .map((key) => ({
            id: key,
            ...usersData[key],
            progress: totalQuestions
              ? Math.round((usersData[key].solved / totalQuestions) * 100)
              : null,
          }))
          .sort((a, b) => b.progress - a.progress);

        const finalData = formattedData.map((user) => ({
          ...user,
          progress: user.progress !== null ? `${user.progress}%` : "N/A",
        }));

        setUsersData(finalData);
      } else {
        setUsersData([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsersData([]);
    } finally {
      setLoading(false);
    }
  };

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
        height: "100vh", // Ensure the height fits the viewport
        backgroundColor: theme === "light" ? "#f8f9fa" : "#212529",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MainNavbar command={true} />

      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden", // Prevent overflow
        }}
      >
        {/* Left Half: Table */}
        <div
          style={{
            flex: 1,
            overflowY: "auto", // Enable scrolling within the table
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
                  {/* <th>Email</th> */}
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : paginatedPeople.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedPeople.map((user, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={user.profilePhoto || "default-avatar.png"}
                          alt="Profile"
                          width="50"
                          height="50"
                          className="rounded-circle"
                        />
                      </td>
                      <td>{user.name}</td>
                      {/* <td>{user.email}</td> */}
                      <td>{user.progress}</td>
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

export default PeopleTable;
