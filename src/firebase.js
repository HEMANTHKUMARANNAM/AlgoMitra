import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDWQnaBKa9ORUzplGd2NfCtHRBlYC-ynsM",
  authDomain: "codemasters-70ce6.firebaseapp.com",
  databaseURL: "https://codemasters-70ce6-default-rtdb.firebaseio.com",
  projectId: "codemasters-70ce6",
  storageBucket: "codemasters-70ce6.firebasestorage.app",
  messagingSenderId: "467789670462",
  appId: "1:467789670462:web:80f56ed3924d004739496f",
  measurementId: "G-4X0VRNGY52"
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
