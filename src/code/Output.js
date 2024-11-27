import React, { useState, useContext, useEffect } from "react";
import { Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { executeCode } from "../api";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../ThemeContext";
import { database } from "../firebase";
import { ref, set, get } from "firebase/database";
import { AuthContext } from "../utility/AuthContext";
import { decryptParam } from "../cryptoUtils";

const Output = ({ editorRef, language, data }) => {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [input, setInput] = useState(data.testcases[0]?.input || "");
  const [isCodeExecuted, setIsCodeExecuted] = useState(false);

  const { course, questionId } = useParams();

  // Decrypt URL parameters
  const decryptedCourse = decryptParam(course);
  const decryptedQuestionId = decryptParam(questionId);

  const { user } = useContext(AuthContext);
  const { theme } = useTheme();

  const testCases = data.testcases;

  // Clear output and reset state when URL parameters change
  useEffect(() => {
    setOutput([]);
    setIsCodeExecuted(false);
    setIsError(false);
    setInput(data.testcases[0]?.input || "");
  }, [decryptedCourse, decryptedQuestionId, data.testcases]);

  const runCode = async () => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) return;

    try {
      setIsRunning(true);
      setIsError(false);
      const { run: result } = await executeCode(language, sourceCode, input);

      const resultlist = result.output ? result.output.split("\n") : ["No output received."];
      while (resultlist[resultlist.length - 1] === "") {
        resultlist.pop();
      }

      setOutput(resultlist);
      setIsError(result.stderr ? true : false);
      setIsCodeExecuted(true);
    } catch (error) {
      console.error("Error executing code:", error);
      setIsError(true);
      setIsCodeExecuted(true);
    } finally {
      setIsRunning(false);
    }
  };

  const saveResult = async (database, user, decryptedQuestionId, allPassed) => {
    try {
      const resultRef = ref(database, `results/${user.uid}/${decryptedQuestionId}`);
      const snapshot = await get(resultRef);

      if (snapshot.exists() && snapshot.val() === true) {
        console.log("Result already true, no update needed.");
        return;
      }

      await set(resultRef, allPassed);
    } catch (error) {
      console.error("Error saving result:", error);
    }
  };

  const handleSubmit = async () => {
    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) return;

    try {
      setIsSubmitting(true);
      setIsError(false);
      const results = [];
      for (const { input: testInput, expectedOutput } of testCases) {
        const { run: result } = await executeCode(language, sourceCode, testInput);
        const resultlist = result.output ? result.output.split("\n") : ["No output received."];
        while (resultlist[resultlist.length - 1] === "") {
          resultlist.pop();
        }

        const expectedOutputLines = expectedOutput.split("\n");
        while (expectedOutputLines[expectedOutputLines.length - 1] === "") {
          expectedOutputLines.pop();
        }


        console.log( resultlist + "====" + expectedOutputLines );

        const areEqual =
          resultlist.length === expectedOutputLines.length &&
          resultlist.every(
            (value, index) => value.replace(/\s+$/, "") === expectedOutputLines[index].replace(/\s+$/, "")
          );

        results.push(areEqual);
      }

      const allPassed = results.every((passed) => passed);

      await saveResult(database, user, decryptedQuestionId, allPassed);

      if (allPassed) {
        toast.success("Correct Answer! All test cases passed.", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Wrong Answer! Some test cases failed.", {
          position: "top-right",
          autoClose: 3000,
        });
      }

      const formattedResults = results.map((passed, idx) => `Test Case ${idx + 1}: ${passed ? "PASSED" : "FAILED"}`);
      setOutput(formattedResults);
      setIsCodeExecuted(true);
    } catch (error) {
      console.error("Error during test cases:", error);
      setIsError(true);
      toast.error("An error occurred while executing test cases.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsCodeExecuted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="container-fluid p-0"
      style={{
        overflow: "hidden",
        padding: "2vh 5vw",
        backgroundColor: theme === "light" ? "#f8f9fa" : "rgb(30,30,30)",
        color: theme === "light" ? "#000" : "#fff",
      }}
    >
      <ToastContainer />
      <div className="row">
        <div className="col-md-12 d-flex flex-column" style={{ height: "auto" }}>
          <Form.Group className="mb-3" controlId="codeInput">
            <Form.Label htmlFor="codeInput">Enter Input</Form.Label>
            <Form.Control
              as="textarea"
              id="codeInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={data.testcases[0]?.input || ""}
              style={{
                height: "10vh",
                overflowY: "scroll",
                resize: "none",
                backgroundColor: theme === "light" ? "#fff" : "#333",
                color: theme === "light" ? "#000" : "#fff",
                border: `1px solid ${theme === "light" ? "#ccc" : "#555"}`,
                borderRadius: "4px",
              }}
              aria-label="Code Input"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col sm={6}>
              <Button
                variant={theme === "light" ? "primary" : "dark"}
                className="w-100"
                disabled={isRunning || isSubmitting}
                onClick={runCode}
                style={{
                  height: "6vh",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  border: `1px solid ${theme === "light" ? "#007bff" : "#555"}`,
                  boxShadow: isRunning ? "0 0 5px rgba(0, 0, 0, 0.2)" : "none",
                }}
              >
                {isRunning ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Running...
                  </>
                ) : (
                  "Run Code"
                )}
              </Button>
            </Col>
            <Col sm={6}>
              <Button
                variant={theme === "light" ? "secondary" : "outline-light"}
                className="w-100"
                disabled={isRunning || isSubmitting}
                onClick={handleSubmit}
                style={{
                  height: "6vh",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  border: `1px solid ${theme === "light" ? "#6c757d" : "#555"}`,
                  boxShadow: isSubmitting ? "0 0 5px rgba(0, 0, 0, 0.2)" : "none",
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Testing...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </Col>
          </Row>

          {isCodeExecuted && (
            <div
              style={{
                height: "35vh",
                width: "100%",
                border: `1px solid ${isError ? "red" : theme === "light" ? "#ccc" : "#555"}`,
                padding: "1vh",
                color: isError ? "red" : theme === "light" ? "#333" : "#ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                overflowY: "scroll",
              }}
            >
              <p>Output :</p>
              {output.length > 0 ? (
                output.map((line, i) => (
                  <pre
                    key={i}
                    style={{
                      marginBottom: "0.5rem",
                      whiteSpace: "pre-wrap",
                      display: "flex",
                    }}
                  >
                    <span style={{ color: theme === "light" ? "#999" : "#bbb", marginRight: "8px" }}>{i + 1}.</span>
                    <span>{line}</span>
                  </pre>
                ))
              ) : (
                <pre>No output received.</pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Output;
