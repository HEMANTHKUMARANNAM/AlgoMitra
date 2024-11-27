import { useRef, useState, useEffect, useCallback, useContext } from "react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { decryptParam } from "../cryptoUtils";
import { useParams } from "react-router-dom";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase"; // Firebase configuration
import { AuthContext } from '../utility/AuthContext'; // Import AuthProvider

const CodeEditor = ({ lan, data }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState(lan); // Set language from props initially
  const { theme } = useTheme(); // Access the theme from ThemeContext
  const saveTimeoutRef = useRef(null); // Reference to track the debounce timer
  const { course, questionId } = useParams();
  const { user } = useContext(AuthContext);  // Get the current user from AuthContext

  // Decrypt URL parameters
  const decryptedCourse = decryptParam(course);
  const decryptedQuestionId = decryptParam(questionId);

  // Map theme context to Monaco editor themes
  const editorTheme = theme === "light" ? "vs-light" : "vs-dark";

  // Debounced save function
  const handleCodeChange = (newValue) => {
    setValue(newValue);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveCode(newValue);
    }, 500);
  };

  const loadCode = async () => {
    if (!user?.uid || !decryptedQuestionId) return; // Ensure we have both user ID and question ID
    const dbRef = ref(database);
    try {
      const snapshot = await get(child(dbRef, `savedCode/${user.uid}/${decryptedQuestionId}/${lan}`));
      setValue(snapshot.exists() ? snapshot.val() : CODE_SNIPPETS[lan] || ""); // Use default snippet if no data exists
    } catch (error) {
      console.error("Error loading code:", error);
      setValue(CODE_SNIPPETS[lan] || "");
    }
  };

  const saveCode = useCallback(
    async (code) => {
      if (!user?.uid || !decryptedQuestionId) return; // Ensure we have both user ID and question ID
      const dbRef = ref(database, `savedCode/${user.uid}/${decryptedQuestionId}/${language}`);
      try {
        await set(dbRef, code);
        console.log("Code auto-saved successfully!");
      } catch (error) {
        console.error("Error saving code:", error);
      }
    },
    [user?.uid, decryptedQuestionId, language]
  );

  

  useEffect(() => {
    setLanguage(lan); // Set language based on the prop
    loadCode();
  }, [lan, user?.uid, decryptedQuestionId]); // Effect depends on lan and user

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  return (
    <div
      className="d-flex flex-column"
      style={{ border: "1px solid #ddd", height: "100%" }} // Full viewport height for the container
    >
      {/* Scrollable Area */}
      <div 
        className="flex-grow-1 overflow-auto p-3" 
        style={{ 
          backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e", // Adjust background color based on theme
          color: theme === "light" ? "#000" : "#fff", // Adjust text color
          height: "calc(100vh - 15vh)", // Adjusted height for a more compact editor + output area
          overflowY: "auto", // Enable vertical scrolling if content overflows
        }}
      >
        {/* Monaco Editor */}
        <Editor
          height="50vh" // Decreased editor height to 50% of the viewport height
          language={language}
          defaultValue={CODE_SNIPPETS[language]}
          theme={editorTheme} // Use dynamic theme
          onMount={onMount}
          value={value}
          options={{
            scrollBeyondLastLine: false, // Disable extra space below
            minimap: { enabled: false },
            padding: { top: 10, bottom: 10 }, // Add padding
            lineNumbers: "on", // Show line numbers
          }}
          onChange={handleCodeChange}
        />

        <br></br>

        {/* Output Area */}
        <Output editorRef={editorRef} language={language} data={data} />
      </div>
    </div>
  );
};

export default CodeEditor;
