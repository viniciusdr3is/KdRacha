import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { StripeProvider } from '@stripe/stripe-react-native';

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
    <StripeProvider publishableKey="pk_test_51S5TkQF2TTQzZJeBKPcL4nP8pgLhMabtW3S9vuomhciSOp5is8dudDTeZMWwTSnVLuHytY0VLDZTiZHtFf49FT0k00aglVHVzo">
      <NavigationContainer>
        <Stack.Navigator initialRouteName={rotaInicial}>
          <Stack.Screen name="Dono" component={DonoQuadraNavigation} options={{ headerShown: false }} />
          <Stack.Screen name="Jogador" component={JogadorNavigation} options={{ headerShown: false }}  />
          <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
