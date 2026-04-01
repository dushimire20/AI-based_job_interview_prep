// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDhDLd3fThyxFjWfHDVYer5_3-JNsxv7rM",
  authDomain: "prepwise-5220e.firebaseapp.com",
  projectId: "prepwise-5220e",
  storageBucket: "prepwise-5220e.firebasestorage.app",
  messagingSenderId: "408448922593",
  appId: "1:408448922593:web:9aba3cdcfe8cf259d1d8a0",
  measurementId: "G-RWFBNMWJ3B"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
