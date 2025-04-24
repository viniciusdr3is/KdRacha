import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bem-vindo ao aplicativo de agendamento de jogos!</Text>
      
      {/* Botão para Navegar para a Tela de Login */}
      <Button 
        title="Login" 
        onPress={() => navigation.navigate('Login')} 
      />
      
      {/* Botão para Navegar para a Tela de Cadastro */}
      <Button 
        title="Cadastrar" 
        onPress={() => navigation.navigate('Cadastro')} 
      />
    </View>
  );
};

export default HomeScreen;
