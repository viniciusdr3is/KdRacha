import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { inscreverEmJogo, buscarInscricoesDoUsuario } from '../firebase/firestore'; // ajuste o caminho
import { useNavigation } from '@react-navigation/native';

const jogos = [
  { id: '1', local: 'Arena Uberlândia, Martins', tipo: 'OUTDOOR', horario: '18:00', jogadores: '15/18', imagem: 'https://tntsports.com.br/__export/1724167770540/sites/esporteinterativo/img/2024/08/20/novo_camp_nou_1_1.png_554688468.png', data:"2025-04-02" },
  { id: '2', local: 'Parque do Sabiá, Tibery', tipo: 'INDOOR', horario: '18:30', jogadores: '12/16', imagem: 'https://tntsports.com.br/__export/1724167770540/sites/esporteinterativo/img/2024/08/20/novo_camp_nou_1_1.png_554688468.png' },
  { id: '3', local: 'Coca Cola, Custódio', tipo: 'OUTDOOR', horario: '19:00', jogadores: '11/14', imagem: 'https://tntsports.com.br/__export/1724167770540/sites/esporteinterativo/img/2024/08/20/novo_camp_nou_1_1.png_554688468.png' },
  { id: '4', local: 'Coca Cola, Custódio', tipo: 'OUTDOOR', horario: '19:00', jogadores: '11/14', imagem: 'https://tntsports.com.br/__export/1724167770540/sites/esporteinterativo/img/2024/08/20/novo_camp_nou_1_1.png_554688468.png' },
  { id: '5', local: 'Coca Cola, Custódio', tipo: 'OUTDOOR', horario: '19:00', jogadores: '11/14', imagem: 'https://tntsports.com.br/__export/1724167770540/sites/esporteinterativo/img/2024/08/20/novo_camp_nou_1_1.png_554688468.png' },
];


const JogosScreen = () => {
  const [inscritos, setInscritos] = useState([]);
  const navigation = useNavigation();

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
    navigation.navigate('JogoDetalhes', {
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
      <Text style={styles.titulo}>Escolha um jogo para participar:</Text>
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
