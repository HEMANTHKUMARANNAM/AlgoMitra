
export const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  java: "15.0.2",
  // c: "c"  // Ensure the version is correct for C
  javascript: "18.15.0",
};

export const CODE_SNIPPETS = {
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Kumar")\n`,
  java: `\npublic class AlgoMitra {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("AlgoMitra");\n\t}\n}\n`,
  // c: `#include <stdio.h>\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}\n`, // Added newline after printf for cleaner output and better format
  javascript: `function sum(a, b) \n{\n\treturn a + b;\n}\nconsole.log(sum(3, 4));`,
};

export const name = "Algo Mitra";

export const javasuggestions = [
  {
    label: "Scanner",
    // kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "Scanner ${1:scanner} = new Scanner(System.in);",
    // insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Create a Scanner object for reading user input in Java.",
    additionalTextEdits: [
      {
        range: {
          start: { lineNumber: 0, column: 0 },
          end: { lineNumber: 0, column: 0 },
        },
        text: "import java.util.Scanner;\n", // Automatically import Scanner at the top
      },
    ],
  },
  {
    label: "Main",
    // kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "public static void main(String[] args) {\n\t${1:// Your code here}\n}",
    // insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Main method in Java.",
  },
  {
    label: "ForLoop",
    // kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "for (int ${1:i} = 0; ${1:i} < ${2:10}; ${1:i}++) {\n\t${3:// Your code here}\n}",
    // insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "For loop in Java.",
  },
  {
    label: "Systemoutprint",
    // kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: "System.out.println(${1:\"Your message here\"});",
    // insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: "Print a message to the console in Java.",
  },
];
