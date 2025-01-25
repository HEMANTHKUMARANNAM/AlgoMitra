import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import CodeEditor from "../code/CodeEditor";
import debounce from 'lodash.debounce'; // Import debounce
import { useTheme } from '../ThemeContext'; // Import Theme Context
import ReactPlayer from "react-player";

function CodeWindow({ mode, data, lan }) {
  const [leftColWidth, setLeftColWidth] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [mouseStartX, setMouseStartX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const { theme } = useTheme(); // Access the theme from context

  const testdata = data.testcases.slice(0, 3).map((testcase) => ({
    input: testcase.input,
    output: testcase.expectedOutput,
  }));

  const handleMouseDown = (e) => {
    setDragging(true);
    setMouseStartX(e.clientX);
    setInitialWidth(leftColWidth);
    e.preventDefault();
  };

  const handleMouseMove = debounce((e) => {
    if (dragging) {
      const deltaX = e.clientX - mouseStartX;
      const newWidth = initialWidth + (deltaX / window.innerWidth) * 100;
      if (newWidth >= 10 && newWidth <= 90) setLeftColWidth(newWidth);
    }
  }, 10); // 10ms debounce delay

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const getSanitizedHTML = (htmlContent) => {
    return { __html: DOMPurify.sanitize(htmlContent) };
  };

  // Define dynamic styles for table based on the theme
  const tableStyles = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: theme === "dark" ? "#2b2b38" : "#f8f9fa",
      color: theme === "dark" ? "white" : "black",
      borderRadius: "8px", // Rounded corners for the table
      overflow: "hidden", // Ensure content doesn't overflow outside the border
    },
    th: {
      padding: "10px",
      backgroundColor: theme === "dark" ? "#3b3b4b" : "#e9ecef",
      color: theme === "light" ? "black" : "white",
      textAlign: "left", // Align text to the left for a cleaner look
    },
    td: {
      padding: "10px",
      backgroundColor: theme === "dark" ? "#2b2b38" : "#ffffff",
      color: theme === "dark" ? "white" : "black",
      borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #ddd", // Lighter borders for light mode
    },
    tr: {
      borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #ddd",
    },
    container: {
      padding: "20px",
      backgroundColor: theme === "dark" ? "#343a40" : "#ffffff", // Background based on theme
      borderRadius: "8px",
      margin: "20px 0", // Add some margin around the container
    },
    heading: {
      color: theme === "dark" ? "#f8f9fa" : "#343a40", // Adjust heading color for both themes
      marginBottom: "15px",
      fontSize: "1.25rem",
    },
  };

  return (
    <div
      style={{

        backgroundColor: theme === "dark" ? "#343a40" : "#ffffff", // Background based on theme

        display: "flex",
        height: "100vh", // Parent container will fill the entire viewport height
        margin: 0,
        padding: 0,
      }}
    >
      {/* Left Column for Question */}
      <div
        style={{
          width: `${leftColWidth}%`, // Left column width is based on `leftColWidth`
          height: "100%", // Ensure it fills the height of the parent container
          overflowY: "auto", // Allow scrolling if content overflows
          display: "flex",
          flexDirection: "column", // Align the content in a column
          justifyContent: "flex-start", // Align content to the top
          alignItems: "stretch", // Stretch to fit content
        }}
      >
        <div
          className="d-flex flex-column"
          style={{
            // border: "1px solid #ddd",
            width: "100%",
            overflowY: "auto", // Allows scrolling if the content overflows
          }}
        >
          <div
            className="w-100"
            style={{
              backgroundColor: theme === "dark" ? "#343a40" : "#f8f9fa", // Set background color based on theme
              color: theme === "dark" ? "#f8f9fa" : "#343a40", // Set text color based on theme
              padding: "1rem",
            }}
          >




            <div>



              {mode === "solution" && (

                data.video ? (

                <>
                <h1>Video Solution :</h1>
                  <div className="flex justify-center items-center p-4">
                    <ReactPlayer
                      url={data.video}
                      controls
                      width="100%"
                      height="360px"
                    />
                  </div>
                 

                </>
                 )

                 :( <></>)

              )}





              <div
                dangerouslySetInnerHTML={
                  mode === "statement"
                    ? getSanitizedHTML(data.question + "")
                    : getSanitizedHTML(data.solution)
                }
              />





              {mode === "statement" && (
                <div style={tableStyles.container}>
                  <h3 style={tableStyles.heading}>Sample Test Cases :</h3>
                  <table style={tableStyles.table}>
                    <thead>
                      <tr style={tableStyles.tr}>
                        <th style={tableStyles.th}>Input</th>
                        <th style={tableStyles.th}>Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testdata.map((row, index) => (
                        <tr key={index} style={tableStyles.tr}>
                          <td style={tableStyles.td}>
                            <div dangerouslySetInnerHTML={{ __html: row.input.replace(/\n/g, "<br>") }} />
                          </td>
                          <td style={tableStyles.td}>
                            <div dangerouslySetInnerHTML={{ __html: row.output.replace(/\n/g, "<br>") }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div
        style={{
          width: "5px",
          cursor: "ew-resize",
          backgroundColor: "gray",
          height: "100%", // Divider takes the full height of the container
          zIndex: 1,
        }}
        onMouseDown={handleMouseDown}
      ></div>

      {/* Right Column for CodeEditor */}
      <div
        style={{
          width: `${100 - leftColWidth}%`, // Right column takes the remaining space
          height: "100%", // Ensure it takes the full height of the parent container
          overflowY: "auto", // Enable vertical scrolling if necessary
        }}
      >
        <CodeEditor lan={lan} data={data} />
      </div>
    </div>
  );
}

export default CodeWindow;
