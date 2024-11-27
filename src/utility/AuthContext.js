import React, { createContext, useEffect, useState } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const auth = getAuth(); // Get the Firebase authentication instance
  const provider = new GoogleAuthProvider(); // Initialize GoogleAuthProvider

  useEffect(() => {
    // Set Firebase auth persistence to LOCAL to persist across page reloads
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // Listen for changes to the authentication state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user);
          setIsLoading(false); // Stop loading after auth state is determined
        });

        return () => unsubscribe(); // Cleanup listener on unmount
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }, [auth]);

  // Function to sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider); // Sign in with Google
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken; // Google access token
      const user = result.user; // User information
      setUser(user); // Set authenticated user
      console.log('User signed in:', user);
    } catch (error) {
      console.error('Error during sign in:', error.message);
    }
  };

  // Function to sign out
  const logOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      setUser(null); // Clear user state
      console.log('User signed out');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};
