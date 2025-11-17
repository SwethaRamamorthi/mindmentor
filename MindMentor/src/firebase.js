import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc82b9p4yjBv5s-mq6lioBDxK1RbVgFX4",
  authDomain: "mind-mentor-953ff.firebaseapp.com",
  projectId: "mind-mentor-953ff",
  storageBucket: "mind-mentor-953ff.firebasestorage.app",
  messagingSenderId: "1065599016464",
  appId: "1:1065599016464:web:7b6bca087df49884927495",
  measurementId: "G-89NXSQ464S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
