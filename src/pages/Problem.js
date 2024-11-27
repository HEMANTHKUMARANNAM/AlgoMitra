import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CodeWindow from "../elements/CodeWindow";
import ProblemNavbar from "../elements/ProblemNavbar";
import { database } from "../firebase";
import { ref, get } from "firebase/database";
import { decryptParam, encryptParam } from "../cryptoUtils";
import { useQuestions } from '../utility/QuestionProvider';  // Import the custom hook
import LoadingScreen from "../LoadingScreen";


function Problem() {
  const { course, questionId } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("statement");
  const [questionData, setQuestionData] = useState(null);
  const [lan, setLan] = useState( localStorage.getItem("lan") || "java" );  // Initialize lan as null first

  const decryptedCourse = decryptParam(course);
  const decryptedQuestionId = decryptParam(questionId);

  const { totalQuestions } = useQuestions(); // Get totalQuestions from the custom hook



  // Toggle between different modes (statement, code editor, etc.)
  const toggleMode = (selectedMode) => {
    setMode(selectedMode);
  };

  // Fetch question data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Single call for both question data and next question URL
        const questionRef = ref(
          database,
          `codemasters/${decryptedCourse}/${decryptedQuestionId}/`
        );
        const allQuestionsRef = ref(
          database,
          `codemasters/${decryptedCourse}`
        );

        // Get both question data and all questions in parallel
        const [questionSnapshot, allQuestionsSnapshot] = await Promise.all([
          get(questionRef),
          get(allQuestionsRef),
        ]);

        if (questionSnapshot.exists()) {
          const question = questionSnapshot.val();
          const allQuestions = allQuestionsSnapshot.val();

          // Find the next question URL
          const questionIds = Object.keys(allQuestions);
          const currentIndex = questionIds.indexOf(decryptedQuestionId);
          let nextQuestionUrl = null;

          if (currentIndex + 1 < questionIds.length) {
            const nextQuestionId = questionIds[currentIndex + 1];
            nextQuestionUrl = `/prob/${course}/${encryptParam(nextQuestionId)}`;
          }

          // Add next question URL to the question data
          question.nextQuestionUrl = nextQuestionUrl;
          setQuestionData(question);
        } else {
          // If no data for the current question, redirect to home or last question
          navigate("/home");
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
        navigate("/home");
      }
    };

    if (decryptedCourse && decryptedQuestionId) {
      fetchData();
    }
  }, [decryptedCourse, decryptedQuestionId, navigate]); // Dependencies adjusted



  return (
    <div className="d-flex flex-column vh-100">
      {/* Problem Navbar */}
      <div className="flex-shrink-0">
        <ProblemNavbar
          toggleMode={toggleMode}
          activeMode={mode}
          setlan={setLan}
          lan={lan}
          progress={totalQuestions ? (totalQuestions / 100) : 0}  // Assuming totalQuestions represents a fraction
          nextQuestionUrl={questionData?.nextQuestionUrl} // Pass next question URL from the question data
        />
      </div>

      {/* Content area */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        {questionData ? (
          <CodeWindow mode={mode} data={questionData} lan={lan} />
        ) : (
          <LoadingScreen/>
        )}
      </div>
    </div>
  );
}

export default Problem;
