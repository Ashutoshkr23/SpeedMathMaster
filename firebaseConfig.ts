import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 

// Your web app's Firebase configuration (using your provided keys)
const firebaseConfig = {
  apiKey: "AIzaSyAT-OqNa79xMKPlU-DX5TQbGdAmnOUrKrw",
  authDomain: "speed-maths-f3fc0.firebaseapp.com",
  projectId: "speed-maths-f3fc0",
  storageBucket: "speed-maths-f3fc0.firebasestorage.app",
  messagingSenderId: "43153381867",
  appId: "1:43153381867:web:fee9197eec7063f69521ae",
  measurementId: "G-7YTNC1X0FL"
};

// 1. Initialize the Core Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Authentication Service
export const auth = getAuth(app);

// 3. Initialize Firestore Database Service (Needed for user data/leaderboards)
export const db = getFirestore(app);
