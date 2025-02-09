import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Problem from './pages/Problem';
import ProtectedRoute from "./ProtectedRoute";

import CategoryPage from './pages/CategoryPage';
import Profile from './account/Profile';
import Dashboard from './pages/Dashboard';
import Tests from './pages/Tests';
import TestPage from './pages/TestWindow';



function App() {

  return (
      <Router basename='/Algo-Mitra/'>
        <Routes>
          {/* Public Routes: Accessible when the user is not authenticated */}
          <Route path="/home" element={ <Home />} />


          <Route path="/tests" element={ <Tests />} />

          <Route path="/test/:testid" element={<TestPage/> } />


          <Route path="/dashboard" element={  <ProtectedRoute>  <Dashboard/> </ProtectedRoute>} />


          <Route path="/category/:categoryId" element={<CategoryPage />} />


          {/* Protected Routes: Only accessible when the user is authenticated */}
          <Route 
            path="/profile" 
            element=  {<Profile />}  
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
