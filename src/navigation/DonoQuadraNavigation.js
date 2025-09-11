import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/dono/HomeScreen';
import PerfilScreen from '../screens/auth/PerfilScreen';
import DonoCadastroNavigation from './DonoCadastroNavigation';
import DonoHistoricoNavigation from './DonoHistoricoNavigation'; // Importar o novo navegador

const Tab = createBottomTabNavigator();

export default function DonoQuadraNavigation() {
    return (
        <Tab.Navigator initialRouteName={'Home'}>
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            
            <Tab.Screen 
                name="Jogos"
                component={DonoCadastroNavigation} 
                options={{ 
                    headerShown: false,
                    title: 'Meus Jogos' // Texto que aparece na aba para o utilizador
                }} 
            />

            {/* A NOVA ABA DE HISTÓRICO */}
            <Tab.Screen 
                name="Historico"
                component={DonoHistoricoNavigation}
                options={{
                    headerShown: false,
                    title: 'Histórico'
                }}
            />

            <Tab.Screen name="Perfil" component={PerfilScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}

