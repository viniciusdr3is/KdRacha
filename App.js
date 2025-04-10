import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthProvider, AuthContext } from './src/context/AuthContext';

import HomeScreen from './src/screens/HomeScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import LoginScreen from './src/screens/LoginScreen';
import JogosScreen from './src/screens/JogosScreen';
// import GestaoJogosScreen from './src/screens/GestaoJogosScreen'; // descomente se necessário

const Stack = createStackNavigator();

const AppRoutes = () => {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return null;
  }

  const rotaInicial = usuario
    ? usuario.tipo === 'dono-quadra'
      ? 'Home'
      : 'Jogos'
    : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={rotaInicial}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Jogos" component={JogosScreen} />
        {/* <Stack.Screen name="GestaoJogos" component={GestaoJogosScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
