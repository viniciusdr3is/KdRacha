import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const carregarUsuarioLocal = async () => {
            try {
                const userData = await AsyncStorage.getItem('usuario');
                if (userData) {
                    setUsuario(JSON.parse(userData));
                }
            } catch (error) {
                console.error('Erro ao carregar usuário local:', error);
            }
            setCarregando(false);
        };

        carregarUsuarioLocal();

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await carregarDadosUsuario(user);
            }
        });

        return () => unsubscribe();
    }, []);

    const carregarDadosUsuario = async (user) => {
        try {
            const docRef = doc(db, 'usuarios', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = {
                    uid: user.uid,
                    email: user.email,
                    ...docSnap.data(),
                };
                setUsuario(userData);
                await AsyncStorage.setItem('usuario', JSON.stringify(userData));
            } else {
                setUsuario(null);
                await AsyncStorage.removeItem('usuario');
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
        await AsyncStorage.removeItem('usuario');
    };

    const registrar = async (email, senha, nome, endereco, tipo) => {
        const cred = await createUserWithEmailAndPassword(auth, email, senha);
        const user = cred.user;

        await setDoc(doc(db, 'usuarios', user.uid), {
            nome,
            endereco,
            tipo,
            email: user.email,
            criadoEm: new Date(),
        });

        await carregarDadosUsuario(user);
        return user;
    };

    return (
        <AuthContext.Provider value={{ usuario, carregando, login, logout, registrar }}>
            {children}
        </AuthContext.Provider>
    );
};
