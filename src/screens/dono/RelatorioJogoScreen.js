import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { buscarDetalhesInscritosPorJogo, db } from '../../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

const RelatorioJogoScreen = ({ route }) => {
  const { jogo } = route.params;

  const [inscritos, setInscritos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // --- Inscritos ---
        const listaInscritos = await buscarDetalhesInscritosPorJogo(jogo.id);
        setInscritos(listaInscritos);

        // --- Avaliações (2 formatos de chave) ---
        await carregarAvaliacoesDoJogo();
      } catch (error) {
        console.error('Erro ao carregar dados do relatório:', error);
      } finally {
        setLoading(false);
      }
    };

    const carregarAvaliacoesDoJogo = async () => {
      let docs = [];

      // 1) quando salvaram como "/jogos/<id>"
      const q1 = query(collection(db, 'avaliacoes'), where('jogoId', '==', /jogos/${jogo.id}));
      const s1 = await getDocs(q1);
      docs = s1.docs.map(d => ({ id: d.id, ...d.data() }));

      // 2) quando salvaram como "<id>"
      if (docs.length === 0) {
        const q2 = query(collection(db, 'avaliacoes'), where('jogoId', '==', ${jogo.id}));
        const s2 = await getDocs(q2);
        docs = s2.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // 3) opcional: caso normalize depois para jogoIdNorm
      if (docs.length === 0) {
        const q3 = query(collection(db, 'avaliacoes'), where('jogoIdNorm', '==', ${jogo.id}));
        const s3 = await getDocs(q3);
        docs = s3.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      setAvaliacoes(docs);

      const notas = docs
        .map(a => Number(a.nota ?? a.vrNota ?? 0))
        .filter(n => !Number.isNaN(n) && n > 0);

      const media =
        notas.length > 0 ? notas.reduce((acc, n) => acc + n, 0) / notas.length : 0;

      setMediaAvaliacoes(media);
    };

    carregarDados();
  }, [jogo.id]);

  const valorPorJogador = parseFloat(String(jogo.valor).replace(',', '.')) || 0;
  const totalArrecadado = inscritos.length * valorPorJogador;

  const renderJogador = ({ item }) => (
    <View style={styles.jogadorCard}>
      <Text style={styles.jogadorEmail}>{item.email}</Text>
      <Text style={styles.jogadorPagamento}>
        Pagou via: <Text style={{ textTransform: 'capitalize' }}>{item.inscricao.metodo}</Text>
      </Text>
    </View>
  );

  const renderAvaliacao = ({ item }) => {
    const nota = Number(item.nota ?? item.vrNota ?? 0);
    const comentario = item.comentario ?? item.dsComentario ?? '';

    return (
      <View style={styles.avaliacaoCard}>
        <Text style={styles.estrelas}>
          {'★'.repeat(Math.max(0, Math.min(5, Math.round(nota))))}
          {'☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(nota))))}
        </Text>
        {comentario ? (
          <Text style={styles.comentario}>{comentario}</Text>
        ) : (
          <Text style={styles.comentarioVazio}>Sem comentário</Text>
        )}
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>{jogo.nome}</Text>

      {/* Resumo Financeiro */}
      <View style={styles.sumarioContainer}>
        <Text style={styles.sumarioTitulo}>Resumo Financeiro</Text>
        <Text style={styles.sumarioTexto}>Jogadores inscritos: {inscritos.length}</Text>
        <Text style={styles.sumarioTexto}>
          Valor por jogador: R$ {valorPorJogador.toFixed(2).replace('.', ',')}
        </Text>
        <Text style={styles.totalArrecadado}>
          Total Recebido: R$ {totalArrecadado.toFixed(2).replace('.', ',')}
        </Text>
      </View>

      {/* Lista de jogadores */}
      <Text style={styles.listaTitulo}>Jogadores Inscritos</Text>
      <FlatList
        data={inscritos}
        renderItem={renderJogador}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum jogador inscrito ainda.</Text>}
      />

      {/* Avaliações */}
      <Text style={[styles.listaTitulo, { marginTop: 30 }]}>Avaliações dos Jogadores</Text>

      {avaliacoes.length > 0 ? (
        <View style={styles.mediaContainer}>
          <Text style={styles.mediaNota}>{mediaAvaliacoes.toFixed(1)}</Text>
          <Text style={styles.estrelas}>
            {'★'.repeat(Math.round(mediaAvaliacoes))}
            {'☆'.repeat(5 - Math.round(mediaAvaliacoes))}
          </Text>
          <Text style={styles.mediaTexto}>
            Média baseada em {avaliacoes.length} avaliação(ões)
          </Text>
        </View>
      ) : (
        <Text style={styles.listaVazia}>Nenhuma avaliação recebida ainda.</Text>
      )}

      <FlatList
        data={avaliacoes}
        renderItem={renderAvaliacao}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={null}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  titulo: {
    fontSize: 24, fontWeight: 'bold', color: '#fff',
    textAlign: 'center', marginBottom: 20,
  },
  sumarioContainer: {
    backgroundColor: '#1C1C1E', borderRadius: 10, padding: 20, marginBottom: 30,
  },
  sumarioTitulo: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  sumarioTexto: { fontSize: 16, color: '#ddd', marginBottom: 5 },
  totalArrecadado: {
    fontSize: 20, fontWeight: 'bold', color: '#28a745',
    marginTop: 10, textAlign: 'center',
  },
  listaTitulo: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
  listaVazia: { color: '#777', textAlign: 'center', marginTop: 10 },

  jogadorCard: {
    backgroundColor: '#2C2C2E', borderRadius: 8, padding: 15, marginBottom: 10,
  },
  jogadorEmail: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  jogadorPagamento: { fontSize: 14, color: '#1e90ff', marginTop: 5 },

  mediaContainer: { alignItems: 'center', marginBottom: 15 },
  mediaNota: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  mediaTexto: { color: '#bbb', marginTop: 5 },

  avaliacaoCard: {
    backgroundColor: '#2C2C2E', borderRadius: 8, padding: 15, marginBottom: 10,
  },
  estrelas: { color: '#FFD700', fontSize: 16 },
  comentario: { color: '#fff', marginTop: 8 },
  comentarioVazio: { color: '#888', marginTop: 8, fontStyle: 'italic' },
});

export default RelatorioJogoScreen;