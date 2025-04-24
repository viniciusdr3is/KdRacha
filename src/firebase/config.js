import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCsxQIOpLMwfvgB0gGX2mrxF2zmU-IUB-U",
  authDomain: "kd-racha.firebaseapp.com",
  projectId: "kd-racha",
  storageBucket: "kd-racha.firebasestorage.app",
  messagingSenderId: "418214270856",
  appId: "1:418214270856:web:01a057af9bbabb48f74c3d",
  measurementId: "G-DS2EEYBY0V"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, createUserWithEmailAndPassword, db };
