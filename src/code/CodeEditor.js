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
import MyOutput from "./MysqlOutput";

const CodeEditor = ({ lan, data, mysql }) => {
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
    // const detectDevTools = () => {
    //   if (window.outerWidth - window.innerWidth > 100 || window.outerHeight - window.innerHeight > 100) {
    //     alert("Developer Tools Detected! Paste is blocked.");
    //     window.location.reload();
    //   }
    // };

    document.addEventListener("paste", blockPaste);
    // window.addEventListener("resize", detectDevTools);

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
  };

  useEffect(() => {
    console.log(mysql);
    setLanguage(lan); // Set language based on the prop
    loadCode();
    
    // Cleanup function
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Remove event listeners
      document.removeEventListener("paste", (event) => {
        event.preventDefault();
      });
      
      window.removeEventListener("resize", () => {});
    };
  }, [lan, user?.uid, decryptedQuestionId]); // Effect depends on lan and user

  return (
    <div 
      className="d-flex flex-column"
      style={{ 
        border: "1px solid #ddd", 
        height: "100vh",
        maxHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}
    >
      {/* Main Content Area */}
      <div 
        style={{
          backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e",
          color: theme === "light" ? "#000" : "#fff",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden"
        }}
      >
        {/* Editor Container - Takes 45% of available height */}
        <div style={{ height: "45%", minHeight: "200px" }}>
          <Editor
            height="100%"
            language={language}
            defaultValue={CODE_SNIPPETS[language]}
            theme={editorTheme}
            onMount={handleEditorDidMount}
            value={value}
            options={{
              scrollBeyondLastLine: false,
              minimap: { enabled: false },
              padding: { top: 10, bottom: 10 },
              lineNumbers: "on",
              contextmenu: false,
            }}
            onChange={handleCodeChange}
          />
        </div>
        
        {/* Separator */}
        <div style={{ padding: "8px", borderTop: "1px solid #ccc", borderBottom: "1px solid #ccc" }}></div>
        
        {/* Output Container - Takes remaining space with scrolling */}
        <div style={{ 
          flex: 1,
          overflow: "auto",
          padding: "16px",
          minHeight: "200px"
        }}>
          {mysql 
            ? <MyOutput editorRef={editorRef} language={language} data={data} />
            : <Output editorRef={editorRef} language={language} data={data} />
          }
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;