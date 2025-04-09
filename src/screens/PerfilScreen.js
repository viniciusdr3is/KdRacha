// src/screens/PerfilScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const PerfilScreen = ({ navigation }) => {
  const [nome, setNome] = useState('João da Silva'); // Dados fictícios
  const [email, setEmail] = useState('joao@exemplo.com');
  const [foto, setFoto] = useState('https://example.com/foto.jpg'); // Simulação de foto

  const handleSalvarPerfil = () => {
    alert('Perfil salvo!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      {/* Exibindo Foto de Perfil */}
      <View style={styles.fotoContainer}>
        <Text>Foto de Perfil: </Text>
        <Text>{foto}</Text>
      </View>

      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Button title="Salvar" onPress={handleSalvarPerfil} />
      <Button title="Voltar para Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  fotoContainer: {
    marginBottom: 20,
  },
});

export default PerfilScreen;
