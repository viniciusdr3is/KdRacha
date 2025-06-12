import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CadastrarJogoScreen from '../screens/dono/CadastrarJogoScreen';
import JogosScreen from '../screens/commom/JogosScreen';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';

const Stack = createStackNavigator();

export default function DonoCadastroNavigation() {
    return (
        <Stack.Navigator initialRouteName="JogosDono">
            <Stack.Screen
                name="JogosDono"
                component={JogosScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="JogosDetalhes"
                component={JogosDetalhesScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CadastrarJogo"
                component={CadastrarJogoScreen}
                options={{ headerShown: false }}
            />

        </Stack.Navigator>
    );
}