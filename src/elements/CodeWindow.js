import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import CodeEditor from "../code/CodeEditor";
import debounce from 'lodash.debounce'; // Import debounce
import { useTheme } from '../ThemeContext'; // Import Theme Context
import { Image, Alert } from 'react-bootstrap';
import ReactPlayer from "react-player";
import nosolution from "../assets/9233845_4117020.svg";
import DatabaseSchema from "../components/DatabaseSchema";

function CodeWindow({ mode, data, lan , mysql }) {
  const [leftColWidth, setLeftColWidth] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [mouseStartX, setMouseStartX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  const { theme } = useTheme(); // Access the theme from context

  function gettestdata() {

    
  const testdata = data.testcases.slice(0, 3).map((testcase) => ({
    input: testcase.input,
    output: testcase.expectedOutput,
  }));

  return testdata;

    
  }

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;

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
  }, 15);

  const handleMouseUp = () => setDragging(false);
  const handleRightClick = (e) => {
    if (dragging) setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("contextmenu", handleRightClick);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleRightClick);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("contextmenu", handleRightClick);
    };
  }, [dragging]);

  const getSanitizedHTML = (htmlContent) => ({ __html: DOMPurify.sanitize(htmlContent) });

  const tableStyles = {
    table: {
      width: "100%",
      borderCollapse: "collapse",
      backgroundColor: theme === "dark" ? "#2b2b38" : "#f8f9fa",
      color: theme === "dark" ? "white" : "black",
      borderRadius: "8px",
      overflow: "hidden",
    },
    th: {
      padding: "10px",
      backgroundColor: theme === "dark" ? "#3b3b4b" : "#e9ecef",
      color: theme === "light" ? "black" : "white",
      textAlign: "left",
    },
    td: {
      padding: "10px",
      backgroundColor: theme === "dark" ? "#2b2b38" : "#ffffff",
      color: theme === "dark" ? "white" : "black",
      borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #ddd",
    },
    tr: {
      borderBottom: theme === "dark" ? "1px solid #444" : "1px solid #ddd",
    },
    container: {
      padding: "20px",
      backgroundColor: theme === "dark" ? "#212529" : "#ffffff",
      borderRadius: "8px",
      margin: "20px 0",
    },
    heading: {
      color: theme === "dark" ? "#f8f9fa" : "#212529",
      marginBottom: "15px",
      fontSize: "1.25rem",
    },
  };

  return (
    <div style={{ backgroundColor: theme === "dark" ? "#212529" : "#ffffff", display: "flex", height: "100%", padding: 0 }}>
      {/* Left Column */}
      <div style={{
        width: `${leftColWidth}%`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}>
        <div className="d-flex flex-column" style={{
          width: "100%",
          flex: 1, // Allow it to take the full remaining height
          maxHeight: "100%", // Ensure it doesn’t exceed the available space
          overflowY: "auto", // Enable scrolling when the content exceeds the max height
        }}>
          <div style={{
            backgroundColor: theme === "dark" ? "#212529" : "#f8f9fa",
            color: theme === "dark" ? "#f8f9fa" : "#212529",
            padding: "1rem",
          }}>
            {/* Video Solution */}
            {mode === "solution" && data.video && (
              <>
                <h1>Video Solution:</h1>
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "20px",
                }}>
                  {/* ReactPlayer for Video */}
                  <ReactPlayer url={data.video} controls width="100%" height="360px" />
                </div>
              </>
            )}

            {/* Displaying Solution */}
            {mode === "solution" && !data.video && !data.solution && (
              <>
                <Alert variant="info" className="my-4">
                  Solution will be available soon!
                </Alert>
                <div style={{ maxWidth: '100%', overflow: 'hidden', textAlign: 'center' }}>
                  <Image
                    src={nosolution}
                    alt="Coming soon"
                    fluid
                    style={{ maxWidth: '70%', height: 'auto' }}
                  />
                </div>
              </>
            )}

            {/* Question or Solution Display */}
            <div dangerouslySetInnerHTML={mode === "statement" ? getSanitizedHTML(data.question + "") : getSanitizedHTML(data.solution)} />

            {/* Sample Test Cases */}
            {mode === "statement" && !mysql && (
              <div style={tableStyles.container}>
                <h3 style={tableStyles.heading}>Sample Test Cases:</h3>
                <table style={tableStyles.table}>
                  <thead>
                    <tr style={tableStyles.tr}>
                      <th style={tableStyles.th}>Input</th>
                      <th style={tableStyles.th}>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gettestdata().map((row, index) => (
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

            {mode === "statement" && mysql &&
            (
              <DatabaseSchema testcases = {data.testcases} />
            )
            }



          </div>
        </div>
      </div>

      {/* Resizable Divider */}
      <div style={{ width: "5px", cursor: "ew-resize", backgroundColor: "gray", height: "100%", zIndex: 1 }} onMouseDown={handleMouseDown}></div>

      {/* Right Column */}
      <div style={{
        width: `${100 - leftColWidth}%`,
        height: "100%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}>
        <CodeEditor lan={lan} data={data} mysql = {mysql}  />
      </div>
    </div>
  );
}

export default CodeWindow;
