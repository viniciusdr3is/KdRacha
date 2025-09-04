import React, { useState, useCallback, useContext } from 'react';
import { View, Text, Image, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  buscarInscricoesDoUsuario,
  cancelarInscricao 
} from '../../firebase/config';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { db } from '../../firebase/config';
import { AuthContext } from '../../context/AuthContext';

const JogoDetalhesScreen = ({ route }) => {
  const navigation = useNavigation();
  const jogoInicial = route?.params?.jogo;

  if (!jogoInicial) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Erro ao Carregar</Text>
        <Text style={styles.texto}>Os detalhes do jogo não foram encontrados.</Text>
        <View style={{marginTop: 20}}>
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

  const isDono = usuario?.tipo === 'dono-quadra';

  const verificarInscricao = async () => {
    try {
      const inscricoes = await buscarInscricoesDoUsuario();
      const inscricaoAtual = inscricoes.find(i => i.jogoId === jogoInicial.id);
      
      if (inscricaoAtual) {
        setInscrito(true);
        setDadosInscricao(inscricaoAtual);
      } else {
        setInscrito(false);
        setDadosInscricao(null);
      }
    } catch (error) {
      console.error("Erro ao verificar inscrição:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      
      const jogoRef = doc(db, 'jogos', jogoInicial.id);
      const unsubscribe = onSnapshot(jogoRef, (doc) => {
        if (doc.exists()) {
          const dataFromDb = doc.data();
          if (dataFromDb.jogoData) {
            const flattenedData = {
              id: doc.id,
              criadorId: dataFromDb.criadorId,
              ...dataFromDb.jogoData,
            };
            setJogoAtual(flattenedData);
          } else {
            setJogoAtual({ id: doc.id, ...dataFromDb });
          }
        } else {
          console.error("Jogo não encontrado!");
          navigation.goBack();
        }
      });
      
      verificarInscricao();

      return () => unsubscribe();
    }, [jogoInicial.id])
  );

  const handleInscricao = () => {
    navigation.navigate('Pagamento', { jogoId: jogoAtual.id });
  };

  const handleCancelarInscricao = () => {
    Alert.alert(
      "Confirmar Cancelamento",
      "Tem a certeza de que deseja cancelar a sua inscrição neste jogo?",
      [
        { text: "Não", style: "cancel" },
        { 
          text: "Sim, Cancelar", 
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelarInscricao(jogoAtual.id);
              navigation.navigate('Jogos', { 
                toastMessage: 'Inscrição cancelada com sucesso!' 
              });
            } catch (e) {
              Alert.alert('Erro ao Cancelar', e.message);
              setActionLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  const handleAbrirRelatorio = () => {
    navigation.navigate('RelatorioJogo', { jogo: jogoAtual });
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  return (
    <View style={styles.container}>
      {jogoAtual.imagem ? (
        <Image source={{ uri: jogoAtual.imagem }} style={styles.imagem} />
      ) : (
        <View style={[styles.imagem, styles.imagemPlaceholder]} />
      )}
      <Text style={styles.titulo}>{jogoAtual.nome || jogoAtual.local}</Text>
      <Text style={styles.texto}>Local: {jogoAtual.local}</Text>
      <Text style={styles.texto}>Tipo: {jogoAtual.tipo}</Text>
      <Text style={styles.texto}>Horário: {jogoAtual.horario}</Text>
      <Text style={styles.texto}>Jogadores: {jogoAtual.jogadores} / Vagas: {jogoAtual.vagas}</Text>
      
      {inscrito && dadosInscricao && !isDono && (
        <View style={styles.dadosPagamentoContainer}>
          <Text style={styles.texto}>Valor Pago: R$ {jogoAtual.valor}</Text>
          <Text style={styles.texto}>
            Pagamento via: <Text style={{textTransform: 'capitalize'}}>{dadosInscricao.metodo}</Text>
          </Text>
        </View>
      )}

      {isDono ? (
        <View style={styles.botaoContainer}>
          <Button
            title="Ver Relatório de Inscritos"
            onPress={handleAbrirRelatorio}
            color="#007bff"
          />
        </View>
      ) : (
        <>
          <Text style={[styles.status, { color: inscrito ? '#28a745' : '#ffc107' }]}>
            {inscrito ? 'Você está inscrito neste jogo!' : 'Você ainda não se inscreveu.'}
          </Text>
          <View style={styles.botaoContainer}>
            {actionLoading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              inscrito ? (
                <Button
                  title="Cancelar Inscrição"
                  onPress={handleCancelarInscricao}
                  color="#dc3545"
                />
              ) : (
                <Button
                  title="Inscrever-se"
                  onPress={handleInscricao}
                  color="#1e90ff"
                  disabled={jogoAtual.vagas <= 0}
                />
              )
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center'
  },
  texto: {
    fontSize: 16,
    color: '#ddd',
    marginBottom: 5,
  },
  dadosPagamentoContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  botaoContainer: {
    marginTop: 30,
    width: '80%',
    minHeight: 40,
    justifyContent: 'center'
  }
});

export default JogoDetalhesScreen;

