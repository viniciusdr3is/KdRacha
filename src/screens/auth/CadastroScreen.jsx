import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { createUserWithEmailAndPassword, auth, db } from '../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

const CadastroScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('jogador');

  const handleCadastro = async () => {
    if (!email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const { uid } = userCredential.user;

      // Salvando dados adicionais no Firestore
      await setDoc(doc(db, 'usuarios', uid), {
        email,
        tipo: tipoUsuario,
        criadoEm: new Date()
      });

      Alert.alert('Cadastro realizado com sucesso!', 'Agora você pode fazer login.');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      let mensagemErro = 'Erro ao realizar cadastro. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      }
      Alert.alert('Erro de cadastro', mensagemErro);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastro</Text>

      <TextInput
        placeholder="Digite seu email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Digite sua senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirme sua senha"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.subtitle}>Selecione o tipo de usuário</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.userButton, tipoUsuario === 'jogador' && styles.selectedButton]}
          onPress={() => setTipoUsuario('jogador')}
        >
          <Text style={styles.buttonText}>Jogador</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.userButton, tipoUsuario === 'dono-quadra' && styles.selectedButton]}
          onPress={() => setTipoUsuario('dono-quadra')}
        >
          <Text style={styles.buttonText}>Dono de Quadra</Text>
        </TouchableOpacity>
      </View>

      <Button title="Cadastrar" onPress={handleCadastro} />

      <Text style={styles.loginText}>
        Já tem uma conta?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          Faça login aqui
        </Text>
      </Text>
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
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  userButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
  },
  loginText: {
    marginTop: 20,
    fontSize: 14,
  },
  loginLink: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});

export default CadastroScreen;
