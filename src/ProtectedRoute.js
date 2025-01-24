import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    // Show a loader while checking auth state
    return <div>Loading...</div>;

  }

  toast.success("Correct Answer! All test cases passed.", {
            position: "top-right",
            autoClose: 3000,
          });

  return isAuthenticated ? children : <Navigate to="/dashboard" />;
};

export default ProtectedRoute;
