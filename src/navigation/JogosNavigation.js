import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';
import JogosScreen from '../screens/commom/JogosScreen';

const Stack = createStackNavigator();

export default function JogosNavigation() {
    return (

            <Stack.Navigator initialRouteName="Jogos">
                <Stack.Screen name="Jogos" component={JogosScreen} />
                <Stack.Screen name="JogosDetalhes" component={JogosDetalhesScreen} />
            </Stack.Navigator>

    );
}