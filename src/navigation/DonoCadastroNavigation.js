import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CadastrarJogoScreen from '../screens/dono/CadastrarJogoScreen';
import JogosScreen from '../screens/commom/JogosScreen';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';
import RelatorioJogoScreen from '../screens/dono/RelatorioJogoScreen';

const Stack = createStackNavigator();

export default function DonoCadastroNavigation() {
    return (
        <Stack.Navigator 
            initialRouteName="JogosDono"
            screenOptions={{
                headerStyle: { backgroundColor: '#1C1C1E' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Stack.Screen
                name="JogosDono"
                component={JogosScreen}
                options={{ headerShown: false }} 
            />
            <Stack.Screen
                name="JogosDetalhes"
                component={JogosDetalhesScreen}
                options={{ title: 'Detalhes do Jogo' }}
            />
            <Stack.Screen
                name="CadastrarJogo"
                component={CadastrarJogoScreen}
                options={{ title: 'Cadastrar Novo Jogo' }}
            />
            <Stack.Screen
                name="RelatorioJogo"
                component={RelatorioJogoScreen}
                options={{ title: 'Relatório do Jogo' }}
            />
        </Stack.Navigator>
    );
}

