import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { inscreverEmJogo, buscarInscricoesDoUsuario } from '../../firebase/config';
import { AuthContext } from '../../context/AuthContext';

const JogoDetalhesScreen = ({ route }) => {
  const { jogo } = route.params;
  const { usuario } = useContext(AuthContext);
  const [inscrito, setInscrito] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const verificarInscricao = async () => {
      const ids = await buscarInscricoesDoUsuario();
      setInscrito(ids.includes(jogo.id));
    };
    verificarInscricao();
  }, []);

  const handleInscricao = async () => {
    try {
      if (!inscrito) {
        await inscreverEmJogo(jogo.id);
        setInscrito(true);
        Alert.alert('Inscrição realizada!', 'Você se inscreveu com sucesso.');
      } else {
        Alert.alert('Você já está inscrito neste jogo.');
      }
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  };

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
          title={inscrito ? "Inscrito" : "Inscrever-se"}
          onPress={handleInscricao}
          color="#1e90ff"
          disabled={inscrito}
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
