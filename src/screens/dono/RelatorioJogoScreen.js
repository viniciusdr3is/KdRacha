import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { buscarDetalhesInscritosPorJogo } from '../../firebase/config';

const RelatorioJogoScreen = ({ route }) => {
  const { jogo } = route.params;
  const [inscritos, setInscritos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarInscritos = async () => {
      try {
        const listaInscritos = await buscarDetalhesInscritosPorJogo(jogo.id);
        setInscritos(listaInscritos);
      } catch (error) {
        console.error("Erro ao buscar detalhes dos inscritos:", error);
      } finally {
        setLoading(false);
      }
    };
    carregarInscritos();
  }, [jogo.id]);

  const valorPorJogador = parseFloat(String(jogo.valor).replace(',', '.'));
  const totalArrecadado = inscritos.length * valorPorJogador;

  const renderJogador = ({ item }) => (
    <View style={styles.jogadorCard}>
      <Text style={styles.jogadorEmail}>{item.email}</Text>
      <Text style={styles.jogadorPagamento}>
        Pagou via: <Text style={{textTransform: 'capitalize'}}>{item.inscricao.metodo}</Text>
      </Text>
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>{jogo.nome}</Text>

      <View style={styles.sumarioContainer}>
        <Text style={styles.sumarioTitulo}>Resumo Financeiro</Text>
        <Text style={styles.sumarioTexto}>Jogadores inscritos: {inscritos.length}</Text>
        <Text style={styles.sumarioTexto}>Valor por jogador: R$ {valorPorJogador.toFixed(2).replace('.', ',')}</Text>
        <Text style={styles.totalArrecadado}>Total Recebido: R$ {totalArrecadado.toFixed(2).replace('.', ',')}</Text>
      </View>

      <Text style={styles.listaTitulo}>Jogadores Inscritos</Text>
      <FlatList
        data={inscritos}
        renderItem={renderJogador}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum jogador inscrito ainda.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  sumarioContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  sumarioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  sumarioTexto: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 5,
  },
  totalArrecadado: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 10,
    textAlign: 'center',
  },
  listaTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  jogadorCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  jogadorEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  jogadorPagamento: {
    fontSize: 14,
    color: '#1e90ff',
    marginTop: 5,
  },
  listaVazia: {
    color: '#777',
    textAlign: 'center',
  },
});

export default RelatorioJogoScreen;

