import React, { useState } from 'react';
import { TextInput, Button, Alert, View, Text } from 'react-native';
import { auth } from '../firebase/config';  // Importando o auth do Firebase
import { signInWithEmailAndPassword } from 'firebase/auth';  // Função para login do Firebase

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Por favor, preencha ambos os campos.');
      return;
    }

    try {
      // Tentando logar com o Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      
      console.log('Usuário logado com sucesso:', userCredential);

      // Redireciona para a tela de Jogos se o login for bem-sucedido
      navigation.replace('Jogos');  // Redireciona para a tela de Lista de Jogos

    } catch (error) {
      // Caso haja erro, exibe uma mensagem
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro de login', error.message);
    }
  };

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
      <Button title="Entrar" onPress={handleLogin} />

      {/* Adicionando o botão para redirecionar para a tela de Cadastro */}
      <Text style={{ marginTop: 20 }}>
        Não tem uma conta?{' '}
        <Text
          style={{ color: 'blue' }}
          onPress={() => navigation.navigate('Cadastro')}  // Navega para a tela de Cadastro
        >
          Cadastre-se aqui
        </Text>
      </Text>
    </View>
  );
};

export default LoginScreen;
