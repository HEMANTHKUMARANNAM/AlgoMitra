import React, { useState, useEffect } from "react";
import { database } from "../firebase"; // Firebase config
import { ref, set, get } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import { useParams } from "react-router-dom";
import Problem from "./Problem";

const EXAM_DURATION = 1800; // 20 seconds for testing
const Exam = () => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [data, setData] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { testid } = useParams();

  useEffect(() => {
    const startExamAutomatically = async () => {
      const examRef = ref(database, `exams/${testid}/user_exam`);
      const snapshot = await get(examRef);
      const data = snapshot.val();
      const currentTime = Math.floor(Date.now() / 1000);

      if (data && data.startedAt) {
        const startTime = Number(data.startedAt);
        const elapsedTime = currentTime - startTime;
        const remainingTime = Math.max(EXAM_DURATION - elapsedTime, 0);

        if (remainingTime > 0) {
          setTimeLeft(remainingTime);
          setExamStarted(true);
        } else {
          handleExamEnd();
        }
      } else {
        const startTime = Math.floor(Date.now() / 1000);
        await set(examRef, { startedAt: startTime });
        setTimeLeft(EXAM_DURATION);
        setExamStarted(true);
      }
      setLoading(false);
    };

    startExamAutomatically();
  }, [testid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsSnapshot = await get(ref(database, `/tests/${testid}`));
        const fetchedQuestions = questionsSnapshot.val() || {};
        setData(fetchedQuestions);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [testid]);

  useEffect(() => {
    let timer;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleExamEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    console.log(data);
    return () => clearInterval(timer);
  }, [examStarted, timeLeft]);

  const handleExamEnd = () => {
    setExamStarted(false);
    setTimeLeft(0);
    alert("Time's up! Exam ended.");
  };



  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
    {loading ? (
      <p>Loading...</p>
    ) : data && Object.keys(data).length > 0 ? (
      <Problem data={data} timeLeft={timeLeft} />
    ) : (
      <p>No questions available.</p>
    )}
  </div>
  

  );
};

export default Exam;
