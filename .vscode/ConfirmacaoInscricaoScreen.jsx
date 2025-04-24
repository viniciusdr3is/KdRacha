// src/screens/ConfirmacaoInscricaoScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const ConfirmacaoInscricaoScreen = ({ route, navigation }) => {
  const { jogo } = route.params; // Pegando os dados do jogo da navegação anterior

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inscrição Confirmada!</Text>
      <Text style={styles.message}>Você está inscrito no jogo de {jogo.modalidade}.</Text>
      <Text>Data: {jogo.data} - Hora: {jogo.hora}</Text>
      <Text>Preço: R${jogo.preco}</Text>

      <Button
        title="Voltar para a Home"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default ConfirmacaoInscricaoScreen;
