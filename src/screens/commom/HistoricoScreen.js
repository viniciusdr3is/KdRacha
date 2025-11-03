import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, TextInput, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  buscarInscricoesDoUsuario,
  db,
  salvarAvaliacaoCompat,
  buscarAvaliacaoDoJogoCompat,
  testarPermissoesFirebase,
} from '../../firebase/config.js';
import { doc, getDoc } from 'firebase/firestore';

const HistoricoScreen = () => {
  const [jogosPagos, setJogosPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avaliacoesMap, setAvaliacoesMap] = useState({});

  // modal
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalJogoId, setModalJogoId] = useState(null);
  const [modalCriadorId, setModalCriadorId] = useState(null);
  const [vrNota, setVrNota] = useState(5);
  const [dsComentario, setDsComentario] = useState('');

  useEffect(() => {
    testarPermissoesFirebase();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setLoading(true);

      const carregarHistorico = async () => {
        try {
          const inscricoes = await buscarInscricoesDoUsuario();

          const promessasJogos = inscricoes.map(async (inscricao) => {
            const docRef = doc(db, 'jogos', inscricao.jogoId);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return null;

            const data = docSnap.data();
            const base = {
              id: docSnap.id,
              criadorId: data.criadorId,
              inscricaoInfo: inscricao,
            };

            return data.jogoData
              ? { ...base, ...data.jogoData }
              : { ...base, ...data };
          });

          const jogos = (await Promise.all(promessasJogos)).filter(Boolean);

          const pares = await Promise.all(
            jogos.map(async (j) => {
              const a = await buscarAvaliacaoDoJogoCompat({ jogoId: j.id });
              return [j.id, a];
            })
          );

          if (isActive) {
            setJogosPagos(jogos);
            setAvaliacoesMap(Object.fromEntries(pares));
          }
        } catch (error) {
          console.error("Erro ao carregar histórico:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      carregarHistorico();
      return () => { isActive = false; };
    }, [])
  );

  const abrirModal = (jogoId, criadorId) => {
    setModalJogoId(jogoId);
    setModalCriadorId(criadorId);
    setVrNota(5);
    setDsComentario('');
    setModalVisivel(true);
  };

  const salvarAvaliacao = async () => {
    try {
      const nota = Math.max(1, Math.min(5, Number(vrNota || 0)));
      await salvarAvaliacaoCompat({
        jogoId: modalJogoId,
        avaliadoId: modalCriadorId,
        nota,
        comentario: dsComentario,
      });
      setAvaliacoesMap((prev) => ({
        ...prev,
        [modalJogoId]: { nota, comentario: dsComentario },
      }));
      setModalVisivel(false);
      Alert.alert('Obrigado!', 'Sua avaliação foi registrada.');
    } catch (e) {
      Alert.alert('Ops', e.message ?? 'Não foi possível salvar sua avaliação.');
    }
  };

  const renderEstrelas = (qtd = 0) => {
    const on = '★'.repeat(qtd);
    const off = '☆'.repeat(5 - qtd);
    return <Text style={{ color: '#ffd54f', fontSize: 16 }}>{on}{off}</Text>;
  };

  const StarInput = ({ value, onChange }) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= value;
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange(n)}
              activeOpacity={0.7}
              style={styles.starTouch}
            >
              <Text style={[styles.star, filled ? styles.starOn : styles.starOff]}>
                {filled ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.containerCentralizado}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const aval = avaliacoesMap[item.id];
    return (
      <View style={styles.card}>
        <View style={styles.info}>
          <Text style={styles.local}>{item.nome || item.local}</Text>
          <Text style={styles.data}>Data: {item.data} - {item.horario}</Text>
          <Text style={styles.metodo}>
            Pagamento via:{' '}
            <Text style={{ textTransform: 'capitalize' }}>{item.inscricaoInfo.metodo}</Text>
          </Text>

          {aval ? (
            <View style={{ marginTop: 12 }}>
              {renderEstrelas(Number(aval.nota || aval.vrNota || 0))}
              {!!(aval.comentario || aval.dsComentario) && (
                <Text style={{ color:'#bbb', marginTop: 4 }}>
                  {aval.comentario || aval.dsComentario}
                </Text>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.avaliarButton}
              onPress={() => abrirModal(item.id, item.criadorId)}
            >
              <Text style={styles.avaliarText}>Avaliar</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.valor}>R$ {item.valor}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Histórico de Inscrições</Text>
      <FlatList
        data={jogosPagos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.textoVazio}>Nenhum histórico de inscrição encontrado.</Text>}
      />

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalWrap}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Avaliar jogo</Text>

            <Text style={styles.modalLabel}>Nota</Text>
            <StarInput value={vrNota} onChange={setVrNota} />
            <Text style={styles.modalHint}>Sua nota: {vrNota}/5</Text>

            <Text style={styles.modalLabel}>Comentário (opcional)</Text>
            <TextInput
              value={dsComentario}
              onChangeText={setDsComentario}
              placeholder="Escreva um comentário..."
              placeholderTextColor="#666"
              style={[styles.input, { height: 100 }]}
              multiline
            />

            <View style={{ flexDirection:'row', gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={[styles.btnBase, { backgroundColor:'#333' }]} onPress={() => setModalVisivel(false)}>
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnBase, { backgroundColor:'#1e90ff' }]} onPress={salvarAvaliacao}>
                <Text style={styles.btnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 20 },
  containerCentralizado: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 20, marginTop: 30, textAlign: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#222', padding: 20, borderRadius: 10, marginBottom: 15, alignItems: 'center', justifyContent: 'space-between' },
  info: { flex: 1 },
  local: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  data: { fontSize: 14, color: '#bbb', marginTop: 5 },
  metodo: { fontSize: 14, color: '#bbb', marginTop: 5 },
  valor: { fontSize: 18, fontWeight: 'bold', color: '#28a745' },
  textoVazio: { color: '#777', textAlign: 'center', marginTop: 50, fontSize: 16 },
  avaliarButton: { marginTop: 15, backgroundColor: '#1e90ff', paddingVertical: 18, paddingHorizontal: 16, borderRadius: 6, alignSelf: 'flex-start' },
  avaliarText: { color: '#fff', fontWeight: '600' },

  // modal
  modalWrap: { flex:1, backgroundColor:'rgba(0,0,0,0.6)', alignItems:'center', justifyContent:'center' },
  modalCard: { width:'88%', backgroundColor:'#111', borderRadius:12, padding:16 },
  modalTitulo: { color:'#fff', fontWeight:'700', fontSize:18, marginBottom:8 },
  modalLabel: { color:'#bbb', marginTop:8, marginBottom:6 },
  modalHint: { color:'#777' },
  input: { backgroundColor:'#1b1b1b', borderRadius:8, paddingHorizontal:12, paddingVertical:10, color:'#fff', borderWidth:1, borderColor:'#2b2b2b' },
  btnBase: { flex:1, paddingVertical:14, borderRadius:8, alignItems:'center', justifyContent:'center' },
  btnText: { color:'#fff', fontWeight:'600' },

  // estrelas
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  starTouch: { paddingHorizontal: 4, paddingVertical: 6 },
  star: { fontSize: 28 },
  starOn: { color: '#ffd54f' },
  starOff: { color: '#555' },
});

export default HistoricoScreen;