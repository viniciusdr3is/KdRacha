import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  criarChatSeNaoExiste,
  ouvirMensagens,
  enviarMensagem,
  verificarUsuarioNoJogo,
} from '../../firebase/chat';

const ChatScreen = ({ route, navigation }) => {
  const { usuario } = useContext(AuthContext);
  
  // --- TRATAMENTO SEGURO DE PARÂMETROS ---
  // Garante que não falha se os parâmetros vierem incompletos
  const params = route.params || {};
  const jogoData = params.jogo || params.jogoData || {};
  const jogoId = params.jogoId || jogoData.id;

  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [temAcesso, setTemAcesso] = useState(null);
  
  const flatListRef = useRef(null);

  // 1. Validação Inicial: Se não houver ID, volta para trás
  useEffect(() => {
    if (!jogoId) {
      Alert.alert("Erro", "Não foi possível carregar o chat deste jogo.");
      navigation.goBack();
    }
  }, [jogoId, navigation]);

  // 2. Inicialização do Chat
  useEffect(() => {
    // Define o título do ecrã
    navigation.setOptions({ title: jogoData.nome || 'Chat do Jogo' });
    
    const init = async () => {
      if (!usuario || !jogoId) return;

      try {
        // Garante que o documento do chat existe no Firebase
        await criarChatSeNaoExiste(jogoId, jogoData);

        // Verifica se o utilizador tem permissão para estar no chat
        const permitido = await verificarUsuarioNoJogo(jogoId, usuario.uid, jogoData.criadorId);
        setTemAcesso(permitido);

        if (!permitido) {
          setLoading(false);
          return;
        }

        // Subscreve às mensagens em tempo real
        const unsubscribe = ouvirMensagens(jogoId, (msgs) => {
          setMensagens(msgs);
          setLoading(false);
        });

        return () => unsubscribe(); 

      } catch (error) {
        console.error("Erro ao carregar chat:", error);
        Alert.alert("Erro", "Falha ao conectar ao chat.");
        setLoading(false);
      }
    };

    let unsubscribeMessages;
    init().then(unsub => {
      if (typeof unsub === 'function') {
        unsubscribeMessages = unsub;
      }
    });

    return () => { 
      if (unsubscribeMessages) unsubscribeMessages(); 
    };
  }, [jogoId, usuario]);

  // 3. Função de Envio
  const handleSend = async () => {
    if (!texto.trim()) return;
    const msgTemp = texto;
    setTexto(''); // Limpa o input imediatamente para melhor UX
    try {
      await enviarMensagem(jogoId, msgTemp, usuario);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
      setTexto(msgTemp); // Restaura o texto se falhar
    }
  };

  // 4. Auto-Scroll: Rola para o fundo quando chega nova mensagem
  useEffect(() => {
    if (mensagens.length > 0 && flatListRef.current) {
      setTimeout(() => {
        // scrollToEnd leva para o fim da lista (mensagens mais recentes)
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [mensagens]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  if (temAcesso === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Acesso Negado.</Text>
        <Text style={styles.infoText}>Você precisa de se inscrever neste jogo para aceder ao chat.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
           <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isMe = item.senderId === usuario?.uid;
    
    let timeString = '...';
    if (item.createdAt) {
       const dateObj = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
       if (!isNaN(dateObj)) {
         timeString = dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
       }
    }

    return (
      <View style={[styles.row, isMe ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.messageContainer, isMe ? styles.messageRight : styles.messageLeft]}>
          {!isMe && <Text style={styles.sender}>{item.senderName}</Text>}
          <Text style={isMe ? styles.textRight : styles.textLeft}>{item.text}</Text>
          <Text style={[styles.time, isMe ? styles.timeRight : styles.timeLeft]}>
            {timeString}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={mensagens}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          // Nota: Removemos 'inverted' para a lista fluir de cima para baixo
        />

        <View style={styles.inputArea}>
          <TextInput
            value={texto}
            onChangeText={setTexto}
            placeholder="Digite a sua mensagem..."
            placeholderTextColor="#888"
            style={styles.input}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  keyboardView: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', padding: 20 },
  errorText: { color: '#dc3545', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  infoText: { color: '#fff', textAlign: 'center', marginBottom: 20 },
  
  listContent: { padding: 15, paddingBottom: 20 },
  
  row: { width: '100%', flexDirection: 'row', marginBottom: 10 },
  rowRight: { justifyContent: 'flex-end' },
  rowLeft: { justifyContent: 'flex-start' },

  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 15,
  },
  messageLeft: {
    backgroundColor: '#222',
    borderTopLeftRadius: 0,
  },
  messageRight: {
    backgroundColor: '#1e90ff',
    borderTopRightRadius: 0,
  },

  sender: { fontSize: 12, color: '#1e90ff', marginBottom: 4, fontWeight: 'bold' },
  textLeft: { color: '#fff', fontSize: 16 },
  textRight: { color: '#fff', fontSize: 16 },
  
  time: { fontSize: 10, marginTop: 5, alignSelf: 'flex-end' },
  timeLeft: { color: '#888' },
  timeRight: { color: 'rgba(255,255,255,0.7)' },

  inputArea: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#1e90ff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
  backButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff' }
});

export default ChatScreen;