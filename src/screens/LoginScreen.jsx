import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);

  const { login, carregando, usuario } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha ambos os campos.');
      return;
    }

    try {
      setLoadingLogin(true);
      const user = await login(email, senha);

      if (user) {
        if (user.tipo === 'dono-quadra') {
          navigation.replace('GestaoJogos');
        } else {
          navigation.replace('Jogos');
        }
      }
    } catch (error) {
      console.warn('Erro ao fazer login:', error);
      Alert.alert('Erro de login', error.message);
    } finally {
      setLoadingLogin(false);
    }
  };

  // Mostra um loading enquanto o contexto está carregando o estado inicial
  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Verificando login...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <TextInput
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 8,
          width: '100%',
          borderColor: '#ddd',
          borderRadius: 5,
        }}
      />
      <TextInput
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{
          borderWidth: 1,
          marginBottom: 20,
          padding: 8,
          width: '100%',
          borderColor: '#ddd',
          borderRadius: 5,
        }}
      />

      {loadingLogin ? (
        <ActivityIndicator size="small" color="#0000ff" />
      ) : (
        <Button title="Entrar" onPress={handleLogin} />
      )}

      <Text style={{ marginTop: 20 }}>
        Não tem uma conta?{' '}
        <Text style={{ color: 'blue' }} onPress={() => navigation.navigate('Cadastro')}>
          Cadastre-se aqui
        </Text>
      </Text>
    </View>
  );
};

export default LoginScreen;
