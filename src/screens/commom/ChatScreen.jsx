// src/screens/commom/ChatScreen.jsx
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
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import {
  criarChatSeNaoExiste,
  ouvirMensagens,
  enviarMensagem,
  verificarUsuarioNoJogo,
} from '../../firebase/chat';

const ChatScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const jogo = route?.params?.jogo || route?.params?.jogoData || null;
  const jogoId = jogo?.id || route?.params?.jogoId;
  const [mensagens, setMensagens] = useState([]);
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [temAcesso, setTemAcesso] = useState(false);
  const unsubRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!jogoId) {
      console.warn('ChatScreen: jogoId ausente');
      return;
    }

    const init = async () => {
      // cria doc do chat se necessário
      await criarChatSeNaoExiste(jogoId, jogo || {});
      // verifica se user é criado/inscrito
      const permitido = await verificarUsuarioNoJogo(jogoId, user?.uid, jogo?.criadorId);
      setTemAcesso(permitido);

      if (!permitido) {
        setLoading(false);
        return;
      }

      // subscreve mensagens
      const unsub = ouvirMensagens(jogoId, (msgs) => {
        setMensagens(msgs);
        setLoading(false);
        // opcional: scroll to end no próximo tick
        setTimeout(() => {
          if (flatListRef.current && msgs.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      });
      unsubRef.current = unsub;
    };

    init();

    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, [jogoId]);

  const handleSend = async () => {
    if (!texto.trim()) return;
    await enviarMensagem(jogoId, texto.trim(), user);
    setTexto('');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!temAcesso) {
    return (
      <View style={styles.center}>
        <Text>Você não tem acesso a este chat. Apenas jogadores inscritos e o dono da quadra podem participar.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isMe = item.senderId === user?.uid;
    return (
      <View style={[styles.messageContainer, isMe ? styles.messageRight : styles.messageLeft]}>
        <Text style={styles.sender}>{item.senderName || 'Usuário'}</Text>
        <Text style={styles.messageText}>{item.text}</Text>
        {/* optional: format createdAt */}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={mensagens}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current && flatListRef.current.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputArea}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva uma mensagem..."
          style={styles.input}
          multiline
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  listContent: { padding: 12, paddingBottom: 100 },
  messageContainer: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  messageLeft: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  messageRight: {
    alignSelf: 'flex-end',
    backgroundColor: '#0a84ff',
  },
  sender: { fontSize: 12, marginBottom: 4, color: '#333' },
  messageText: { color: '#000' },
  inputArea: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#0a84ff',
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default ChatScreen;
