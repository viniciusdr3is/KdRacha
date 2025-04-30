import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarUsuarioLocal = async () => {
            try {
                const usuarioLocal = await AsyncStorage.getItem('@usuario');
                if (usuarioLocal) {
                    setUsuario(JSON.parse(usuarioLocal));
                }
            } catch (error) {
                console.error('Erro ao carregar usuário do storage:', error);
            }
            setCarregando(false);
        };

        carregarUsuarioLocal();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await carregarDadosUsuario(user);
            } else {
                setUsuario(null);
                await AsyncStorage.removeItem('@usuario');
            }
        });

        return () => unsubscribe();
    }, []);

    const carregarDadosUsuario = async (user) => {
        try {
            const docRef = doc(db, 'usuarios', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const dadosUsuario = {
                    uid: user.uid,
                    email: user.email,
                    tipo: docSnap.data().tipo,
                    ...docSnap.data(),
                };
                setUsuario(dadosUsuario);
                await AsyncStorage.setItem('@usuario', JSON.stringify(dadosUsuario));
            } else {
                setUsuario(null);
                await AsyncStorage.removeItem('@usuario');
            }
        } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
        }
    };

    const login = async (email, senha) => {
        const cred = await signInWithEmailAndPassword(auth, email, senha);
        await carregarDadosUsuario(cred.user);
        return cred.user;
    };

    const logout = async () => {
        await signOut(auth);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ usuario, setUsuario, carregando, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
