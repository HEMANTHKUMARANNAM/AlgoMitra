import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";
import { database } from "./firebase";
import { ref, get } from "firebase/database";

const API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
});

export const executeCode = async (language, sourceCode, input) => {
  
  const response = await API.post("/execute", {
    language: language,
    version: LANGUAGE_VERSIONS[language],
    files: [
      {
        content: sourceCode,
      },
    ],
    // Include the input here
    stdin: input,  // This is where we add the user input to the request payload
  });
  // console.log( typeof(response.data.run.output) );
  return response.data;
};


// const SQLAPI = axios.create({
//   baseURL: await get(ref(database, `myserver`)).val(),
// });

// export const executeQuery = async (query) => {
//   try {
//     const response = await SQLAPI.post("/query", { query });
//     console.log(response);
//     return response.data.data;
//   } catch (err) {
//     throw new Error(err.response?.data?.details || "Error executing query");
//   }
// };


// Refactor executeQuery to fetch the SQL API base URL asynchronously
export const executeQuery = async (query) => {
  try {
    // console.log((await get(ref(database, `myserver`))).val());

    // Fetch the base URL from Firebase at runtime
    // const sqlBaseURL = "https://skin-communities-duties-halo.trycloudflare.com/";
    const sqlBaseURL = (await get(ref(database, `myserver`))).val();




    // Initialize the SQL API with the base URL from Firebase
    const SQLAPI = axios.create({
      baseURL: sqlBaseURL,
    });

    const response = await SQLAPI.post("/query", { query });
    console.log(response);
    return response.data.data;
  } catch (err) {
    return ( { "error" : err.response?.data?.details || "Error executing query" });
  }
};