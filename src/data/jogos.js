import { db } from '../firebase/config';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';

// Esta função busca os jogos FUTUROS (continua igual)
export const ouvirJogosEmTempoReal = (callback, ownerId = null) => {
  const jogosRef = collection(db, 'jogos');
  const agora = Timestamp.now();
  let jogosQuery;

  if (ownerId) {
    // Ordem correta dos filtros para o índice composto
    jogosQuery = query(
      jogosRef, 
      where('criadorId', '==', ownerId), 
      where('dataHoraJogo', '>=', agora)
    );
  } else {
    jogosQuery = query(jogosRef, where('dataHoraJogo', '>=', agora));
  }

  const unsubscribe = onSnapshot(jogosQuery, (snapshot) => {
    const jogos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(jogos);
  }, (error) => {
    console.error("Erro ao escutar jogos em tempo real:", error);
    callback([]);
  });
  return unsubscribe;
};

// Esta função busca os jogos PASSADOS de um dono específico.
export const ouvirHistoricoJogosDono = (callback, ownerId) => {
  const jogosRef = collection(db, 'jogos');
  const agora = Timestamp.now();

  // A query filtra por criador E por jogos cuja data já passou ('<')
  const jogosQuery = query(
    jogosRef, 
    where('criadorId', '==', ownerId), 
    where('dataHoraJogo', '<', agora)
  );

  const unsubscribe = onSnapshot(jogosQuery, (snapshot) => {
    const jogos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(jogos);
  }, (error) => {
    console.error("Erro ao escutar histórico de jogos:", error);
    callback([]);
  });
  return unsubscribe;
};

// Esta função busca os detalhes dos inscritos para um jogo específico.
export const buscarDetalhesInscritosPorJogo = async (jogoId) => {
  const inscritosRef = collection(db, 'inscricoes');
  const inscritosQuery = query(inscritosRef, where('jogoId', '==', jogoId));

  try {
    const snapshot = await getDocs(inscritosQuery);
    const inscritos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return inscritos;
  } catch (error) {
    console.error("Erro ao buscar detalhes dos inscritos:", error);
    return [];
  }
};