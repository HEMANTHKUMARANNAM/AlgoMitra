import { useRef, useState, useEffect, useCallback, useContext } from "react";
import { Editor , loader} from "@monaco-editor/react";
import { CODE_SNIPPETS , javasuggestions } from "../constants";
import Output from "./Output";
import { useTheme } from "../ThemeContext"; // Import Theme Context
import { decryptParam } from "../cryptoUtils";
import { useParams } from "react-router-dom";
import { ref, set, get, child } from "firebase/database";
import { database } from "../firebase"; // Firebase configuration
import { AuthContext } from '../utility/AuthContext'; // Import AuthProvider
import * as monaco from "monaco-editor";
import {  toast } from "react-toastify";


const CodeEditor = ({ lan, data }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  const [language, setLanguage] = useState(lan); // Set language from props initially
  const { theme } = useTheme(); // Access the theme from ThemeContext
  const saveTimeoutRef = useRef(null); // Reference to track the debounce timer
  const {  questionId } = useParams();
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
  

      const suggestions = [
        ...javasuggestions.map(item => ({
          label: item.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: item.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: item.documentation,
          additionalTextEdits: item.additionalTextEdits
          
        }))
      ];
  
        
        
        return { suggestions };
      },
    });



   // Only trigger suggestions after typing the first letter
   let isTypingStarted = false;

   editor.onDidChangeModelContent(() => {
     // Check if user has started typing (after the first letter)
     if (!isTypingStarted && editor.getValue().length > 0) {
       isTypingStarted = true;
       editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
     }
   });


     // Ensure the editor is focused
     editor.focus();
  
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
          onMount={handleEditorDidMount }

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
