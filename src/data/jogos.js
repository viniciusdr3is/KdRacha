import { db } from '../firebase/config'; // caminho ajustado ao seu projeto
import { collection, onSnapshot } from 'firebase/firestore';

export const ouvirJogosEmTempoReal = (callback) => {
  const jogosRef = collection(db, 'jogos');

  return onSnapshot(jogosRef, (snapshot) => {
    const jogos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(jogos);
  }, (error) => {
    console.error("Erro ao escutar jogos em tempo real:", error);
  });
};
