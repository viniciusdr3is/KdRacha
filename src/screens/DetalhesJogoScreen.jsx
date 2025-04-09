// src/screens/DetalhesJogoScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

const DetalhesJogoScreen = ({ route, navigation }) => {
  const { jogo } = route.params; // Pegando os dados do jogo passado como parâmetro
  const [inscrito, setInscrito] = useState(false); // Estado para verificar se o usuário está inscrito

  // Função de inscrição
  const handleInscricao = () => {
    if (inscrito) {
      Alert.alert('Você já está inscrito nesse jogo!');
    } else {
      setInscrito(true);
      Alert.alert('Sucesso!', `Você foi inscrito no jogo de ${jogo.modalidade}.`);
      // Aqui você pode adicionar lógica para salvar no banco de dados, etc.
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{jogo.modalidade}</Text>
      <Text style={styles.date}>Data: {jogo.data} - Hora: {jogo.hora}</Text>
      <Text style={styles.price}>Preço: R${jogo.preco}</Text>

      <Text style={styles.subTitle}>Regras:</Text>
      <Text style={styles.rules}>{jogo.regras}</Text>

      <Text style={styles.subTitle}>Localização:</Text>
      <Text style={styles.location}>{jogo.localizacao}</Text>

      {/* Botão de inscrição */}
      <Button title={inscrito ? "Já Inscrito" : "Inscrever-se"} onPress={handleInscricao} />
      
      <Button
        title="Voltar"
        onPress={() => navigation.goBack()} // Volta para a tela anterior
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  rules: {
    fontSize: 16,
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default DetalhesJogoScreen;
