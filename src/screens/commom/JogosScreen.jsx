import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import {
  inscreverEmJogo,
  buscarInscricoesDoUsuario
} from '../../firebase/config.js';
import { useNavigation } from '@react-navigation/native';
import { ouvirJogosEmTempoReal } from '../../data/jogos'; // 🔁 Novo import
import { AuthContext } from '../../context/AuthContext.jsx';

const JogosScreen = () => {
  const [jogos, setJogos] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const navigation = useNavigation();
  const { usuario } = useContext(AuthContext);

  const dono = usuario?.tipo === 'dono-quadra';

  useEffect(() => {
    const unsubscribe = ouvirJogosEmTempoReal(setJogos);
    return () => unsubscribe(); // limpa escuta ao sair da tela
  }, []);

  useEffect(() => {
    const carregarInscricoes = async () => {
      try {
        const ids = await buscarInscricoesDoUsuario();
        setInscritos(ids);
      } catch (error) {
        console.error("Erro ao carregar inscrições:", error);
      }
    };
    carregarInscricoes();
  }, []);

  const handleAbrirDetalhes = (jogo) => {
    navigation.navigate('JogosDetalhes', {
      jogo,
      inscrito: inscritos.includes(jogo.id),
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.imagem }} style={styles.imagem} />
      <View style={styles.info}>
        <Text style={styles.local}>{item.local}</Text>
        <Text style={styles.tipo}>
          {item.tipo} ⚽ {item.horario}
        </Text>
        <Text style={styles.jogadores}>
          Jogadores: {item.jogadores ?? 0} / {item.vagas ??'?'}
          {inscritos.includes(item.id) && '✅ Inscrito'}
        </Text>
        <Text style={styles.valor}> Valor:{item.valor}</Text>
        <TouchableOpacity
          style={styles.botao}
          onPress={(e) => {
            e.stopPropagation();
            handleAbrirDetalhes(item);
          }}
        >
          <Text style={styles.botaoTexto}>🔍</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        {dono ? 'Lista de Jogos' : 'Escolha um jogo'}
      </Text>

      {dono && (
        <TouchableOpacity
          style={styles.botaoAdicionar}
          onPress={() => navigation.navigate('CadastrarJogo')}
        >
          <Text style={styles.botaoTexto}>+ Adicionar Jogo</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={jogos}
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
    fontSize: 20,
    color: '#fff',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  botaoAdicionar: {
    backgroundColor: '#1e90ff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
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
  valor: {
    fontSize: 14,
    color: '#1e90ff',
    marginTop: 10,
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
    textAlign: 'center',
  },
});

export default JogosScreen;
