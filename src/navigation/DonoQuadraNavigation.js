import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/dono/HomeScreen';
import PerfilScreen from '../screens/auth/PerfilScreen';
import DonoCadastroNavigation from './DonoCadastroNavigation';

const Tab = createBottomTabNavigator();

export default function DonoQuadraNavigation() {
    return (
        <Tab.Navigator initialRouteName={'Home'}>
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
            <Tab.Screen name="JogosDono" component={DonoCadastroNavigation} options={{ headerShown: false }} />

            </Tab.Navigator>

    );
}