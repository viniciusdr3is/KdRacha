import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JogosScreen from '../screens/commom/JogosScreen';
import JogosDetalhesScreen from '../screens/commom/JogosDetalhesScreen';
import JogosNavigation from './JogosNavigation';


const Tab = createBottomTabNavigator();

export default function JogadorNavigation() {
    return (
        
            <Tab.Navigator initialRouteName={'JogosNav'}>
                <Tab.Screen name="JogosNav" component={JogosNavigation} options={{ headerShown: false }} />
            </Tab.Navigator>
      
    );
}