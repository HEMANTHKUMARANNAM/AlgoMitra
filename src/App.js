import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Problem from './pages/Problem';
import Dashboard from './account/Dashboard';
import { AuthContext } from './utility/AuthContext'; // Import AuthProvider
import ProtectedRoute from "./ProtectedRoute";

import "./App.css"

function App() {
  const { user } = useContext(AuthContext);  // Get the current user from AuthContext

  return (
      <Router basename='/Algo-Mitra/'>
        <Routes>
          {/* Public Routes: Accessible when the user is not authenticated */}
          <Route path="/home" element={ <Home />} />

          {/* Protected Routes: Only accessible when the user is authenticated */}
          <Route 
            path="/dashboard" 
            element=  {<Dashboard />}  
          />
          <Route 
            path="/prob/:course/:questionId" 
            element={ <ProtectedRoute> <Problem /> </ProtectedRoute>} 
          />

          {/* Redirect all other routes to /dashboard if user is not logged in */}
          <Route path="*" element={<Navigate to="/home" /> } />
        </Routes>
      </Router>
  );
}

export default App;
