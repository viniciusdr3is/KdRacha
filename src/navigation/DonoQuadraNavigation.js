import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/dono/HomeScreen';


const Tab = createBottomTabNavigator();

export default function DonoQuadraNavigation() {
    return (
        
            <Tab.Navigator initialRouteName={'Home'}>
                <Tab.Screen name="Home" component={HomeScreen} />
            </Tab.Navigator>
      
    );
}