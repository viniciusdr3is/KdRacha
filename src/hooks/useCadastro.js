import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuthRedirect } from './useAuthRedirect';
import { Alert } from 'react-native';
import axios from 'axios';

export function useCadastro() {
    const [carregando, setCarregando] = useState(false);
    const { redirectUser } = useAuthRedirect();

    const cadastrar = async ({ email, senha, confirmarSenha, tipoUsuario, endereco }) => {
        if (!email || !senha || !confirmarSenha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        try {
            setCarregando(true);

            const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
            const { uid } = userCredential.user;

            await setDoc(doc(db, 'usuarios', uid), {
                email,
                tipo: tipoUsuario,
                criadoEm: new Date(),
                endereco: endereco || null, // Armazena o endereço, se fornecido
            });

            // Login automático após cadastro
            await signInWithEmailAndPassword(auth, email, senha);

            Alert.alert('Sucesso', 'Cadastro realizado! Você foi logado automaticamente.');

            await redirectUser();
        } catch (error) {
            console.error('Erro no cadastro:', error);
            let mensagemErro = 'Erro ao realizar cadastro. Tente novamente.';
            if (error.code === 'auth/email-already-in-use') {
                mensagemErro = 'Este email já está em uso.';
            } else if (error.code === 'auth/invalid-email') {
                mensagemErro = 'Email inválido.';
            } else if (error.code === 'auth/weak-password') {
                mensagemErro = 'A senha deve ter pelo menos 6 caracteres.';
            }
            Alert.alert('Erro de cadastro', mensagemErro);
        } finally {
            setCarregando(false);
        }
    };

    // Função para buscar o endereço via CEP
    const buscarEnderecoPorCep = async (cep) => {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            return null;
        }
    };

    return { cadastrar, carregando, buscarEnderecoPorCep };
}
