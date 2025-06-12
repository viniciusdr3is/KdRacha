import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { useAuthRedirect } from '../../hooks/useAuthRedirect';
import { useNavigation } from '@react-navigation/native';
import Logo from '../../../assets/logo.png'; // Importe a logo se necessário

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const { login, carregando } = useContext(AuthContext);
  const { redirectUser } = useAuthRedirect();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha ambos os campos.');
      return;
    }

    try {
      setLoadingLogin(true);
      await login(email, senha);
      await redirectUser();
    } catch (error) {
      console.warn('Erro ao fazer login:', error);
      Alert.alert('Erro de login', 'Email ou senha inválidos.');
    } finally {
      setLoadingLogin(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Verificando login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.titulo}>Bem-vindo</Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      {loadingLogin ? (
        <ActivityIndicator size="small" color="#1e90ff" />
      ) : (
        <TouchableOpacity style={styles.botao} onPress={handleLogin}>
          <Text style={styles.botaoTexto}>Entrar</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.registroTexto}>
        Não tem uma conta?{' '}
        <Text style={styles.registroLink} onPress={() => navigation.navigate('Cadastro')}>
          Cadastre-se aqui
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
  width: 150,
  height: 150,
  marginBottom: 20,
  resizeMode: 'contain',
},
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  titulo: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    marginBottom: 15,
    color: '#fff',
  },
  botao: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registroTexto: {
    marginTop: 20,
    color: '#ccc',
  },
  registroLink: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
