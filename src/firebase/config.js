// src/firebase/config.js
import { initializeApp } from 'firebase/app';  // Para inicializar o Firebase
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; // Para autenticação e criação de usuário

const firebaseConfig = {
  apiKey: "AIzaSyCMoRoLs8bnNqtT8wWUoHs-wfdNCioRCeU",
  authDomain: "kdracha-367ff.firebaseapp.com",
  projectId: "kdracha-367ff",
  storageBucket: "kdracha-367ff.firebasestorage.app",
  messagingSenderId: "212795856281",
  appId: "1:212795856281:web:9157dac7f272511afd6f08"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);  // Inicializa o app Firebase
const auth = getAuth(app);  // Inicializa a autenticação com o Firebase

export { auth, createUserWithEmailAndPassword }; // Exportando o auth e a função
