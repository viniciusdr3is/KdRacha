import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  doc,
  getDocs,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  increment,
  runTransaction,
  getDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC7BKOtmhMDNxm_Gvrf9Wce7_yvYW-Lli4",
  authDomain: "kd-racha-9330d.firebaseapp.com",
  projectId: "kd-racha-9330d",
  storageBucket: "kd-racha-9330d.appspot.com",
  messagingSenderId: "55252454477",
  appId: "1:55252454477:web:5f1a66d5a759835b036004",
  measurementId: "G-DXJBMLVS0Z"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    if (error.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    console.error("Firebase auth initialization error:", error);
    throw error;
  }
})();

const db = getFirestore(app);
const storage = getStorage(app);

const cadastrarJogo = async (jogoData) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Utilizador não autenticado para criar jogo.");

  try {
    const dadosCompletos = { 
      ...jogoData,
      vagas: parseInt(jogoData.vagas, 10) || 0,
      jogadores: 0,
      criadorId: userId,
    };
    const docRef = await addDoc(collection(db, 'jogos'), dadosCompletos);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao cadastrar jogo:", error);
    throw error;
  }
};

const inscreverEmJogo = async (jogoId, metodoPagamento) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Utilizador não autenticado");

  const jogoRef = doc(db, 'jogos', jogoId);
  const inscricaoRef = doc(db, 'inscricoes', `${userId}_${jogoId}`);

  try {
    await runTransaction(db, async (transaction) => {
      const jogoDoc = await transaction.get(jogoRef);
      if (!jogoDoc.exists()) {
        throw new Error("Este jogo já não existe!");
      }

      const data = jogoDoc.data();
      const isNested = !!data.jogoData; 

      const vagasAtuais = parseInt(isNested ? data.jogoData.vagas : data.vagas, 10) || 0;

      if (vagasAtuais > 0) {
        const vagasPath = isNested ? "jogoData.vagas" : "vagas";
        const jogadoresPath = isNested ? "jogoData.jogadores" : "jogadores";
        
        transaction.update(jogoRef, { 
          [vagasPath]: increment(-1),
          [jogadoresPath]: increment(1)
        });
        
        transaction.set(inscricaoRef, { 
          userId, 
          jogoId,
          metodo: metodoPagamento,
          dataInscricao: serverTimestamp() 
        });
      } else {
        throw new Error("Não há mais vagas para este jogo!");
      }
    });
  } catch (e) {
    console.error("Falha na transação de inscrição: ", e.message);
    throw e; 
  }
};

const cancelarInscricao = async (jogoId) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Utilizador não autenticado");

  const jogoRef = doc(db, 'jogos', jogoId);
  const inscricaoRef = doc(db, 'inscricoes', `${userId}_${jogoId}`);

  await runTransaction(db, async (transaction) => {
    const jogoDoc = await transaction.get(jogoRef);
    if (!jogoDoc.exists()) return;

    const data = jogoDoc.data();
    const isNested = !!data.jogoData;

    const vagasPath = isNested ? "jogoData.vagas" : "vagas";
    const jogadoresPath = isNested ? "jogoData.jogadores" : "jogadores";

    transaction.update(jogoRef, {
      [vagasPath]: increment(1),
      [jogadoresPath]: increment(-1),
    });
    transaction.delete(inscricaoRef);
  });
};


// As outras funções permanecem corretas
const buscarInscricoesDoUsuario = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return []; 
  try {
    const q = query(collection(db, 'inscricoes'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error);
    return []; 
  }
};

const removerJogo = async (jogoId) => {
  const inscricoesQuery = query(collection(db, 'inscricoes'), where('jogoId', '==', jogoId));
  const inscricoesSnapshot = await getDocs(inscricoesQuery);
  
  const batch = writeBatch(db);
  inscricoesSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  const jogoRef = doc(db, 'jogos', jogoId);
  await deleteDoc(jogoRef);
};

const buscarDetalhesInscritosPorJogo = async (jogoId) => {
  const inscricoesQuery = query(collection(db, 'inscricoes'), where('jogoId', '==', jogoId));
  const inscricoesSnapshot = await getDocs(inscricoesQuery);
  if (inscricoesSnapshot.empty) {
    return [];
  }

  const detalhesPromises = inscricoesSnapshot.docs.map(async (inscricaoDoc) => {
    const userId = inscricaoDoc.data().userId;
    const userRef = doc(db, 'usuarios', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return {
        id: userId,
        ...userSnap.data(),
        inscricao: inscricaoDoc.data()
      };
    }
    return null;
  });

  const detalhesCompletos = (await Promise.all(detalhesPromises)).filter(Boolean);
  return detalhesCompletos;
};

// helpers para aceitar tanto "abc" quanto "/jogos/abc" e "/usuarios/uid"
const toPossibleJogoKeys = (jogoId) => [ `${jogoId}`, `/jogos/${jogoId}` ];
const toPossibleUserKeys = (uid) =>  [ `${uid}`, `/usuarios/${uid}` ];

/** Lê avaliação do jogador logado para um jogo */
const buscarAvaliacaoDoJogoCompat = async ({ jogoId }) => {
  const jogadorId = auth.currentUser?.uid;
  if (!jogadorId) return null;

  try {
    const jogoKeys = toPossibleJogoKeys(jogoId);
    const userKeys = toPossibleUserKeys(jogadorId);

    for (const jk of jogoKeys) {
      for (const uk of userKeys) {
        // 1) padrão criado manualmente: usuarioId + jogoId
        const q1 = query(
          collection(db, 'avaliacoes'),
          where('jogoId', '==', jk),
          where('usuarioId', '==', uk)
        );
        const s1 = await getDocs(q1);
        if (!s1.empty) return { id: s1.docs[0].id, ...s1.docs[0].data() };

        // 2) fallback se alguém salvar como "avaliadorId"
        const q2 = query(
          collection(db, 'avaliacoes'),
          where('jogoId', '==', jk),
          where('avaliadorId', '==', uk)
        );
        const s2 = await getDocs(q2);
        if (!s2.empty) return { id: s2.docs[0].id, ...s2.docs[0].data() };
      }
    }
    return null;
  } catch (e) {
    if (e.code === 'permission-denied') return null;
    throw e;
  }
};

/** Salva avaliação no formato atual */
const salvarAvaliacaoCompat = async ({ jogoId, avaliadoId, nota, comentario }) => {
  const jogadorId = auth.currentUser?.uid;
  if (!jogadorId) throw new Error('Usuário não autenticado');

  const existente = await buscarAvaliacaoDoJogoCompat({ jogoId });
  if (existente) return existente;

 const payload = {
    // compat com o que foi criado manualmente
    avaliacaoId: String(Date.now()),
    usuarioId: `/usuarios/${jogadorId}`,
    jogoId: `/jogos/${jogoId}`,
    nota: Number(nota),
    comentario: comentario ?? null,
    dataCriacao: serverTimestamp(),

    avaliadorId: jogadorId,
    avaliadoId: avaliadoId ?? null,
    jogoIdNorm: jogoId,
  };

  const ref = await addDoc(collection(db, 'avaliacoes'), payload);
  const snap = await getDoc(ref);
  return { id: ref.id, ...snap.data() };
};

// id determinístico: <criadorId><jogadorId><jogoId>

const makeAvaliacaoId = (criadorId, jogadorId, jogoId) =>
  `${criadorId}_${jogadorId}_${jogoId}`;

const criarAvaliacao = async ({ jogoId, criadorId, vrNota, dsComentario }) => {
  const jogadorId = auth.currentUser?.uid;
  if (!jogadorId) throw new Error('Usuário não autenticado');

  const inscRef = doc(db, 'inscricoes', `${jogadorId}_${jogoId}`);
  const inscSnap = await getDoc(inscRef);
  if (!inscSnap.exists()) throw new Error('Você não possui inscrição neste jogo.');

  const avaliacaoId = makeAvaliacaoId(criadorId, jogadorId, jogoId);
  const ref = doc(db, 'avaliacoes', avaliacaoId);

  const ja = await getDoc(ref);
  if (ja.exists()) throw new Error('Você já avaliou este jogo.');

  await setDoc(ref, {
    criadorId,
    jogadorId,
    jogoId,
    vrNota: Number(vrNota),
    dsComentario: dsComentario ?? null,
    dtCriacao: serverTimestamp(),
  });
};

const buscarAvaliacaoDoJogo = async ({ jogoId, criadorId }) => {
  const jogadorId = auth.currentUser?.uid;
  if (!jogadorId) return null;
  try {
    const ref = doc(db, 'avaliacoes', makeAvaliacaoId(criadorId, jogadorId, jogoId));
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    if (e.code === 'permission-denied') return null;
    throw e;
  }
};

// --------------------- Util de debug ---------------------

export async function testarPermissoesFirebase() {
  const user = auth.currentUser;
  console.log("👤 Usuário atual:", user?.uid || "não logado");

  try {
    console.log("🔹 Testando leitura de jogos...");
    await getDoc(doc(db, "jogos", "teste"));
    console.log("Leitura de jogos OK!");
  } catch (e) {
    console.warn("Falha ao ler jogos:", e.code);
  }

  try {
    console.log("🔹 Testando leitura de inscricoes...");
    await getDoc(doc(db, "inscricoes", "teste"));
    console.log("Leitura de inscricoes OK!");
  } catch (e) {
    console.warn("Falha ao ler inscricoes:", e.code);
  }

  try {
    console.log("🔹 Testando leitura de avaliacoes...");
    await getDoc(doc(db, "avaliacoes", "teste"));
    console.log("Leitura de avaliacoes OK!");
  } catch (e) {
    console.warn("Falha ao ler avaliacoes:", e.code);
  }
}

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  cadastrarJogo,
  inscreverEmJogo,
  cancelarInscricao,
  buscarInscricoesDoUsuario,
  removerJogo,
  buscarDetalhesInscritosPorJogo,

  salvarAvaliacaoCompat,
  buscarAvaliacaoDoJogoCompat,

  criarAvaliacao,
  buscarAvaliacaoDoJogo,
};

