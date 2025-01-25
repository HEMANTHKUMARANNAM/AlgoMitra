import React from "react";
import sadgirl from "./assets/sadgirl.svg";
import MainNavbar from "./pages/MainNavbar";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to display fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error (you can send it to an external service)
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI with a message and styled container
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            textAlign: "center",
            backgroundColor: "#f9f9f9",
            color: "#333",
          }}
        >
       
          <img
            src={sadgirl}
            alt="Error"
            style={{ width: "200px", marginBottom: "20px" }}
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Oops! Something went wrong.
          </h1>
          <p style={{ fontSize: "1rem", marginTop: "10px", color: "#555" }}>
            We're sorry for the inconvenience. Please try refreshing the page or
            contact support if the issue persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
