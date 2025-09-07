import { db } from '../firebase/config'; 
import { collection, onSnapshot, query, where } from 'firebase/firestore';

export const ouvirJogosEmTempoReal = (callback, ownerId = null) => {
  let jogosQuery;

  if (ownerId) {
    jogosQuery = query(collection(db, 'jogos'), where('criadorId', '==', ownerId));
  } else {
    jogosQuery = collection(db, 'jogos');
  }

  const unsubscribe = onSnapshot(jogosQuery, (snapshot) => {
    const jogos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(jogos);
  }, (error) => {
    console.error("Erro ao escutar jogos em tempo real:", error);
    callback([]); 
  });

  return unsubscribe;
};

