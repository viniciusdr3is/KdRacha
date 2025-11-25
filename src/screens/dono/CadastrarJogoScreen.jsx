import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { cadastrarJogo, storage } from "../../firebase/config";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CadastrarJogoScreen = () => {
  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [vagas, setVagas] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("");
  const [imagem, setImagem] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

const selecionarImagem = async () => {
    try {
      console.log("Iniciando seleção de imagem...");

     
      const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Status da permissão:", permissao.status); 

      if (permissao.granted === false) {
        Alert.alert(
          "Permissão necessária",
          "É preciso permitir o acesso à galeria para selecionar uma imagem."
        );
        return;
      }

      console.log("Abrindo galeria..."); 
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      console.log("Resultado da galeria:", resultado);

      if (!resultado.canceled) {
        setImagem(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error("Erro ao abrir galeria:", error); 
      Alert.alert("Erro", "Não foi possível abrir a galeria.");
    }
  };

  const handleCadastrar = async () => {
    if (!nome || !local || !data || !horario || !vagas || !valor || !tipo) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    setLoading(true);

    try {
      let imageUrl = "";

      if (imagem) {
        const uriToBlob = (uri) => {
          return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
              // Retorna o blob
              resolve(xhr.response);
            };
            xhr.onerror = function (e) {
              console.log(e);
              reject(new TypeError("Falha na conversão da imagem"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
          });
        };

        console.log("Convertendo imagem para Blob...");
        const blob = await uriToBlob(imagem);
        console.log("Blob criado com sucesso. Tamanho:", blob.size);

        const nomeArquivo = `jogo_${Date.now()}.jpg`;
        const imageRef = ref(storage, `games/${nomeArquivo}`);

        const metadata = { contentType: 'image/jpeg' };

        console.log("Iniciando upload...");
        await uploadBytes(imageRef, blob, metadata);
        console.log("Upload concluído!");

        imageUrl = await getDownloadURL(imageRef);
        
        // blob.close(); 
      }

      const partesData = data.split("/");
      const partesHorario = horario.split(":");

      const [dia, mes, ano] = partesData.map(Number);
      const [hora, minuto] = partesHorario.map(Number);
      const dataHoraJogo = new Date(ano, mes - 1, dia, hora, minuto);

      const novoJogo = {
        nome,
        local,
        telefone,
        data,
        horario,
        vagas: parseInt(vagas, 10),
        valor: valor.replace(",", "."),
        tipo,
        jogadores: 0,
        imagem: imageUrl, 
        dataHoraJogo,
        observacao,
      };

      await cadastrarJogo(novoJogo);
      Alert.alert("Sucesso", "Jogo cadastrado com sucesso!");
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao cadastrar jogo:", error);
      Alert.alert(
        "Erro",
        error.message || "Não foi possível cadastrar o jogo."
      );
    } finally {
      setLoading(false); 
    }
  };
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <Text style={styles.titulo}>Cadastrar Novo Jogo</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome do Jogo"
        placeholderTextColor="#888"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Local"
        placeholderTextColor="#888"
        value={local}
        onChangeText={setLocal}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefone de Contato"
        placeholderTextColor="#888"
        value={telefone}
        onChangeText={setTelefone}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Data (DD/MM/AAAA)"
        placeholderTextColor="#888"
        value={data}
        onChangeText={setData}
      />
      <TextInput
        style={styles.input}
        placeholder="Horário (HH:MM)"
        placeholderTextColor="#888"
        value={horario}
        onChangeText={setHorario}
      />
      <TextInput
        style={styles.input}
        placeholder="Total de Vagas"
        placeholderTextColor="#888"
        value={vagas}
        onChangeText={setVagas}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Valor por Jogador (ex: 10,00)"
        placeholderTextColor="#888"
        value={valor}
        onChangeText={setValor}
        keyboardType="decimal-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Tipo (ex: Society)"
        placeholderTextColor="#888"
        value={tipo}
        onChangeText={setTipo}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Observações (opcional)"
        placeholderTextColor="#888"
        value={observacao}
        onChangeText={setObservacao}
        multiline={true}
        numberOfLines={3}
      />
      {/* btn para selecionar a imagem */}
      <TouchableOpacity style={styles.botaoImagem} onPress={selecionarImagem}>
        <Text style={styles.botaoTexto}>Selecionar Imagem</Text>
      </TouchableOpacity>
      {imagem && <Image source={{ uri: imagem }} style={styles.previewImagem} />}
      <TouchableOpacity style={styles.botao} onPress={handleCadastrar}>
        <Text style={styles.botaoTexto}>Cadastrar Jogo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  titulo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 20,
  },
  input: {
    backgroundColor: "#1C1C1E",
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  botao: {
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botaoImagem: {
    backgroundColor: '#06ed25ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImagem: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
    resizeMode: 'cover',
  },
});

export default CadastrarJogoScreen;
