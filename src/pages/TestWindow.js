import { useState, useEffect, useContext } from "react";
import { database } from "../firebase";
import { ref, set, get } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import Exam from "../Exam/Exam";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utility/AuthContext";
import { FaExclamationTriangle, FaLock, FaExpandArrowsAlt } from "react-icons/fa";
import MainNavbar from "./MainNavbar";

const EXAM_DURATION = 1800; // 1 hour in seconds

export default function TestPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [testEnded, setTestEnded] = useState(false);
  const [startedBefore, setStartedBefore] = useState(false);
  const [examLoading, setExamLoading] = useState(true);
  const [userScore, setUserScore] = useState(null);

  const { user, loading: authLoading } = useContext(AuthContext);
  const { testid } = useParams();

  useEffect(() => {
    if (!user) return;

    const fetchExamData = async () => {
      try {
        const userId = user.uid;
        const userRef = ref(database, `exams/${testid}/${userId}/exitCount`);
        const examRef = ref(database, `exams/${testid}/user_exam`);
        const scoreRef = ref(database, `exams/results/${userId}/${testid}/`);
        const testRef = ref(database, `tests/${testid}/`);

        const exitSnapshot = await get(userRef);
        if (exitSnapshot.exists()) setExitCount(exitSnapshot.val() || 0);

        const examSnapshot = await get(examRef);
        if (examSnapshot.exists()) {
          const startTime = examSnapshot.val().startedAt;
          const currentTime = Math.floor(Date.now() / 1000);
          if (startTime && currentTime - startTime >= EXAM_DURATION) {
            setTestEnded(true);
          } else {
            setStartedBefore(true);
          }
        }

        const scoreSnapshot = await get(scoreRef);
        if (scoreSnapshot.exists()) {
          let count = Object.values(scoreSnapshot.val()).filter(v => v === true).length;
          const testSnapshot = await get(testRef);
          if (testSnapshot.exists()) {
            const questions = Object.keys(testSnapshot.val()).length;
            setUserScore(((count / questions) * 100).toFixed(2));
          }
        }
      } catch (error) {
        console.error("Error fetching exam data:", error);
      } finally {
        setExamLoading(false);
      }
    };

    fetchExamData();
  }, [user, testid]);

  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //     if (!document.fullscreenElement && hasEnteredFullscreen) updateExitCount();
  //   };

  //   document.addEventListener("fullscreenchange", handleFullscreenChange);
  //   return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  // }, [hasEnteredFullscreen]);

  // const updateExitCount = async () => {
  //   if (!user) return;
  //   const newCount = exitCount + 1;
  //   setExitCount(newCount);
  //   await set(ref(database, `exams/${testid}/${user.uid}/exitCount`), newCount);
  // };

  useEffect(() => {
    const handleFullscreenChange = async () => {
      const isNowFullscreen = document.fullscreenElement !== null;
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen) {
        setHasEnteredFullscreen(true); // Track first fullscreen entry
      } else if (hasEnteredFullscreen) {
        updateExitCount(); // Only count if user had entered fullscreen before
      }
    };

    const handleVisibilityChange = async () => {
      if (document.hidden && hasEnteredFullscreen) {
        updateExitCount();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [exitCount, hasEnteredFullscreen]);

  const updateExitCount = async () => {
    const newCount = exitCount + 1;
    setExitCount(newCount);
    await set(ref(database, `exams/${testid}/${user.userId}/exitCount`), newCount);
  };



  // useEffect(() => {
  //   const handleViolation = () => {
  //     if (hasEnteredFullscreen) {
  //       updateExitCount();
  //     }
  //   };

  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //     if (!document.fullscreenElement) {
  //       handleViolation();
  //     }
  //   };

  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       handleViolation();
  //     }
  //   };

  //   const handleBlur = () => {
  //     handleViolation();
  //   };

  //   window.addEventListener("fullscreenchange", handleFullscreenChange);
  //   document.addEventListener("visibilitychange", handleVisibilityChange);
  //   window.addEventListener("blur", handleBlur);

  //   return () => {
  //     window.removeEventListener("fullscreenchange", handleFullscreenChange);
  //     document.removeEventListener("visibilitychange", handleVisibilityChange);
  //     window.removeEventListener("blur", handleBlur);
  //   };
  // }, [hasEnteredFullscreen]);

  // const updateExitCount = async () => {
  //   if (!user) return;
  //   const newCount = exitCount + 1;
  //   setExitCount(newCount);
  //   await set(ref(database, `exams/${testid}/${user.uid}/exitCount`), newCount);
  // };

  // const enterFullscreen = () => {
  //   document.documentElement.requestFullscreen().then(() => setHasEnteredFullscreen(true));
  // };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      setHasEnteredFullscreen(true);
    });
  };

  if (examLoading || authLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column vh-100">
      {!isFullscreen && (
        <div className="bg-primary text-white text-center">
          <MainNavbar className="p-0 m-0" />
        </div>
      )}

      <div className="flex-grow-1 bg-light d-flex align-items-center justify-content-center">
        {testEnded ? (
          <div className="p-4 bg-dark text-white rounded shadow-lg text-center">
            <h2>Test Ended</h2>
            <p>The exam has finished. Thank you for participating.</p>
            {userScore !== null && <p className="fw-bold">Your Score: {userScore}%</p>}
          </div>
        ) : exitCount >= 3 ? (
          <div className="p-5 bg-danger text-white text-center rounded shadow-lg">
            <FaLock size={50} className="mb-3" />
            <h3>Exam Blocked</h3>
            <h3>{testid}</h3>
            
            <p>You have exceeded the allowed number of violations.</p>
          </div>
        ) : isFullscreen ? (
          <Exam />
        ) : (
          <div className="p-5 bg-warning text-dark text-center rounded shadow-lg">
            <FaExclamationTriangle size={50} className="mb-3" />
            <h4>Fullscreen Required</h4>
            <h4>{testid}</h4>
            <p>You must stay in fullscreen mode during the exam.</p>
            <p>Violations: {exitCount} / 3</p>
            <button onClick={enterFullscreen} className="btn btn-primary mt-3">
              <FaExpandArrowsAlt className="me-2" /> {startedBefore ? "Resume Exam" : "Start Exam"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
