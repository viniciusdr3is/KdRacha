import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const HomeScreen = () => {
  const { usuario } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem-vindo, dono de quadra! 👋</Text>
      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4042/4042356.png' }}
        style={styles.imagem}
      />
      <Text style={styles.subtitulo}>
        Gerencie seus jogos, acompanhe inscrições e tenha controle total da sua quadra.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagem: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});

export default HomeScreen;
