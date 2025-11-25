import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';
import JogosScreen from '../screens/commom/JogosScreen';
import PagamentoScreen from '../screens/commom/PagamentoScreen'; 
import ChatScreen from '../screens/commom/ChatScreen';
import AvaliacaoScreen from '../screens/commom/AvaliacaoScreen';

const Stack = createStackNavigator();

export default function JogosNavigation() {
    return (
        <Stack.Navigator 
            initialRouteName="Jogos"
            screenOptions={{
                headerStyle: { backgroundColor: '#1C1C1E' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen name="Jogos" component={JogosScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="JogosDetalhes" component={JogosDetalhesScreen} options={{ title: 'Detalhes' }} />
            <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat do Jogo' }} />
            <Stack.Screen name="Pagamento" component={PagamentoScreen} options={{ title: 'Confirmar Pagamento' }} />
            <Stack.Screen name="Avaliacao" component={AvaliacaoScreen} options={{ title: 'Avaliar Jogo' }} />
        </Stack.Navigator>
    );
}