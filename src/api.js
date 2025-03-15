import axios from "axios";
import { LANGUAGE_VERSIONS } from "./constants";

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


const SQLAPI = axios.create({
  baseURL: "http://20.193.131.218:3000",
});

export const executeQuery = async (query) => {
  try {
    const response = await SQLAPI.post("/query", { query });
    console.log(response);
    return response.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.details || "Error executing query");
  }
};