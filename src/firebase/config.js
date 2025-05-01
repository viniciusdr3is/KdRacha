import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth, db };
