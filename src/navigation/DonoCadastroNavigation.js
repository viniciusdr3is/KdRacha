import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CadastrarJogoScreen from '../screens/dono/CadastrarJogoScreen';
import JogosScreen from '../screens/commom/JogosScreen';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';
import RelatorioJogoScreen from '../screens/dono/RelatorioJogoScreen';
import ChatScreen from '../screens/commom/ChatScreen'; // Importar o Chat

const Stack = createStackNavigator();

export default function DonoCadastroNavigation() {
    return (
        <Stack.Navigator 
            initialRouteName="JogosDono"
            screenOptions={{
                headerStyle: { backgroundColor: '#1C1C1E' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
                headerBackTitleVisible: false, // Oculta o texto "Voltar" no iOS para um visual mais limpo
            }}
        >
            {/* Ecrã Principal: Lista de Jogos do Dono */}
            <Stack.Screen
                name="JogosDono"
                component={JogosScreen}
                options={{ headerShown: false }} 
            />

            {/* Ecrã de Detalhes */}
            <Stack.Screen
                name="JogosDetalhes"
                component={JogosDetalhesScreen}
                options={{ title: 'Detalhes do Jogo' }}
            />

            {/* Ecrã de Cadastro */}
            <Stack.Screen
                name="CadastrarJogo"
                component={CadastrarJogoScreen}
                options={{ title: 'Cadastrar Novo Jogo' }}
            />

            {/* Ecrã de Relatório (Exclusivo do Dono) */}
            <Stack.Screen
                name="RelatorioJogo"
                component={RelatorioJogoScreen}
                options={{ title: 'Relatório do Jogo' }}
            />

            {/* Ecrã de Chat */}
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: 'Chat do Jogo' }}
            />
        </Stack.Navigator>
    );
}