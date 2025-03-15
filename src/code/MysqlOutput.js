import React, { useState, useContext, useEffect } from "react";
import { Button, Spinner, Form, Row, Col } from "react-bootstrap";
import { executeCode, executeQuery } from "../api";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTheme } from "../ThemeContext";
import { database } from "../firebase";
import { ref, set, get } from "firebase/database";
import { AuthContext } from "../utility/AuthContext";
import { decryptParam } from "../cryptoUtils";

const MyOutput = ({ editorRef, language, data  }) => {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [input, setInput] = useState(data.testcases[0]?.input || "");
  const [isCodeExecuted, setIsCodeExecuted] = useState(false);
  const [response, setResponse] = useState([]);


  function handleQueryResult(result) {
    const allResults = [];

    if (Array.isArray(result) && result.every(item => !Array.isArray(item) && item !== null)) {
      console.log(`Result set ${1}:`, result);
      allResults.push({ type: 'data', data: result});
      setResponse(allResults);
      return;
  }

    if (Array.isArray(result)) {
        result.forEach((item, index) => {
            if (Array.isArray(item)) {
                allResults.push({ type: 'data', data: item });
            } else if (item && typeof item === 'object' && 'affectedRows' in item) {
                // allResults.push({ type: 'header', data: item });
            } else {
                console.log(`Unknown format at index ${index}:`, item);
            }
        });
    } else {
        console.log('Unexpected result format:', result);
    }

    setResponse(allResults);
}


  const { course, questionId } = useParams();

  // Decrypt URL parameters
  const decryptedCourse = decryptParam(course);
  const decryptedQuestionId = decryptParam(questionId);

  const { user } = useContext(AuthContext);
  const { theme } = useTheme();


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


      const resultlist = await executeQuery(sourceCode);

      handleQueryResult(resultlist);

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
    if (!sourceCode) {
      toast.error("No code to submit!");
      return;
    }

    let allPassed = false;
  
    try {
      setIsSubmitting(true);
      setIsError(false);

      try {
        setIsRunning(true);
        setIsError(false);
  
  
        const resultlist = await executeQuery(sourceCode);

        const r = handleResult(resultlist)

        const d = handleResult(data.testcases);

        if(r.length != d.length)
        {
          console.log(false);
          allPassed = false;
          setIsCodeExecuted(true);
        }
        else
        {

          let test = true;
          for(let i ; i< r.length ; i++)
          {
            test = test && verifyResults(r[i] , d[i])
          }

          allPassed = test;


        console.log(allPassed);

        console.log(resultlist);

        setIsCodeExecuted(true);

        }
  
        
      } catch (error) {
        console.error("Error executing code:", error);
        setIsError(true);
        setIsCodeExecuted(true);
      } finally {
        setIsRunning(false);
      }
      
      // Save the result to Firebase if the user is authenticated
      if (user && allPassed) {
        await saveResult(database, user, decryptedQuestionId, allPassed);
        toast.success("All test cases passed! Your solution has been saved.");
      } else if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed. Please check your solution.");
      }
      
      setIsCodeExecuted(true);
    } catch (error) {
      console.error("Error submitting code:", error);
      setIsError(true);
      setIsCodeExecuted(true);
      toast.error("Error executing code: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const verifyResults = (results, expectedOutput) => {
    if (!Array.isArray(results) || !Array.isArray(expectedOutput)) {
      return false;
    }

    console.log(expectedOutput);
    
    // For simple array of objects comparison
    if (Array.isArray(results) && !Array.isArray(results[0])) {
      // Check if arrays have the same length
      if (results.length !== expectedOutput.length) return false;
      
      // Compare each object's contents ignoring property order
      for (let i = 0; i < results.length; i++) {
        const resultObj = results[i];
        const expectedObj = expectedOutput[i];
        
        // Compare if objects have the same keys
        const resultKeys = Object.keys(resultObj).sort();
        const expectedKeys = Object.keys(expectedObj).sort();
        
        if (JSON.stringify(resultKeys) !== JSON.stringify(expectedKeys)) return false;


        
        // Compare values for each key
        for (const key of resultKeys) {
          if( resultObj[key] === null &&  expectedObj[key] === "null")continue;
          if (resultObj[key] !== expectedObj[key]) return false;
        }
      }
      return true;
    }
    
    // Handle nested array results
    if (Array.isArray(results) && Array.isArray(results[0])) {
      if (results.length !== expectedOutput.length) return false;
      
      for (let i = 0; i < results.length; i++) {
        const resultSet = results[i];
        const expectedSet = expectedOutput[i];
        
        if (resultSet.length !== expectedSet.length) return false;
        
        // Compare each object in the nested arrays
        for (let j = 0; j < resultSet.length; j++) {
          const resultObj = resultSet[j];
          const expectedObj = expectedSet[j];
          
          const resultKeys = Object.keys(resultObj).sort();
          const expectedKeys = Object.keys(expectedObj).sort();
          
          if (JSON.stringify(resultKeys) !== JSON.stringify(expectedKeys)) return false;
          
          for (const key of resultKeys) {
            if (resultObj[key] !== expectedObj[key]) return false;
          }
        }
      }
      return true;
    }
    
    return false;
  };


  function handleResult(result) {
    const allResults = [];

    if (Array.isArray(result) && result.every(item => !Array.isArray(item) && item !== null)) {
        console.log(`Result set ${1}:`, result);
        allResults.push(result);
        console.log(allResults);
        return allResults;
    }

    if (Array.isArray(result)) {
        result.forEach((item, index) => {
            if (Array.isArray(item)) {
                allResults.push(item );
            } else if (item && typeof item === 'object' && 'affectedRows' in item) {
                // allResults.push({ type: 'header', data: item });
            } else {
                console.log(`Unknown format at index ${index}:`, item);
            }
        });
    } else {
        console.log('Unexpected result format:', result);
    }

    console.log(allResults);

    return allResults;
}

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
      <ToastContainer/>
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
              {response.length >0 ? (
                response.map((result, resultIndex) => (
                  <div key={resultIndex} className="overflow-auto border rounded mt-4">
                      {result.type === 'data' && (
                          <table className="table-auto w-full border-collapse border border-gray-300">
                              <thead className="bg-blue-100">
                                  <tr>
                                      {Object.keys(result.data[0] || {}).map((key) => (
                                          <th key={key} className="border border-gray-300 px-4 py-2">
                                              {key}
                                          </th>
                                      ))}
                                  </tr>
                              </thead>
                              <tbody>
                                  {result.data.map((row, index) => (
                                      <tr key={index} className="odd:bg-white even:bg-gray-100">
                                          {Object.values(row).map((value, idx) => (
                                              <td key={idx} className="border border-gray-300 px-4 py-2">
                                                  {value}
                                              </td>
                                          ))}
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
  
                      {result.type === 'header' && (
                          <p className="p-2 text-green-600">
                              {`Query ${resultIndex + 1}: ${result.data.affectedRows} row(s) affected.`}
                          </p>
                      )}
                  </div>
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

export default MyOutput;
