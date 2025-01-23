import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

// Initialize Firebase app (only if it hasn't been initialized yet)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);  // Use the initialized app for auth
const googleProvider = new GoogleAuthProvider();

const database = getDatabase(app);  // Use the initialized app for database

export {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  database,
};
