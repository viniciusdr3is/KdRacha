import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JogosNavigation from './JogosNavigation';
import PerfilScreen from '../screens/auth/PerfilScreen';
import InscricoesScreen from '../screens/commom/InscricoesScreen';


const Tab = createBottomTabNavigator();

export default function JogadorNavigation() {
    return (
        
            <Tab.Navigator initialRouteName={'JogosNav'}>
                <Tab.Screen name="JogosNav" component={JogosNavigation} options={{ headerShown: false }} />
                <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
                <Tab.Screen name="Inscricao" component={InscricoesScreen} options={{ headerShown: false }} />
            </Tab.Navigator>
      
    );
}