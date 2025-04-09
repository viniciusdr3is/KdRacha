import React, { useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';

const JogosScreen = ({ navigation }) => {
  // Simulação de uma lista de jogos
  const jogos = [
    {
      id: '1',
      modalidade: 'Futebol',
      horario: '18:00',
      preco: 30,
      participantes: 5,
      maxParticipantes: 10,
    },
    {
      id: '2',
      modalidade: 'Basquete',
      horario: '20:00',
      preco: 20,
      participantes: 3,
      maxParticipantes: 8,
    },
    {
      id: '3',
      modalidade: 'Vôlei',
      horario: '16:00',
      preco: 25,
      participantes: 2,
      maxParticipantes: 6,
    },
  ];

  const [inscritos, setInscritos] = useState([]);

  const handleInscricao = (jogo) => {
    if (jogo.participantes >= jogo.maxParticipantes) {
      Alert.alert('Erro', 'Este jogo já atingiu o número máximo de participantes.');
      return;
    }

    setInscritos((prev) => [...prev, jogo]);
    Alert.alert('Inscrição realizada', `Você se inscreveu no jogo de ${jogo.modalidade} às ${jogo.horario}.`);
  };

  const renderItem = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ddd' }}>
      <Text>Modalidade: {item.modalidade}</Text>
      <Text>Horário: {item.horario}</Text>
      <Text>Preço por jogador: R$ {item.preco}</Text>
      <Text>Participantes: {item.participantes}/{item.maxParticipantes}</Text>
      <Button
        title={`Inscrever-se no jogo de ${item.modalidade}`}
        onPress={() => handleInscricao(item)}
        disabled={item.participantes >= item.maxParticipantes}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>Jogos Disponíveis</Text>

      <FlatList
        data={jogos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
      
    </View>
  );
};

export default JogosScreen;
