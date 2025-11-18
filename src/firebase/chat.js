// src/firebase/chat.js
import { db } from './config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
} from 'firebase/firestore';

/**
 * Garante que exista um documento em chats/{jogoId}
 * @param {string} jogoId
 * @param {object} jogoData opcional: titulo, criadorId etc.
 */
export const criarChatSeNaoExiste = async (jogoId, jogoData = {}) => {
  if (!jogoId) return null;
  const chatRef = doc(db, 'chats', jogoId);
  const snap = await getDoc(chatRef);
  if (!snap.exists()) {
    await setDoc(chatRef, {
      jogoId,
      titulo: jogoData.titulo || jogoData.nome || 'Chat do jogo',
      criadoEm: serverTimestamp(),
      ultimaMensagem: null,
      ultimaAtualizacao: serverTimestamp(),
      criadorId: jogoData.criadorId || null,
    });
  }
  return chatRef.id;
};

/**
 * Observador em tempo real para mensagens de um chat (ordenadas do mais antigo para o mais novo)
 * callback recebe array de mensagens [{ id, text, senderId, senderName, createdAt }]
 * Retorna função unsubscribe.
 */
export const ouvirMensagens = (jogoId, callback) => {
  const msgsRef = collection(db, 'chats', jogoId, 'messages');
  const q = query(msgsRef, orderBy('createdAt', 'asc'));
  const unsub = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
  return unsub;
};

/**
 * Envia uma mensagem para chats/{jogoId}/messages
 */
export const enviarMensagem = async (jogoId, text, user) => {
  if (!jogoId || !text || !user) return;
  const msgsRef = collection(db, 'chats', jogoId, 'messages');
  await addDoc(msgsRef, {
    text,
    senderId: user.uid,
    senderName: user.displayName || user.email || 'Usuário',
    createdAt: serverTimestamp(),
  });

  // Atualiza meta do chat
  const chatRef = doc(db, 'chats', jogoId);
  await setDoc(chatRef, {
    ultimaMensagem: text,
    ultimaAtualizacao: serverTimestamp(),
  }, { merge: true });
};

/**
 * Verifica se o usuário (uid) pode participar do chat do jogo:
 * - se for o criador do jogo (criadorId)
 * - ou se houver inscrição em 'inscricoes' com jogoId + usuarioId
 * Retorna boolean.
 */
export const verificarUsuarioNoJogo = async (jogoId, uid, criadorId = null) => {
  if (!uid || !jogoId) return false;
  if (criadorId && uid === criadorId) return true;

  const inscricoesRef = collection(db, 'inscricoes');
  const q = query(inscricoesRef, where('jogoId', '==', jogoId), where('usuarioId', '==', uid));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};
