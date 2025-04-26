import React from 'react';
import { View, Text, Image,Button, StyleSheet } from 'react-native';
import { getAuth, signOut } from 'firebase/auth'; // Importando a função de autenticação

const PerfilScreen = ({ navigation }) => {
  const auth = getAuth();
  const usuario = auth.currentUser;

const nome = usuario?.displayName || 'Sem nome';
const email = usuario?.email || 'Sem email';
const foto = usuario?.photoURL || 'Sem foto';

const handleLogout = async () => {
    try {
      await signOut(auth); // Fazendo logout do usuário
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // Redireciona para a tela de login
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente mais tarde.');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meu Perfil</Text>

      {/* Exibindo Foto de Perfil */}
      <View style={styles.fotoContainer}>
       <Image source={{ uri: foto }} style={styles.foto} />
      </View>

      <Text style={styles.label}>Nome:</Text>
      <Text style={styles.valor}>{nome}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.valor}>{email}</Text>

      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
  },
  valor: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  foto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#1e90ff',
  },
});

export default PerfilScreen;
