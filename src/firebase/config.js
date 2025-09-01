import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
} from 'firebase/firestore';

// 🔐 Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCsxQIOpLMwfvgB0gGX2mrxF2zmU-IUB-U",
  authDomain: "kd-racha.firebaseapp.com",
  projectId: "kd-racha",
  storageBucket: "kd-racha.firebasestorage.app",
  messagingSenderId: "418214270856",
  appId: "1:418214270856:web:01a057af9bbabb48f74c3d",
  measurementId: "G-DS2EEYBY0V"
};

// ⚙️ Inicializa o app e serviços
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

// ✅ Cadastro de novo jogo
const cadastrarJogo = async (jogoData) => {
  try {
    const docRef = await addDoc(collection(db, 'jogos'), jogoData);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao cadastrar jogo:", error);
    throw error;
  }
};

// ✅ Inscrever usuário em jogo
const inscreverEmJogo = async (jogoId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  await setDoc(doc(db, 'inscricoes', `${userId}_${jogoId}`), {
    userId,
    jogoId,
  });
};

// ✅ Buscar jogos em que o usuário está inscrito
const buscarInscricoesDoUsuario = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Usuário não autenticado");

  const q = query(collection(db, 'inscricoes'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data().jogoId);
};


export {
  auth,
  db,
  createUserWithEmailAndPassword,
  cadastrarJogo,
  inscreverEmJogo,
  buscarInscricoesDoUsuario,
};
