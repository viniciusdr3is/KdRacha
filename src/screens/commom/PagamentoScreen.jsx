import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { inscreverEmJogo } from '../../firebase/config';

const PagamentoScreen = ({ route }) => {
  const { jogoId } = route.params;
  const navigation = useNavigation();
  const [metodo, setMetodo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirmarPagamento = async () => {
    if (!metodo) {
      Alert.alert("Atenção", "Por favor, selecione uma forma de pagamento.");
      return;
    }

    setLoading(true);
    try {
      await inscreverEmJogo(jogoId, metodo);
      
      Alert.alert('Inscrição realizada!', 'A sua inscrição foi confirmada com sucesso.');
      navigation.goBack(); 

    } catch (e) {
      Alert.alert('Erro na inscrição', e.message);
    } finally {
      setLoading(false);
    }
  };

  const ModernButton = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#28a745" />
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.modernButtonContainer}
        onPress={handleConfirmarPagamento}
        activeOpacity={0.8}
      >
        <View style={styles.modernButtonBackground}>
          <Text style={styles.modernButtonText}>✨ Concluir Inscrição</Text>
          <View style={styles.shine} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Escolha a Forma de Pagamento</Text>

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
        <ModernButton />
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
    marginBottom: 40,
  },
  botaoMetodo: {
    width: '80%',
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
    width: '80%'
  },
  // Estilos do botão moderno
  modernButtonContainer: {
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#28a745',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernButtonBackground: {
    backgroundColor: '#28a745',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#20c997',
  },
  modernButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shine: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    transform: [{ rotate: '45deg' }],
  },
  loadingContainer: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PagamentoScreen;