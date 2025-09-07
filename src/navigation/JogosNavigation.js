import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';
import JogosScreen from '../screens/commom/JogosScreen';
import PagamentoScreen from '../screens/commom/PagamentoScreen'; 

const Stack = createStackNavigator();

export default function JogosNavigation() {
    return (
        <Stack.Navigator initialRouteName="Jogos">
            <Stack.Screen name="Jogos" component={JogosScreen} options={{ headerShown: false }}/>
            <Stack.Screen name="JogosDetalhes" component={JogosDetalhesScreen} />
            <Stack.Screen name="Pagamento" component={PagamentoScreen} />

        </Stack.Navigator>
    );
}
