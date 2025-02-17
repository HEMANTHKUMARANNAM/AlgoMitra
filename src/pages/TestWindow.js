import { useState, useEffect, useContext } from "react";
import { database } from "../firebase";
import { ref, set, get } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import Exam from "../Exam/Exam";
import { useParams } from "react-router-dom";
import { AuthContext } from "../utility/AuthContext";
import { FaExclamationTriangle, FaLock, FaExpandArrowsAlt } from "react-icons/fa";
import MainNavbar from "./MainNavbar";
import { Image } from "react-bootstrap";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal, Button } from "react-bootstrap";
import LoadingScreen from "../LoadingScreen";

const EXAM_DURATION = 1800; // 1 hour in seconds



export default function TestPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [exitCount, setExitCount] = useState(0);
  const [testEnded, setTestEnded] = useState(false);
  const [startedBefore, setStartedBefore] = useState(false);
  const [examLoading, setExamLoading] = useState(true);
  const [userScore, setUserScore] = useState(0);
  const [showModal, setShowModal] = useState(false);



  const [finish, finishstatus] = useState(false);

  const { user, loading } = useContext(AuthContext);
  const { testid } = useParams();

  useEffect(() => {
    if (!user) return;

    const fetchExamData = async () => {
      try {
        const userId = user.uid;
        const userRef = ref(database, `exams/${testid}/${userId}/exitCount`);
        const examRef = ref(database, `exams/${testid}/${userId}`);
        const scoreRef = ref(database, `exams/results/${testid}/${userId}/`);
        const finishRef = ref(database, `exams/${testid}/${userId}/finish`);
        const testRef = ref(database, `tests/${testid}/`);

        const exitSnapshot = await get(userRef);
        if (exitSnapshot.exists()) setExitCount(exitSnapshot.val() || 0);

        const finishSnapshot = await get(finishRef);
        if (finishSnapshot.exists()) finishstatus(finishSnapshot.val() || false);

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
  }, [user, testid, exitCount, finish,]);



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
    if (!user) return;
    const newCount = exitCount + 1;
    if (newCount < 3) {
      toast.error(`Violations : ${newCount}/{3}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
    else {

      toast.error(`Blocked`, {
        position: "top-right",
        autoClose: 3000,
      });

    }

    setExitCount(newCount);
    await set(ref(database, `exams/${testid}/${user.uid}/exitCount`), newCount);
  };





  const enterFullscreen = () => {
    setShowModal(false);

    document.documentElement.requestFullscreen().then(() => {
      setHasEnteredFullscreen(true);
    });
  };

  const start_resume = () => {
    setShowModal(true);
  };

  if (examLoading || loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <LoadingScreen/>
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
        {testEnded || finish ? (
          <div className="p-4 bg-dark text-white rounded shadow-lg text-center">
            <h2>{testid} Test Ended</h2>
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


          <div className="p-5 bg-light text-dark text-left rounded shadow-lg w-100">
            <h3 className="text-center">{testid}</h3>
            <div className="card shadow-lg w-100">

              <div className="card-header bg-primary text-white d-flex justify-content-between">
                <h2 className="mb-0">Exam Instructions</h2>
                <span><Image src={user.profileurl} ></Image></span>
                <span className="ml-auto">{user.displayName}</span>
              </div>

              <div className="card-body">
                <p><strong>Instructions:</strong></p>
                <ul>
                  <li>Stay in fullscreen mode throughout the exam.</li>
                  <li>Multiple-choice, short-answer, and coding questions included.</li>
                  <li>Do not navigate away or refresh the page.</li>
                  <li>Ensure a stable internet connection.</li>
                  <li>Submit your answers before time runs out.</li>
                  <li>
                    <span
                      style={{
                        color: exitCount === 0 ? 'green' :
                          exitCount === 1 ? 'orange' :
                            'red'
                      }}
                    >
                      Violation count:

                      {exitCount}/3
                    </span>
                  </li>                </ul>
              </div>
            </div>
            <button onClick={start_resume} className="btn btn-primary mt-3">
              <FaExpandArrowsAlt className="me-2" /> {startedBefore ? "Resume Exam" : "Start Exam"}
            </button>
          </div>

        )}
      </div>
      <ToastContainer />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to  {startedBefore ? "Resume Exam" : "Start Exam"} the test?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={enterFullscreen}>
            {startedBefore ? "Resume Exam" : "Start Exam"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
