import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
// src/index.js or src/index.tsx
import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS
import 'bootstrap';  // Import Bootstrap JS (includes all JS plugins)

import { AuthProvider } from "./utility/AuthContext";

import { ThemeProvider } from './ThemeContext'; 
import QuestionProvider from './utility/QuestionProvider';
import { ScreenSizeProvider } from './ScreenSizeContext ';
import ErrorBoundary from './ErrorBoundary';


// const disableCopyPaste = () => {
//   // Disable right-click
//   document.addEventListener("contextmenu", (event) => event.preventDefault());

//   // Disable Copy, Cut, and Paste
//   document.addEventListener("copy", (event) => event.preventDefault());
//   document.addEventListener("cut", (event) => event.preventDefault());
//   document.addEventListener("paste", (event) => event.preventDefault());

//   // Disable Text Selection
//   document.addEventListener("selectstart", (event) => event.preventDefault());

//   // Disable Dragging
//   document.addEventListener("dragstart", (event) => event.preventDefault());
// };

// // Call function to disable actions
// disableCopyPaste();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
    <ScreenSizeProvider>
    <AuthProvider>
      <QuestionProvider>
      <ThemeProvider>
    <App />
    </ThemeProvider>
    </QuestionProvider>
    </AuthProvider>
    </ScreenSizeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
