// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyALbaAvk3WmFB9YMo7O913n4WR8b27vVwA",
  authDomain: "algomitra.firebaseapp.com",
  databaseURL: "https://algomitra-default-rtdb.firebaseio.com",
  projectId: "algomitra",
  storageBucket: "algomitra.firebasestorage.app",
  messagingSenderId: "355497275702",
  appId: "1:355497275702:web:75bf115bb007d881320397",
  measurementId: "G-3H1WCVY6E1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
