import React from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const JogoDetalhesScreen = ({ route }) => {
  const navigation = useNavigation(); // <- isso estava faltando!
  const { jogo, inscrito } = route.params;

  return (
    <View style={styles.container}>
      <Image source={{ uri: jogo.imagem }} style={styles.imagem} />
      <Text style={styles.titulo}>{jogo.local}</Text>
      <Text style={styles.texto}>Tipo: {jogo.tipo}</Text>
      <Text style={styles.texto}>Horário: {jogo.horario}</Text>
      <Text style={styles.texto}>Jogadores: {jogo.jogadores}</Text>
      <Text style={[styles.status, { color: inscrito ? 'green' : 'red' }]}>
        {inscrito ? 'Você está inscrito neste jogo!' : 'Você ainda não se inscreveu.'}
      </Text>

      <View style={{ marginTop: 30 }}>
        <Button 
          title="Inscrever-se"
          onPress={() => navigation.navigate('Inscricao', { jogo })} 
          color="#1e90ff"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    alignItems: 'center',
  },
  imagem: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  texto: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
});

export default JogoDetalhesScreen;
