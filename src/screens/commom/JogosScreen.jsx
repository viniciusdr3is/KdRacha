import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { buscarInscricoesDoUsuario, removerJogo } from '../../firebase/config.js';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ouvirJogosEmTempoReal } from '../../data/jogos';
import { AuthContext } from '../../context/AuthContext.jsx';

const JogosScreen = ({ route }) => {
  const [jogos, setJogos] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const navigation = useNavigation();
  const { usuario, carregando } = useContext(AuthContext);

  const dono = usuario?.tipo === 'dono-quadra';

  useEffect(() => {
    if (carregando) return;
    if (!usuario) {
      setJogos([]);
      return;
    }

    let unsubscribe;
    if (dono) {
      unsubscribe = ouvirJogosEmTempoReal(setJogos, usuario.uid);
    } else {
      unsubscribe = ouvirJogosEmTempoReal(setJogos);
    }

    return () => unsubscribe();
  }, [usuario, carregando, dono]);


  useEffect(() => {
    if (route.params?.toastMessage) {
      setToastMessage(route.params.toastMessage);
      const timer = setTimeout(() => {
        setToastMessage('');
        navigation.setParams({ toastMessage: null });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [route.params?.toastMessage]);
  
  useFocusEffect(
    useCallback(() => {
      if (!usuario) return;
      const carregarInscricoes = async () => {
        try {
          const inscricoesCompletas = await buscarInscricoesDoUsuario();
          const idsDosJogos = inscricoesCompletas.map(inscricao => inscricao.jogoId);
          setInscritos(idsDosJogos);
        } catch (error) {
          console.error("Erro ao carregar inscrições:", error);
        }
      };
      carregarInscricoes();
    }, [usuario])
  );

  const handleAbrirDetalhes = (jogo) => {
    const dadosDoJogo = jogo.jogoData 
      ? { id: jogo.id, criadorId: jogo.criadorId, ...jogo.jogoData } 
      : jogo;
    navigation.navigate('JogosDetalhes', { jogo: dadosDoJogo });
  };

  const handleRemoverJogo = (jogo) => {
    if (jogo.criadorId !== usuario?.uid) {
      Alert.alert("Acesso Negado", "Você não pode remover jogos que não criou.");
      return;
    }
    
    const dados = jogo.jogoData || jogo;

    Alert.alert(
      "Confirmar Exclusão",
      `Tem a certeza de que deseja remover o jogo "${dados.nome || dados.local}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, Remover", 
          onPress: async () => {
            try {
              await removerJogo(jogo.id);
            } catch (error) {
              console.error("Erro ao remover jogo:", error);
              Alert.alert("Erro", "Não foi possível remover o jogo.");
            }
          },
          style: 'destructive' 
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const dados = item.jogoData ? item.jogoData : item;
    const isUserInscrito = inscritos.includes(item.id);

    const jogadoresInscritos = dados.jogadores || 0;
    const vagasRestantes = dados.vagas || 0;
    const totalVagas = jogadoresInscritos + vagasRestantes;

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleAbrirDetalhes(item)}>
        {dados.imagem ? (
          <Image source={{ uri: dados.imagem }} style={styles.imagem} />
        ) : (
          <View style={[styles.imagem, styles.imagemPlaceholder]} />
        )}

        <View style={styles.contentContainer}>
          <Text style={styles.nomeJogo}>{dados.nome}</Text>
          <Text style={styles.local}>📍 {dados.local}</Text>

          <View style={styles.detailsRow}>
            <Text style={styles.infoText}>🗓️ {dados.data} às {dados.horario}</Text>
            <Text style={styles.infoText}>👥 {jogadoresInscritos} / {totalVagas} Jogadores</Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.valor}>
              R$ {dados.valor}
              {isUserInscrito && (
                <Text style={styles.inscritoTexto}> (Inscrito)</Text>
              )}
            </Text>
            
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoDetalhes]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAbrirDetalhes(item);
                }}
              >
                <Text style={styles.botaoTexto}>🔍</Text>
              </TouchableOpacity>

              {dono && item.criadorId === usuario.uid && (
                <TouchableOpacity
                  style={[styles.botao, styles.botaoRemover]}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoverJogo(item);
                  }}
                >
                  <Text style={styles.botaoTexto}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          {dono ? 'Meus Jogos Criados' : 'Escolha um Jogo'}
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
          ListEmptyComponent={<Text style={{ color: '#777', textAlign: 'center' }}>
            {dono ? 'Você ainda não criou nenhum jogo.' : 'Nenhum jogo disponível no momento.'}
          </Text>}
          extraData={inscritos} 
        />
      </View>

      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 10,
  },
  titulo: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 60,
  },
  botaoAdicionar: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: '#222',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  imagem: {
    width: '100%',
    height: 140,
  },
  imagemPlaceholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    padding: 15,
  },
  nomeJogo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  local: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#ddd',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 10,
  },
  valor: {
    fontSize: 16,
    color: '#1e90ff',
    fontWeight: 'bold',
  },
  inscritoTexto: {
    color: '#28a745',
    fontWeight: 'bold',
    fontSize: 14,
  },
  botoesContainer: {
    flexDirection: 'row',
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  botaoDetalhes: {
    backgroundColor: '#007bff',
  },
  botaoRemover: {
    backgroundColor: '#dc3545',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontWeight: 'bold',
  }
}); 

export default JogosScreen;

