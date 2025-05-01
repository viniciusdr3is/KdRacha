import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/dono/HomeScreen';
import PerfilScreen from '../screens/auth/PerfilScreen';
import InscricoesScreen from '../screens/commom/InscricoesScreen';


const Tab = createBottomTabNavigator();

export default function DonoQuadraNavigation() {
    return (
        
            <Tab.Navigator initialRouteName={'Home'}>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
                <Tab.Screen name="Inscricao" component={InscricoesScreen} options={{ headerShown: false }} />
            </Tab.Navigator>
      
    );
}