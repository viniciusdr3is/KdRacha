import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ouvirHistoricoJogosDono } from '../../data/jogos';
import { AuthContext } from '../../context/AuthContext.jsx';

const HistoricoDonoScreen = () => {
  const [jogosPassados, setJogosPassados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    if (!usuario) return;

    const unsubscribe = ouvirHistoricoJogosDono(setJogosPassados, usuario.uid);
    setLoading(false);
    
    return () => unsubscribe();
  }, [usuario]);

  const handleAbrirRelatorio = (jogo) => {
    const dadosDoJogo = jogo.jogoData ? { id: jogo.id, ...jogo.jogoData } : jogo;
    navigation.navigate('RelatorioJogo', { jogo: dadosDoJogo });
  };

  const renderItem = ({ item }) => {
    const dados = item.jogoData || item;
    return (
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.nomeJogo}>{dados.nome}</Text>
          <Text style={styles.data}>Realizado em: {dados.data} às {dados.horario}</Text>
          <Text style={styles.jogadores}>Participantes: {dados.jogadores}</Text>
        </View>
        <TouchableOpacity style={styles.botao} onPress={() => handleAbrirRelatorio(item)}>
          <Text style={styles.botaoTexto}>Ver Relatório</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Jogos Finalizados</Text>
      <FlatList
        data={jogosPassados}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum jogo passado encontrado.</Text>}
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
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 60,
    },
    card: {
        backgroundColor: '#222',
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    nomeJogo: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    data: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 4,
    },
    jogadores: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 4,
    },
    botao: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    botaoTexto: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listaVazia: {
        color: '#777',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default HistoricoDonoScreen;
