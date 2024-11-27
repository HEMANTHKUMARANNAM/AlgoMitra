export const LANGUAGE_VERSIONS = {
  python: "3.10.0",
  java: "15.0.2",
  // c: "c17"  // Ensure the version is correct for C
};

export const CODE_SNIPPETS = {
  python: `\ndef greet(name):\n\tprint("Hello, " + name + "!")\n\ngreet("Kumar")\n`,
  java: `\npublic class AlgoMitra {\n\tpublic static void main(String[] args) {\n\t\tSystem.out.println("AlgoMitra");\n\t}\n}\n`,
  // c: `#include <stdio.h>\nint main() {\n\tprintf("Hello, World!\\n");\n\treturn 0;\n}\n` // Added newline after printf for cleaner output and better format
};

export const name = "Algo Mitra";