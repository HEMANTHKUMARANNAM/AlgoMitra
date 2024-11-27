import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';  // Importing the AuthProvider's useAuth hook
import { get, ref, onValue } from 'firebase/database';  // Firebase imports for Realtime Database
import { database } from "../firebase";

// Create a context to share the total number of questions
const QuestionContext = createContext();

export const useQuestions = () => useContext(QuestionContext);

const QuestionProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);  // Access the user and loading state from AuthProvider
  const [totalQuestions, setTotalQuestions] = useState(0);


  // Fetch total number of questions and calculate progress
  useEffect(() => {
    if (loading || !user) {
      setTotalQuestions(0);
      return;
    }

    const userId = user.uid;
    const dataRef = ref(database, '/'); // Root reference or adjust based on your database structure

    const unsubscribeData = onValue(dataRef, async (dataSnapshot) => {
      const data = dataSnapshot.val();

      // Fetch the results for this user
      const statusesSnapshot = await get(ref(database, `/results/${userId}`));
      const fetchedStatuses = statusesSnapshot.val() || {};

      let complete = 0;

      // Count completed questions
      for (const questionId in fetchedStatuses) {
        if (fetchedStatuses[questionId] === true) {
          complete++;
        }
      }

      // Count total questions in Problems and Patterns
      let count = 0;
      for (const course in data.codemasters) {
        count += Object.keys(data.codemasters[course]).length; // Ensure each course is counted correctly
      }

      // Set the progress as a fraction (completed/total)
      setTotalQuestions(complete / count);
    });

    // Cleanup the listener on component unmount or when user is loading
    return () => {
      if (unsubscribeData) {
        unsubscribeData();  // Unsubscribe from the data listener
      }
    };
  }, [user, loading]);




  return (
    <QuestionContext.Provider value={{ totalQuestions}}>
      {children}
    </QuestionContext.Provider>
  );
};

export default QuestionProvider;
