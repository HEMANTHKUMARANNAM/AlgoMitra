import { useRef, useState, useEffect, useCallback, useContext } from "react";
import { Editor, loader } from "@monaco-editor/react";
import { CODE_SNIPPETS, javasuggestions } from "../constants";
import Output from "./Output";
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { decryptParam } from "../cryptoUtils";
import { useParams } from "react-router-dom";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase"; // Firebase configuration
import { AuthContext } from '../utility/AuthContext'; // Import AuthProvider
import * as monaco from "monaco-editor";
import { toast } from "react-toastify";


const CodeEditor = ({ lan, data }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState(lan); // Set language from props initially
  const { theme } = useTheme(); // Access the theme from ThemeContext
  const saveTimeoutRef = useRef(null); // Reference to track the debounce timer
  const { questionId } = useParams();
  const { user } = useContext(AuthContext);  // Get the current user from AuthContext

  // Decrypt URL parameters
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

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Disable Copy (Ctrl + C)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      toast.error("Copy disabled!", {
        position: "top-right",
        autoClose: 3000,
      });
    });

    // Disable Paste (Ctrl + V)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.error("Paste disabled!", {
        position: "top-right",
        autoClose: 3000,
      });
    });

    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      toast.error("Shift insert disabled!😭", {
        position: "top-right",
        autoClose: 3000,
      });


    });

    // Register custom auto-suggestions for JavaScript
    monaco.languages.registerCompletionItemProvider("java", {
      provideCompletionItems: () => {


        const uniqueSuggestions = Array.from(
          new Map(
            javasuggestions.map((item) => [
              item.label, // Use the label as the unique key
              {
                label: item.label,
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: item.insertText,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: item.documentation,
              },
            ])
          ).values()
        );



        // return { suggestions };

        return { suggestions: uniqueSuggestions };
      },
    });

    // 🚫 2. Remove Paste from Right-Click Menu
    editor.updateOptions({
      contextmenu: false, // Disables right-click menu
    });

    // 🚫 3. Block Clipboard Events (Prevents extensions & force-paste)
    const blockPaste = (event) => {
      event.preventDefault();
      alert("Pasting is completely disabled!");
    };

     // 🚫 5. Detect & Block Developer Tools (Prevents bypassing restrictions)
     const detectDevTools = () => {
      if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
        alert("Developer Tools Detected! Paste is blocked.");
        window.location.reload();
      }
    };


    document.addEventListener("paste", blockPaste);

       // 🚫 4. Override Clipboard API (Stops extensions)
       navigator.clipboard.writeText = () => {
        alert("Clipboard access is blocked!");
        return Promise.reject("Clipboard write blocked");
      };
  
      navigator.clipboard.readText = () => {
        alert("Clipboard reading is blocked!");
        return Promise.reject("Clipboard read blocked");
      };





    // Trigger suggestions only when the user types an alphabet
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      const lastChar = value.slice(-1); // Get the last typed character

      // Check if the last character is an alphabet (A-Z or a-z)
      if (/^[a-zA-Z]$/.test(lastChar)) {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
      }
    });

    // Ensure the editor is focused
    editor.focus();
     // Cleanup function when component unmounts
     return () => {
      editor.dispose();
      document.removeEventListener("paste", blockPaste);
      window.removeEventListener("resize", detectDevTools);
    };

  };








  useEffect(() => {
    setLanguage(lan); // Set language based on the prop
    loadCode();
  }, [lan, user?.uid, decryptedQuestionId]); // Effect depends on lan and user










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
          onMount={handleEditorDidMount}

          value={value}
          options={{
            scrollBeyondLastLine: false, // Disable extra space below
            minimap: { enabled: false },
            padding: { top: 10, bottom: 10 }, // Add padding
            lineNumbers: "on", // Show line numbers
            contextmenu: false, // Disable context menu globally

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
