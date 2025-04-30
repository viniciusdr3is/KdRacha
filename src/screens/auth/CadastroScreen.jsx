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
import { useCadastro } from '../../hooks/useCadastro';

const CadastroScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('jogador');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState({});
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const { cadastrar, carregando, buscarEnderecoPorCep } = useCadastro();

  const handleCadastro = async () => {
    const enderecoCompleto = cep ? { ...endereco, numero, complemento } : null;
    await cadastrar({
      email,
      senha,
      confirmarSenha,
      tipoUsuario,
      endereco: enderecoCompleto,
    });
  };

  const handleCepBlur = async () => {
    if (cep.length === 8) {
      const enderecoEncontrado = await buscarEnderecoPorCep(cep);
      if (enderecoEncontrado && !enderecoEncontrado.erro) {
        setEndereco({
          rua: enderecoEncontrado.logradouro,
          bairro: enderecoEncontrado.bairro,
          cidade: enderecoEncontrado.localidade,
          estado: enderecoEncontrado.uf,
        });
      } else {
        Alert.alert('Erro', 'CEP não encontrado.');
      }
    } else {
      Alert.alert('Erro', 'CEP inválido.');
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

      <TextInput
        placeholder="CEP"
        placeholderTextColor="#888"
        value={cep}
        onChangeText={setCep}
        onBlur={handleCepBlur}
        style={styles.input}
        keyboardType="numeric"
      />
      {endereco.rua && (
        <>
          <TextInput
            placeholder="Rua"
            value={endereco.rua}
            style={styles.input}
            editable={false}
          />
          <TextInput
            placeholder="Bairro"
            value={endereco.bairro}
            style={styles.input}
            editable={false}
          />
          <TextInput
            placeholder="Cidade"
            value={endereco.cidade}
            style={styles.input}
            editable={false}
          />
          <TextInput
            placeholder="Estado"
            value={endereco.estado}
            style={styles.input}
            editable={false}
          />
        </>
      )}

      <TextInput
        placeholder="Número"
        placeholderTextColor="#888"
        value={numero}
        onChangeText={setNumero}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Complemento"
        placeholderTextColor="#888"
        value={complemento}
        onChangeText={setComplemento}
        style={styles.input}
      />

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
