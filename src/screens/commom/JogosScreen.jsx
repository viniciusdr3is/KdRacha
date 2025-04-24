import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { inscreverEmJogo, buscarInscricoesDoUsuario } from '../../firebase/config.js';
import { useNavigation } from '@react-navigation/native';
import { jogos } from '../../data/jogos.js';
import { AuthContext } from '../../context/AuthContext.jsx';




const JogosScreen = () => {
  const [inscritos, setInscritos] = useState([]);
  const navigation = useNavigation();
  const { usuario, carregando } = useContext(AuthContext);
  const dono = false
 


  useEffect(() => {
    const carregarInscricoes = async () => {
      const ids = await buscarInscricoesDoUsuario();
      setInscritos(ids);
    };
    carregarInscricoes();
  }, []);

  const handleInscricao = async (id) => {
    try {
      if (!inscritos.includes(id)) {
        await inscreverEmJogo(id);
        setInscritos([...inscritos, id]);
        Alert.alert('Inscrição realizada!', 'Você se inscreveu com sucesso.');
      }
    } catch (e) {
      Alert.alert('Erro ao se inscrever', e.message);
    }
  };

  const handleAbrirDetalhes = (jogo) => {
    navigation.navigate('JogosDetalhes', {
      jogo,
      inscrito: inscritos.includes(jogo.id),
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleAbrirDetalhes(item)}>
      <Image source={{ uri: item.imagem }} style={styles.imagem} />
      <View style={styles.info}>
        <Text style={styles.local}>{item.local}</Text>
        <Text style={styles.tipo}>{item.tipo} ⚽ {item.horario}</Text>
        <Text style={styles.jogadores}>
          Jogadores: {item.jogadores} {inscritos.includes(item.id) && '✅ Inscrito'}
        </Text>
        <TouchableOpacity
  style={styles.botao}
  onPress={(e) => {
    e.stopPropagation(); // previne o card de roubar o clique
    handleInscricao(item.id);
  }}
>
  <Text style={styles.botaoTexto}>Inscrever-se</Text>
</TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{dono ? "Lista de Jogos" : 'Escolha um jogo'}</Text>
      <FlatList data={jogos} renderItem={renderItem} keyExtractor={(item) => item.id} />
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
  detalhes: {
    flexDirection: 'column',
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
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default JogosScreen;
