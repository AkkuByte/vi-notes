// 1. We must import the Auth functions from 'firebase/auth'
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDX_p5ipTKAZjXgBTueJ1LzKPPY46onu18",
  authDomain: "vi-notes-f32d2.firebaseapp.com",
  projectId: "vi-notes-f32d2",
  storageBucket: "vi-notes-f32d2.firebasestorage.app",
  messagingSenderId: "137522752651",
  appId: "1:137522752651:web:c91d496f1d6bf6ee82388e",
  measurementId: "G-TT357TFNQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Now JavaScript knows exactly what these functions are
export const auth = getAuth(app); 
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();
export const loginWithGoogle = () => signInWithPopup(auth, provider);
export const loginWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const signupWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);