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
 * Garante que exista um documento na coleção 'chats' para este jogo.
 * Se não existir, cria um.
 */
export const criarChatSeNaoExiste = async (jogoId, jogoData = {}) => {
  if (!jogoId) return null;
  const chatRef = doc(db, 'chats', jogoId);
  
  // Usamos setDoc com merge: true. Se existir, não faz nada (ou atualiza campos novos).
  // Se não existir, cria o documento.
  await setDoc(chatRef, {
    jogoId,
    titulo: jogoData.titulo || jogoData.nome || 'Chat do jogo',
    ultimaAtualizacao: serverTimestamp(),
    criadorId: jogoData.criadorId || null,
  }, { merge: true });
  
  return chatRef.id;
};

/**
 * Observador em tempo real para mensagens de um chat.
 * ORDENAÇÃO: 'asc' (Ascendente) -> Mais antigas primeiro, mais novas no fim.
 */
export const ouvirMensagens = (jogoId, callback) => {
  const msgsRef = collection(db, 'chats', jogoId, 'messages');
  
  // Ordenamos por data de criação ascendente para que a lista vá descendo
  const q = query(msgsRef, orderBy('createdAt', 'asc'));
  
  const unsub = onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(d => {
        const data = d.data();
        // Converte o Timestamp do Firestore para um objeto Date do JS para evitar erros na UI
        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date();
        return { id: d.id, ...data, createdAt };
    });
    callback(msgs);
  });
  return unsub;
};

/**
 * Envia uma mensagem para a subcoleção 'messages' do chat.
 */
export const enviarMensagem = async (jogoId, text, user) => {
  if (!jogoId || !text || !user) return;
  
  const msgsRef = collection(db, 'chats', jogoId, 'messages');
  
  // Adiciona a mensagem
  await addDoc(msgsRef, {
    text,
    senderId: user.uid,
    // Tenta usar o nome, se não tiver, usa o email ou um fallback
    senderName: user.nome || user.email || 'Utilizador', 
    createdAt: serverTimestamp(),
  });

  // Atualiza os metadados do chat (última mensagem e hora) para facilitar listagens futuras
  const chatRef = doc(db, 'chats', jogoId);
  await setDoc(chatRef, {
    ultimaMensagem: text,
    ultimaAtualizacao: serverTimestamp(),
  }, { merge: true });
};

/**
 * Verifica se o utilizador tem permissão para entrar no chat.
 * Retorna true se for o dono OU se estiver inscrito no jogo.
 */
export const verificarUsuarioNoJogo = async (jogoId, uid, criadorId = null) => {
  if (!uid || !jogoId) return false;
  
  // 1. Se for o dono do jogo, tem acesso liberado
  if (criadorId && uid === criadorId) return true;

  // 2. Se não for dono, verifica se existe uma inscrição ativa
  const inscricoesRef = collection(db, 'inscricoes');
  
  // Busca na coleção 'inscricoes' onde o jogoId e o userId correspondem
  const q = query(inscricoesRef, where('jogoId', '==', jogoId), where('userId', '==', uid));
  
  const snapshot = await getDocs(q);
  // Se a snapshot não estiver vazia, significa que encontrou uma inscrição
  return !snapshot.empty;
};