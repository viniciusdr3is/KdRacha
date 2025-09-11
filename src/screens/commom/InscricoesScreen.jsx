import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { buscarInscricoesDoUsuario } from '../../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';

const InscricoesScreen = () => {
  const [jogosInscritos, setJogosInscritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      const carregarJogosInscritos = async () => {
        try {
          const inscricoes = await buscarInscricoesDoUsuario();
          
          const jogosPromises = inscricoes.map(async (inscricao) => {
            const docRef = doc(db, 'jogos', inscricao.jogoId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.jogoData) {
                return { id: docSnap.id, criadorId: data.criadorId, ...data.jogoData, inscricaoInfo: inscricao };
              } else {
                return { ...data, id: docSnap.id, inscricaoInfo: inscricao };
              }
            }
            return null;
          });

          const jogos = (await Promise.all(jogosPromises)).filter(j => j !== null);
          const agora = new Date();
          const jogosFuturos = jogos.filter(jogo => {
            return jogo.dataHoraJogo && jogo.dataHoraJogo.toDate() >= agora;
          });

          if (isActive) {
            setJogosInscritos(jogosFuturos);
          }
        } catch (error) {
          console.error("Erro ao carregar jogos inscritos", error);
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      carregarJogosInscritos();

      return () => { isActive = false };
    }, [])
  );

  const abrirDetalhes = (jogo) => {
    navigation.navigate('JogosNav', {      
      screen: 'JogosDetalhes',            
      params: { jogo },                   
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.imagem ? (
        <Image source={{ uri: item.imagem }} style={styles.imagem} />
      ) : (
        <View style={[styles.imagem, { backgroundColor: '#333' }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.local}>{item.nome || item.local}</Text>
        <Text style={styles.tipo}>{item.tipo} ⚽ {item.horario}</Text>
        <Text style={styles.valor}>Valor: R$ {item.valor}</Text>
        <Text style={styles.metodo}>
          Pagamento foi feito via: <Text style={{textTransform: 'capitalize'}}>{item.inscricaoInfo.metodo}</Text>
        </Text>
        
        <TouchableOpacity 
          style={styles.botao} 
          onPress={() => abrirDetalhes(item)}
        >
          <Text style={styles.botaoTexto}>🔍 Detalhes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Inscrições Ativas</Text>
      <FlatList
        data={jogosInscritos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhuma inscrição ativa encontrada.</Text>}
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
  titulo: {
    marginTop: 30,
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
    flex: 1,
  },
  local: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tipo: {
    fontSize: 14,
    color: '#bbb',
  },
  valor: {
    fontSize: 14,
    color: '#1e90ff',
    marginTop: 5,
  },
  metodo: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
  },
  textoVazio: {
    color: '#777',
    textAlign: 'center',
    marginTop: 20,
  },
  botao: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InscricoesScreen;

