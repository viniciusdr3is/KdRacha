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
import { cadastrarJogo } from '../../firebase/config';
import { useNavigation } from '@react-navigation/native';

const CadastrarJogoScreen = () => {
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');
  const [telefone, setTelefone] = useState('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [vagas, setVagas] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagem, setImagem] = useState('');
  
  const navigation = useNavigation();

  const handleCadastrar = async () => {
    if (!nome || !local || !data || !horario || !vagas || !valor || !tipo) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novoJogo = {
      nome,
      local,
      telefone,
      data,
      horario,
      vagas: parseInt(vagas, 10), 
      valor: valor.replace(',', '.'),
      tipo,
      jogadores: 0, 
      imagem,
    };

    try {
      await cadastrarJogo(novoJogo);
      Alert.alert('Sucesso', 'Jogo cadastrado com sucesso!');
      navigation.goBack(); 

    } catch (error) {
      console.error('Erro ao cadastrar jogo:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o jogo.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      <Text style={styles.titulo}>Cadastrar Novo Jogo</Text>

      <TextInput style={styles.input} placeholder="Nome do Jogo (ex: Racha da Noite)" placeholderTextColor="#888" value={nome} onChangeText={setNome} />
      <TextInput style={styles.input} placeholder="Local" placeholderTextColor="#888" value={local} onChangeText={setLocal} />
      <TextInput style={styles.input} placeholder="Telefone de Contato" placeholderTextColor="#888" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Data (DD/MM/AAAA)" placeholderTextColor="#888" value={data} onChangeText={setData} />
      <TextInput style={styles.input} placeholder="Horário (HH:MM)" placeholderTextColor="#888" value={horario} onChangeText={setHorario} />
      <TextInput style={styles.input} placeholder="Total de Vagas" placeholderTextColor="#888" value={vagas} onChangeText={setVagas} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Valor por Jogador (ex: 10,00)" placeholderTextColor="#888" value={valor} onChangeText={setValor} keyboardType="decimal-pad" />
      <TextInput style={styles.input} placeholder="Tipo (ex: Society, Futsal, Campo)" placeholderTextColor="#888" value={tipo} onChangeText={setTipo} />
      <TextInput style={styles.input} placeholder="URL da Imagem (opcional)" placeholderTextColor="#888" value={imagem} onChangeText={setImagem} />

      <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
        <Text style={styles.botaoTexto}>Cadastrar Jogo</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginBottom: 15,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CadastrarJogoScreen;

