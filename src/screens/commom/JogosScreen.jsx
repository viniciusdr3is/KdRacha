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
    const dadosDoJogo = {
      id: jogo.id,
      criadorId: jogo.criadorId,
      ...jogo.jogoData
    };
    navigation.navigate('JogosDetalhes', { jogo: dadosDoJogo });
  };

  const handleRemoverJogo = (jogo) => {
    if (jogo.criadorId !== usuario?.uid) {
      Alert.alert(
        "Acesso Negado",
        "Você não tem permissão para remover jogos que não criou."
      );
      return;
    }

    Alert.alert(
      "Confirmar Exclusão",
      `Tem a certeza de que deseja remover o jogo "${jogo.jogoData.nome || jogo.jogoData.local}"?`,
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
    const isUserInscrito = inscritos.includes(item.id);
    return (
      <View style={styles.card}>
        {item.jogoData.imagem ? (
          <Image source={{ uri: item.jogoData.imagem }} style={styles.imagem} />
        ) : (
          <View style={[styles.imagem, { backgroundColor: '#333' }]} />
        )}
        <View style={styles.info}>
          <Text style={styles.local}>{item.jogoData.nome || item.jogoData.local}</Text>
          <Text style={styles.tipo}>{item.jogoData.tipo} ⚽ {item.jogoData.horario}</Text>
          <Text style={styles.jogadores}>
            Vagas restantes: {item.jogoData.vagas ?? '?'}
          </Text>
          <Text style={styles.valor}>
            Valor: R$ {item.jogoData.valor}
            {isUserInscrito && (
              <Text style={styles.inscritoTexto}> ✅ Inscrito</Text>
            )}
          </Text>
          
          <View style={styles.botoesContainer}>
            <TouchableOpacity
              style={styles.botao}
              onPress={() => handleAbrirDetalhes(item)}
            >
              <Text style={styles.botaoTexto}>🔍 Detalhes</Text>
            </TouchableOpacity>

            {dono && item.criadorId === usuario.uid && (
              <TouchableOpacity
                style={[styles.botao, styles.botaoRemover]}
                onPress={() => handleRemoverJogo(item)}
              >
                <Text style={styles.botaoTexto}>🗑️ Remover</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
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
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    color: '#fff',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  botaoAdicionar: {
    backgroundColor: '#1e90ff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  imagem: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  info: {
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
    marginTop: 5,
  },
  valor: {
    fontSize: 15,
    color: '#1e90ff',
    fontWeight: 'bold',
    marginTop: 8,
  },
  inscritoTexto: {
    color: '#28a745', 
    fontWeight: 'bold',
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  botao: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
  },
  botaoRemover: {
    backgroundColor: '#dc3545',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
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

