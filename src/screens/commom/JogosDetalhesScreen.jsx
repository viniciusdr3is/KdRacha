import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  buscarInscricoesDoUsuario,
  cancelarInscricao,
} from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { AuthContext } from '../../context/AuthContext';

const JogoDetalhesScreen = ({ route }) => {
  const navigation = useNavigation();
  
  // Acesso seguro aos parâmetros para evitar erros
  const jogoInicial = route?.params?.jogo;

  if (!jogoInicial) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Erro ao Carregar</Text>
        <Text style={styles.texto}>Os detalhes do jogo não foram encontrados.</Text>
        <View style={{ marginTop: 20 }}>
          <Button title="Voltar" onPress={() => navigation.goBack()} color="#1e90ff" />
        </View>
      </View>
    );
  }

  const { usuario } = useContext(AuthContext);
  const [jogoAtual, setJogoAtual] = useState(jogoInicial);
  const [dadosInscricao, setDadosInscricao] = useState(null);
  const [inscrito, setInscrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Verifica se o utilizador logado é o dono da quadra
  // (Pode ser refinado verificando se usuario.uid === jogoAtual.criadorId)
  const isDono = usuario?.tipo === 'dono-quadra';

  const verificarInscricao = async () => {
    try {
      const inscricoes = await buscarInscricoesDoUsuario();
      // Garante que inscricoes é um array
      if (Array.isArray(inscricoes)) {
        const inscricaoAtual = inscricoes.find((i) => i.jogoId === jogoInicial.id);
        if (inscricaoAtual) {
          setInscrito(true);
          setDadosInscricao(inscricaoAtual);
        } else {
          setInscrito(false);
          setDadosInscricao(null);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar inscrição:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      const jogoRef = doc(db, 'jogos', jogoInicial.id);
      // Escuta atualizações do jogo em tempo real (ex: vagas mudando)
      const unsubscribe = onSnapshot(
        jogoRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const dataFromDb = docSnap.data();
            // Lógica para suportar estrutura antiga (aninhada) e nova (plana)
            const flattenedData = {
              id: docSnap.id,
              criadorId: dataFromDb.criadorId,
              ...(dataFromDb.jogoData || dataFromDb),
            };
            setJogoAtual(flattenedData);
          } else {
            console.error('Jogo não encontrado (pode ter sido removido)!');
            navigation.goBack();
          }
        },
        (err) => {
          console.error('Erro snapshot jogo:', err);
        }
      );

      verificarInscricao();

      return () => unsubscribe();
    }, [jogoInicial.id])
  );

  const handleInscricao = () => {
    // Navega para o pagamento passando ID e Valor
    navigation.navigate('Pagamento', {
      jogoId: jogoAtual.id,
      valor: jogoAtual.valor,
    });
  };

  const handleCancelarInscricao = () => {
    Alert.alert(
      'Confirmar Cancelamento',
      'Tem a certeza de que deseja cancelar a sua inscrição neste jogo?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelarInscricao(jogoAtual.id);
              navigation.navigate('Jogos', {
                toastMessage: 'Inscrição cancelada com sucesso!',
              });
            } catch (e) {
              Alert.alert('Erro ao Cancelar', e.message || 'Erro desconhecido');
              setActionLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAbrirRelatorio = () => {
    navigation.navigate('RelatorioJogo', { jogo: jogoAtual });
  };

  const handleAbrirChat = () => {
    // Passa os dados necessários para o ecrã de chat
    navigation.navigate('Chat', { jogoId: jogoAtual.id, jogo: jogoAtual, jogoData: jogoAtual });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Normaliza contagem de inscritos/vagas para evitar NaN
  const jogadoresInscritos = Number(jogoAtual.jogadores) || 0;
  const vagasRestantes = Number(jogoAtual.vagas) || 0;
  const totalVagas = jogadoresInscritos + vagasRestantes;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {jogoAtual.imagem ? (
          <Image source={{ uri: jogoAtual.imagem }} style={styles.imagem} />
        ) : (
          <View style={[styles.imagem, styles.imagemPlaceholder]} />
        )}

        <Text style={styles.titulo}>{jogoAtual.nome || jogoAtual.local}</Text>
        <Text style={styles.texto}>📍 Local: {jogoAtual.local}</Text>
        <Text style={styles.texto}>⚽ Tipo: {jogoAtual.tipo}</Text>
        <Text style={styles.texto}>🗓️ Horário: {jogoAtual.horario}</Text>
        <Text style={styles.texto}>
          👥 Inscritos: {jogadoresInscritos} / {totalVagas}
        </Text>
        <Text style={styles.texto}>💲 Valor: R$ {jogoAtual.valor}</Text>

        {/* Se houver observação, mostra aqui */}
        {jogoAtual.observacao ? (
            <View style={styles.obsContainer}>
                <Text style={styles.obsTitulo}>Observações:</Text>
                <Text style={styles.obsTexto}>{jogoAtual.observacao}</Text>
            </View>
        ) : null}

        {/* Informação de Pagamento (apenas para jogador inscrito) */}
        {inscrito && dadosInscricao && !isDono && (
          <View style={styles.dadosPagamentoContainer}>
            <Text style={styles.textoPagamento}>Status: Inscrito</Text>
            <Text style={styles.textoPagamento}>
              Pagamento via:{' '}
              <Text style={{ textTransform: 'capitalize', fontWeight:'bold', color:'#fff' }}>
                {dadosInscricao.metodo}
              </Text>
            </Text>
          </View>
        )}

        {/* LÓGICA DE BOTÕES */}
        {isDono ? (
          // Visão do Dono
          <View style={styles.botaoContainer}>
            <TouchableOpacity
              style={styles.relatorioButton}
              onPress={handleAbrirRelatorio}
            >
              <Text style={styles.relatorioButtonText}>📊 Ver Relatório de Inscritos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.chatButton} onPress={handleAbrirChat}>
              <Text style={styles.chatButtonText}>💬 Abrir Chat do Jogo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Visão do Jogador
          <>
            <Text
              style={[
                styles.status,
                { color: inscrito ? '#28a745' : '#ffc107' },
              ]}
            >
              {inscrito ? 'Você está inscrito neste jogo!' : 'Você ainda não se inscreveu.'}
            </Text>

            <View style={styles.botaoContainer}>
              {actionLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : inscrito ? (
                <>
                  <TouchableOpacity style={styles.chatButtonInline} onPress={handleAbrirChat}>
                    <Text style={styles.chatButtonTextInline}>💬 Entrar no Chat</Text>
                  </TouchableOpacity>

                  <Button
                    title="Cancelar Inscrição"
                    onPress={handleCancelarInscricao}
                    color="#dc3545"
                  />
                </>
              ) : (
                <Button
                  title="Inscrever-se"
                  onPress={handleInscricao}
                  color="#1e90ff"
                  disabled={vagasRestantes <= 0}
                />
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  imagem: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  imagemPlaceholder: {
    backgroundColor: '#333',
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  texto: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 5,
  },
  obsContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  obsTitulo: {
    color: '#ffc107',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  obsTexto: {
    color: '#ddd',
    fontStyle: 'italic',
  },
  dadosPagamentoContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#28a745'
  },
  textoPagamento: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 2,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center'
  },
  botaoContainer: {
    marginTop: 30,
    width: '100%',
    minHeight: 40,
    justifyContent: 'center',
    gap: 15, // Espaço entre botões
  },
  relatorioButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatorioButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 12, // Espaço se estiver abaixo de outro botão
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatButtonInline: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  chatButtonTextInline: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default JogoDetalhesScreen;