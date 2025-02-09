import { useRef, useState, useEffect, useCallback, useContext } from "react";
import { Editor } from "@monaco-editor/react";
import { CODE_SNIPPETS, javasuggestions } from "../../constants";
import Output from "./Output";
import { useTheme } from "../../ThemeContext";
import { useParams } from "react-router-dom";
import { ref, set, onValue, off } from "firebase/database";
import { database } from "../../firebase";
import { AuthContext } from '../../utility/AuthContext';
import { toast } from "react-toastify";

const CodeEditor = ({ lan, data }) => {
  const editorRef = useRef();
  const [value, setValue] = useState("");
  // const [language, setLanguage] = useState(lan);
  const { theme } = useTheme();
  const saveTimeoutRef = useRef(null);
  const { testid } = useParams();
  const { user } = useContext(AuthContext);
  
  const editorTheme = theme === "light" ? "vs-light" : "vs-dark";

  // Real-time code loading
  useEffect(() => {
    if (!user?.uid || !data.questionname) return;

    const dbRef = ref(database, `/exams/savedCode/${user.uid}/${testid}/${data.questionname}/${lan}`);
    
    const unsubscribe = onValue(dbRef, (snapshot) => {
      setValue(snapshot.exists() ? snapshot.val() : CODE_SNIPPETS[lan] || "");
    }, (error) => {
      console.error("Error loading code:", error);
      setValue(CODE_SNIPPETS[lan] || "");
    });
    
    return () => off(dbRef);
  }, [lan,data.questionname, user?.uid]);

  // Debounced save function
  const handleCodeChange = (newValue) => {
    setValue(newValue);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCode(newValue), 500);
  };

  const saveCode = useCallback(async (code) => {
    if (!user?.uid || !data.questionname) return;
    const dbRef = ref(database, `/exams/savedCode/${user.uid}/${testid}/${data.questionname}/${lan}`);
    try {
      await set(dbRef, code);
      console.log("Code auto-saved successfully!");
    } catch (error) {
      console.error("Error saving code:", error);
    }
  }, [user?.uid, data.questionname,lan]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      toast.error("Copy disabled!", { position: "top-right", autoClose: 3000 });
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      toast.error("Paste disabled!", { position: "top-right", autoClose: 3000 });
    });
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyCode.Insert, () => {
      toast.error("Shift insert disabled!", { position: "top-right", autoClose: 3000 });
    });

    // Register Java suggestions
    monaco.languages.registerCompletionItemProvider("java", {
      provideCompletionItems: () => {
        const uniqueSuggestions = Array.from(new Map(javasuggestions.map(item => [
          item.label,
          { label: item.label, kind: monaco.languages.CompletionItemKind.Snippet, insertText: item.insertText, insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet, documentation: item.documentation }
        ])).values());
        return { suggestions: uniqueSuggestions };
      },
    });

    editor.onDidChangeModelContent(() => {
      const lastChar = editor.getValue().slice(-1);
      if (/^[a-zA-Z]$/.test(lastChar)) {
        editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
      }
    });

    editor.focus();
  };

  return (
    <div className="d-flex flex-column" style={{ border: "1px solid #ddd", height: "100%" }}>
      <div className="flex-grow-1 overflow-auto p-3" style={{ backgroundColor: theme === "light" ? "#ffffff" : "#1e1e1e", color: theme === "light" ? "#000" : "#fff", height: "calc(100vh - 15vh)", overflowY: "auto" }}>
        <Editor
          height="50vh"
          language={lan}
          defaultValue={CODE_SNIPPETS[lan]}
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
        <br />
        <Output editorRef={editorRef} language={lan} data={data} />
      </div>
    </div>
  );
};

export default CodeEditor;
