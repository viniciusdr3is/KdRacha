// src/screens/InscricoesScreen.jsx
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarInscricoesDoUsuario } from '../../firebase/config.js';
import { collection, getDoc, getDocs, doc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { AuthContext } from '../../context/AuthContext.jsx';

const InscricoesScreen = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const navigation = useNavigation();
  const { usuario } = useContext(AuthContext);

useEffect(() => {
  const carregarJogosInscritos = async () => {
    try {
      const ids = await buscarInscricoesDoUsuario();
      console.log("IDs recebidos:", ids);

      const jogosPromises = ids.map(async (id) => {
        const docRef = doc(db, 'jogos', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id, ...docSnap.data() };
        } else {
          console.warn(`Jogo com ID ${id} não encontrado`);
          return null;
        }
      });

      const jogosInscritos = (await Promise.all(jogosPromises)).filter(j => j !== null);
      console.log("Jogos encontrados:", jogosInscritos);
      setInscricoes(jogosInscritos);
    } catch (error) {
      console.error("Erro ao carregar jogos inscritos:", error);
    }
  };

  carregarJogosInscritos();
}, []);


  const abrirDetalhes = (jogo) => {
    navigation.navigate('DetalhesInscricao', { jogo });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.imagem} />
      <View style={styles.info}>
        <Text style={styles.local}>{item.local}</Text>
        <Text style={styles.tipo}>{item.tipo} ⚽ {item.horario}</Text>
        <Text style={styles.jogadores}>Jogadores: {item.jogadores}</Text>
        <Text style={styles.valor}> Valor:{item.valor}</Text>
        <TouchableOpacity style={styles.botao} onPress={() => abrirDetalhes(item)}>
          <Text style={styles.botaoTexto}>🔍</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Jogos Inscritos</Text>
      <FlatList
        data={inscricoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={{ color: '#fff' }}>Nenhuma inscrição encontrada.</Text>}
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
    marginTop: 20,
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
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
  },
  valor: {
    fontSize: 14,
    color: '#1e90ff',
    marginTop: 10,
  },
  info: {
    marginLeft: 15,
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
  jogadores: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 2,
  },
  botao: {
    backgroundColor: '#1e90ff',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignItems: 'center',
    width: 100,
    alignSelf: 'flex-end',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default InscricoesScreen;
