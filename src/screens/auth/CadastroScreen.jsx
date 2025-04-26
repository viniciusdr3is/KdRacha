import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const CadastroScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('jogador');
  const [carregando, setCarregando] = useState(false);

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
      setCarregando(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const { uid } = userCredential.user;

      await setDoc(doc(db, 'usuarios', uid), {
        email,
        tipo: tipoUsuario,
        criadoEm: new Date(),
      });

      Alert.alert('Cadastro realizado com sucesso!', 'Agora você pode fazer login.');
      navigation.navigate('Login');
    } catch (error) {
      let mensagemErro = 'Erro ao realizar cadastro. Tente novamente.';
      if (error.code === 'auth/email-already-in-use') {
        mensagemErro = 'Este email já está em uso.';
      } else if (error.code === 'auth/invalid-email') {
        mensagemErro = 'Email inválido.';
      } else if (error.code === 'auth/weak-password') {
        mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
      }
      Alert.alert('Erro de cadastro', mensagemErro);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirmar Senha"
        placeholderTextColor="#888"
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
        secureTextEntry
        style={styles.input}
      />

      <Text style={styles.subtitle}>Tipo de Usuário</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.userButton,
            tipoUsuario === 'jogador' && styles.selectedButton,
          ]}
          onPress={() => setTipoUsuario('jogador')}
        >
          <Text style={styles.buttonText}>Jogador</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.userButton,
            tipoUsuario === 'dono-quadra' && styles.selectedButton,
          ]}
          onPress={() => setTipoUsuario('dono-quadra')}
        >
          <Text style={styles.buttonText}>Dono de Quadra</Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="small" color="#1e90ff" />
      ) : (
        <TouchableOpacity style={styles.botao} onPress={handleCadastro}>
          <Text style={styles.botaoTexto}>Cadastrar</Text>
        </TouchableOpacity>
      )}

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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 10,
    alignSelf: 'flex-start',
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  userButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '48%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#1e90ff',
    borderColor: '#1e90ff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  botao: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginText: {
    marginTop: 20,
    color: '#ccc',
    fontSize: 14,
  },
  loginLink: {
    color: '#1e90ff',
    fontWeight: 'bold',
  },
});

export default CadastroScreen;
