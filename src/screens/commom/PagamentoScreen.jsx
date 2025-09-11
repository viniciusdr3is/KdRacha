import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { inscreverEmJogo } from '../../firebase/config';

const PagamentoScreen = ({ route }) => {
  const { jogoId, valor } = route.params; // Recebemos o ID e o valor
  const navigation = useNavigation();
  const [metodo, setMetodo] = useState(null); // Estado para guardar o método selecionado
  const [loading, setLoading] = useState(false);

  const handleConfirmarPagamento = async () => {
    // 1. Verifica se um método foi selecionado
    if (!metodo) {
      Alert.alert("Atenção", "Por favor, selecione uma forma de pagamento.");
      return;
    }

    setLoading(true);
    try {
      // 2. Chama a função de inscrição, passando o ID do jogo e o método
      await inscreverEmJogo(jogoId, metodo);
      
      Alert.alert('Inscrição realizada!', 'A sua inscrição foi confirmada com sucesso.');
      navigation.goBack(); 

    } catch (e) {
      Alert.alert('Erro na inscrição', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Escolha a Forma de Pagamento</Text>
      <Text style={styles.valorTexto}>Valor a pagar: R$ {valor}</Text>

      {/* Opções de Pagamento */}
      <TouchableOpacity 
        style={[styles.botaoMetodo, metodo === 'pix' && styles.selecionado]} 
        onPress={() => setMetodo('pix')}
      >
        <Text style={styles.textoBotao}>PIX</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.botaoMetodo, metodo === 'cartao' && styles.selecionado]} 
        onPress={() => setMetodo('cartao')}
      >
        <Text style={styles.textoBotao}>Cartão de Crédito</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.botaoMetodo, metodo === 'dinheiro' && styles.selecionado]} 
        onPress={() => setMetodo('dinheiro')}
      >
        <Text style={styles.textoBotao}>Dinheiro</Text>
      </TouchableOpacity>

      <View style={styles.botaoContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Button
            title="Concluir Inscrição"
            onPress={handleConfirmarPagamento}
            color="#28a745"
          />
        )}
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
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  valorTexto: {
    fontSize: 18,
    color: '#ddd',
    marginBottom: 40,
  },
  botaoMetodo: {
    width: '90%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e90ff',
    alignItems: 'center',
    marginBottom: 15,
  },
  selecionado: {
    backgroundColor: '#1e90ff',
    borderColor: '#fff',
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoContainer: {
    marginTop: 40,
    width: '90%'
  }
});

export default PagamentoScreen;

