import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config'; 

const PerfilScreen = ({ navigation }) => {
  const auth = getAuth();
  const usuarioAuth = auth.currentUser;

  // Estados para guardar os dados do utilizador e controlar o carregamento
  const [dadosUsuario, setDadosUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect para buscar os dados do Firestore quando o ecrã carregar
  useEffect(() => {
    const buscarDadosDoUsuario = async () => {
      if (usuarioAuth) {
        try {
          const userDocRef = doc(db, 'usuarios', usuarioAuth.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            setDadosUsuario(userDocSnap.data()); // Guarda os dados do utilizador
          } else {
            console.warn("Documento do utilizador não encontrado no Firestore.");
          }
        } catch (error) {
          console.error("Erro ao buscar dados do utilizador:", error);
        } finally {
          setLoading(false); // Para o carregamento
        }
      } else {
        setLoading(false);
      }
    };

    buscarDadosDoUsuario();
  }, [usuarioAuth]); 

  const email = usuarioAuth?.email || 'Email não disponível';
  const fotoUrl = usuarioAuth?.photoURL;
  const tipo = dadosUsuario?.tipo || 'Carregando...'; 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      alert('Erro ao fazer logout. Tente novamente mais tarde.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#fff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileInfoContainer}>
        <Text style={styles.title}>Meu Perfil</Text>

        <View style={styles.fotoContainer}>
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.foto} />
          ) : (
            <View style={styles.fotoPlaceholder} />
          )}
        </View>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.valor}>{email}</Text>

        {/* NOVA LINHA PARA O TIPO DE UTILIZADOR */}
        <Text style={styles.label}>Tipo de Conta</Text>
        <Text style={styles.valorTipo}>
          {tipo === 'dono-quadra' ? 'Dono de Quadra' : 'Jogador'}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Sair da Conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'space-between',
  },
  profileInfoContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 20,
  },
  valor: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 10,
  },
  valorTipo: { 
    color: '#1e90ff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  fotoContainer: {
    marginBottom: 20,
  },
  foto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1e90ff',
  },
  fotoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e90ff',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerfilScreen;

