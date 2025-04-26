import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { buscarInscricoesDoUsuario } from '../../firebase/config.js';
import { jogos } from '../../data/jogos.js';
import { AuthContext } from '../../context/AuthContext.jsx';

const InscricoesScreen = () => {
  const [inscricoes, setInscricoes] = useState([]);
  const navigation = useNavigation();
  const { usuario } = useContext(AuthContext);
  const donoinscricao = false;

  useEffect(() => {
    const carregarInscricoes = async () => {
      const ids = await buscarInscricoesDoUsuario();
      const jogosInscritos = jogos.filter(jogo => ids.includes(jogo.id));
      setInscricoes(jogosInscritos);
    };

    carregarInscricoes();
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
        <TouchableOpacity style={styles.botao} onPress={() => abrirDetalhes(item)}>
          <Text style={styles.botaoTexto}>🔍</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{donoinscricao ? "Adicionar Jogos" : 'Meus Jogos Inscritos'}</Text>
      <FlatList
        data={inscricoes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
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
