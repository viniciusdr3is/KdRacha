import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HistoricoDonoScreen from '../screens/dono/HistoricoDonoScreen';
import RelatorioJogoScreen from '../screens/dono/RelatorioJogoScreen';

const Stack = createStackNavigator();

export default function DonoHistoricoNavigation() {
    return (
        <Stack.Navigator
            initialRouteName="HistoricoLista"
            screenOptions={{
                headerStyle: { backgroundColor: '#1C1C1E' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="HistoricoLista"
                component={HistoricoDonoScreen}
                options={{ headerShown: false }} 
            />
            <Stack.Screen
                name="RelatorioJogo"
                component={RelatorioJogoScreen}
                options={{ title: 'Relatório do Jogo' }}
            />
        </Stack.Navigator>
    );
}
