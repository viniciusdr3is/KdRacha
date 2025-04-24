import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// rotas
import CadastroScreen from './src/screens/auth/CadastroScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import JogadorNavigation from './src/navigation/JogadorNavigation';
import DonoQuadraNavigation from './src/navigation/DonoQuadraNavigation';

const Stack = createStackNavigator();

const AppRoutes = () => {
  const { usuario, carregando } = useContext(AuthContext);

  if (carregando) {
    return null;
  }

  const rotaInicial = usuario
    ? usuario.tipo === 'dono-quadra'
      ? 'Dono'
      : 'Jogador'
    : 'Login';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={rotaInicial}>
        <Stack.Screen name="Dono" component={DonoQuadraNavigation} />
        <Stack.Screen name="Jogador" component={JogadorNavigation} options={{ headerShown: false }}  />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
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
