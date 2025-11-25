import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { salvarAvaliacao } from '../../firebase/config';

// Componente auxiliar para as estrelas de avaliação
const EstrelasAvaliacao = ({ classificacao, setClassificacao }) => {
  return (
    <View style={styles.estrelasContainer}>
      {[1, 2, 3, 4, 5].map((estrela) => (
        <TouchableOpacity key={estrela} onPress={() => setClassificacao(estrela)}>
          <Text style={[styles.estrela, classificacao >= estrela ? styles.estrelaSelecionada : {}]}>
            ★
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AvaliacaoScreen = ({ route }) => {
  // Recebe os dados do jogo da navegação anterior
  const { jogo } = route.params;
  const navigation = useNavigation();
  
  const [classificacao, setClassificacao] = useState(0); // 0 = sem nota
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSalvar = async () => {
    if (classificacao === 0) {
      Alert.alert("Atenção", "Por favor, selecione uma classificação de 1 a 5 estrelas.");
      return;
    }

    setLoading(true);
    try {
      // Chama a função do Firebase para salvar a avaliação
      await salvarAvaliacao(jogo.id, classificacao, comentario);
      
      Alert.alert("Avaliação Enviada", "Obrigado pelo seu feedback!");
      navigation.goBack(); // Volta para o ecrã anterior (Histórico)
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
      Alert.alert("Erro", "Não foi possível enviar a sua avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.titulo}>Avaliar Jogo</Text>
      <Text style={styles.nomeJogo}>{jogo.nome || jogo.local}</Text>
      
      <Text style={styles.label}>A sua Classificação:</Text>
      <EstrelasAvaliacao classificacao={classificacao} setClassificacao={setClassificacao} />

      <Text style={styles.label}>Comentário (opcional):</Text>
      <TextInput
        style={styles.inputComentario}
        placeholder="Descreva a sua experiência..."
        placeholderTextColor="#888"
        value={comentario}
        onChangeText={setComentario}
        multiline
        numberOfLines={4}
      />

      <View style={styles.botaoContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#28a745" />
        ) : (
          <TouchableOpacity style={styles.botao} onPress={handleSalvar}>
            <Text style={styles.botaoTexto}>Enviar Avaliação</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
  nomeJogo: {
    fontSize: 18,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    marginTop: 15,
    alignSelf: 'flex-start',
    width: '100%',
  },
  estrelasContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  estrela: {
    fontSize: 40,
    color: '#555', // Cor da estrela apagada (cinzento)
    marginHorizontal: 5,
  },
  estrelaSelecionada: {
    color: '#FFD700', // Cor da estrela acesa (dourado)
  },
  inputComentario: {
    backgroundColor: '#1C1C1E',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    fontSize: 16,
    height: 100,
    width: '100%',
    textAlignVertical: 'top',
  },
  botaoContainer: {
    marginTop: 40,
    alignItems: 'center',
    width: '100%',
  },
  botao: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AvaliacaoScreen;