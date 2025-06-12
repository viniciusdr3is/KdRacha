import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { cadastrarJogo } from '../../firebase/config'; // Função personalizada de cadastro

const CadastrarJogoScreen = () => {
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [vagas, setVagas] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('');
  const [jogadores, setJogadores] = useState('');
  const [imagem, setImagem] = useState('');

  const handleCadastrar = async () => {
    if (!nome || !local || !telefone || !data || !horario || !vagas || !valor || !tipo || !jogadores) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    const novoJogo = {
      nome,
      local,
      telefone,
      data,         // como string, ex: "08/06/2025"
      horario,      // como string, ex: "14:30"
      vagas,        // string, mesmo que numérica
      valor,        // string, ex: "30.00"
      tipo,         // ex: "Futebol Society"
      jogadores,    // string, ex: "10"
      imagem,       // pode ser vazia ou URL
    };

    try {
      const id = await cadastrarJogo(novoJogo);
      Alert.alert('Sucesso', `Jogo cadastrado com sucesso!\nID: ${id}`);

      // Resetar campos
      setNome('');
      setLocal('');
      setTelefone('');
      setData('');
      setHorario('');
      setVagas('');
      setValor('');
      setTipo('');
      setJogadores('');
      setImagem('');
    } catch (error) {
      console.error('Erro ao cadastrar jogo:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o jogo.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Cadastrar Novo Jogo</Text>

      <TextInput style={styles.input} placeholder="Nome do Jogo (ex: Nome Quadra)" placeholderTextColor="#777" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Local" placeholderTextColor="#777" value={local} onChangeText={setLocal} />
      <TextInput style={styles.input} placeholder="Telefone" placeholderTextColor="#777" value={telefone} onChangeText={setTelefone} />
      <TextInput style={styles.input} placeholder="Data (DD/MM/AAAA)" placeholderTextColor="#777" value={data} onChangeText={setData} />
      <TextInput style={styles.input} placeholder="Horário (HH:MM)" placeholderTextColor="#777" value={horario} onChangeText={setHorario} />
      <TextInput style={styles.input} placeholder="Quantidade de Vagas" placeholderTextColor="#777" value={vagas} onChangeText={setVagas} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Valor (R$)" placeholderTextColor="#777" value={valor} onChangeText={setValor} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Tipo (ex: Society)" placeholderTextColor="#777" value={tipo} onChangeText={setTipo} />
      <TextInput style={styles.input} placeholder="Número de Jogadores" placeholderTextColor="#777" value={jogadores} onChangeText={setJogadores} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Imagem (URL opcional)" placeholderTextColor="#777" value={imagem} onChangeText={setImagem} />

      <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
        <Text style={styles.botaoTexto}>Cadastrar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  titulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#111',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#333',
    borderWidth: 1,
    marginBottom: 15,
  },
  botao: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CadastrarJogoScreen;
