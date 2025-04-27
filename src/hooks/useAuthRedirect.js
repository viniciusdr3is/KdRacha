import { useNavigation } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useCallback } from 'react';

export function useAuthRedirect() {
    const navigation = useNavigation();

    const redirectUser = useCallback(async () => {
        try {
            const user = auth.currentUser;

            if (!user) {
                console.warn('Nenhum usuário autenticado.');
                return;
            }

            const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
            const userData = userDoc.data();

            if (!userData || !userData.tipo) {
                console.warn('Usuário sem tipo definido.');
                return;
            }

            let rota = 'Jogador';
            if (userData.tipo === 'dono-quadra') {
                rota = 'Dono';
            }

            navigation.reset({
                index: 0,
                routes: [{ name: rota }],
            });
        } catch (error) {
            console.error('Erro ao redirecionar usuário:', error);
        }
    }, [navigation]);

    return { redirectUser };
}
