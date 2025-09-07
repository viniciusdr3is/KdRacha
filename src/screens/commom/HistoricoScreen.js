import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarInscricoesDoUsuario } from '../../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';

const HistoricoScreen = () => {
  const [jogosPagos, setJogosPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      const carregarHistorico = async () => {
        try {
          const inscricoes = await buscarInscricoesDoUsuario();

          const promessasJogos = inscricoes.map(async (inscricao) => {
            const docRef = doc(db, 'jogos', inscricao.jogoId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              // Verifica se os dados estão aninhados dentro de 'jogoData'
              if (data.jogoData) {
                return { 
                  id: docSnap.id, 
                  criadorId: data.criadorId,
                  ...data.jogoData, //Spread operator para espalhar os dados aninhados
                  inscricaoInfo: inscricao 
                };
              } else {
                // Se não (dados antigos), usamos a estrutura normal "achatada"
                return { 
                  id: docSnap.id, 
                  ...data,
                  inscricaoInfo: inscricao
                };
              }
            }
            return null;
          });

          const jogos = (await Promise.all(promessasJogos)).filter(j => j !== null);

          if (isActive) {
            setJogosPagos(jogos);
          }
        } catch (error) {
          console.error("Erro ao carregar histórico:", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      carregarHistorico();

      return () => { isActive = false };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.local}>{item.nome || item.local}</Text>
        <Text style={styles.data}>Data: {item.data} - {item.horario}</Text>
        <Text style={styles.metodo}>
          Pagamento via: <Text style={{textTransform: 'capitalize'}}>{item.inscricaoInfo.metodo}</Text>
        </Text>
      </View>
      <Text style={styles.valor}>R$ {item.valor}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Inscrições</Text>
      <FlatList
        data={jogosPagos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum histórico de inscrição encontrado.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  containerCentralizado: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 30,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
  },
  local: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  data: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  metodo: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  valor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  textoVazio: {
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  }
});

export default HistoricoScreen;

