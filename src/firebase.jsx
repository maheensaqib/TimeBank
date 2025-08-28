// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";  // ✅ import auth
import { getFirestore } from "firebase/firestore"; // optional, if you’ll use DB
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAmzsFMYMfzy6RvWtdF1oG7DGyHLadDOH4",
  authDomain: "time-bank-61287.firebaseapp.com",
  projectId: "time-bank-61287",
  storageBucket: "time-bank-61287.firebasestorage.app",
  messagingSenderId: "920616600773",
  appId: "1:920616600773:web:a494152723a5e66ebbdcac",
  measurementId: "G-Z5YVGH25DR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;