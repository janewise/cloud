import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // Import the Realtime Database

const firebaseConfig = {
  apiKey: "AIzaSyAei2Enk5qD6cBtosYB66qQwzmUHzrEW1w",
  authDomain: "bitbrawl-official-airdrop.firebaseapp.com",
  databaseURL: "https://bitbrawl-official-airdrop-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bitbrawl-official-airdrop",
  storageBucket: "bitbrawl-official-airdrop.appspot.com",
  messagingSenderId: "179762649507",
  appId: "1:179762649507:web:fe42f84b205d2c0bca2216",
  measurementId: "G-SVKSDKEN7M"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const analytics = getAnalytics(firebaseApp); // Pass the initialized app to getAnalytics

// Initialize Realtime Database
const db = getDatabase(firebaseApp); // Initialize the Realtime Database

export { db };
