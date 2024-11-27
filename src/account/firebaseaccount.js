// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDS5QZpMUE41eiflPafVTXc8X1oRaj9qJY",
    authDomain: "codemastersaccounts.firebaseapp.com",
    projectId: "codemastersaccounts",
    storageBucket: "codemastersaccounts.firebasestorage.app",
    messagingSenderId: "443451324930",
    appId: "1:443451324930:web:c8b17c28702ebced2ec51b",
    measurementId: "G-RXHMCY7CC9"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
