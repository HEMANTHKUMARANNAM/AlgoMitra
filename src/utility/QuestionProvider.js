import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';  // Importing the AuthProvider's useAuth hook
import { get, ref, onValue } from 'firebase/database';  // Firebase imports for Realtime Database
import { database } from "../firebase";

// Create a context to share the progress and completion data
const QuestionContext = createContext();

export const useQuestions = () => useContext(QuestionContext);

const QuestionProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext); // Access the user and loading state from AuthProvider
  const [courseProgress, setCourseProgress] = useState({});
  const [overallProgress, setOverallProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true); // Track loading state
  

  // Fetch course progress and overall completion
  useEffect(() => {
    if (loading || !user) {
      setCourseProgress({});
      setOverallProgress(0);
      return;
    }

    const userId = user.uid;
    const dataRef = ref(database, '/'); // Root reference or adjust based on your database structure

    const unsubscribeData = onValue(dataRef, async (dataSnapshot) => {
      const data = dataSnapshot.val();

      // Fetch the results for this user
      const statusesSnapshot = await get(ref(database, `/results/${userId}`));
      const fetchedStatuses = statusesSnapshot.val() || {};

      let totalCompleted = 0;
      let totalQuestions = 0;
      const progressByCourse = {};

      // Calculate completion for each course
      for (const course in data.algomitra) {
        const questions = data.algomitra[course];
        const totalInCourse = Object.keys(questions).length;
        let completedInCourse = 0;

        for (const questionId in questions) {
          if (fetchedStatuses[questionId] === true) {
            completedInCourse++;
          }
        }

        // Store progress for the course
        progressByCourse[course] = {
          completed: completedInCourse,
          total: totalInCourse,
          percentage: totalInCourse > 0 ? (completedInCourse / totalInCourse)*100 : 0,
        };

        totalCompleted += completedInCourse;
        totalQuestions += totalInCourse;
      }

      // Calculate overall progress
      const overall = totalQuestions > 0 ? (totalCompleted / totalQuestions) * 100 : 0;

      // Update state
      setCourseProgress(progressByCourse);
      setOverallProgress(overall);
      setIsLoading(false); // Set loading to false when data is fetched

    });

    // Cleanup the listener on component unmount or when user is loading
    return () => {
      if (unsubscribeData) {
        unsubscribeData(); // Unsubscribe from the data listener
      }
    };
  }, [user, loading]);

  return (
    <QuestionContext.Provider value={{ courseProgress, overallProgress , isLoading }}>
      {children}
    </QuestionContext.Provider>
  );
};

export default QuestionProvider;
