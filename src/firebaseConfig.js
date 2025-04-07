// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics"; // Можешь закомментировать или удалить, если пока не используешь

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBiCzXEOG8A3caRPwmyAjf5sz6BQ4_xxZk',
  authDomain: 'intangibleapp.firebaseapp.com',
  projectId: 'intangibleapp',
  storageBucket: 'intangibleapp.firebasestorage.app',
  messagingSenderId: '55532777668',
  appId: '1:55532777668:web:175d0bea8d3bdbb9729991',
  measurementId: 'G-EPRL0SMNB7',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
