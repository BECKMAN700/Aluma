import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/** uri para mostrar na tela; base64 (JPEG, sem o prefixo "data:") para a API. */
export type Foto = { uri: string; base64: string };

// Foto de celular tem 3 a 5 MB; reduzida a 1500 px fica com ~300 KB e a IA lê igual
// (a Anthropic reduz para ~1568 px de qualquer jeito). Pesa na internet fraca do aluno.
const LADO_MAX = 1500;

/** null = o aluno desistiu. Lança 'sem-permissao' se a câmera foi negada. */
export async function escolherFoto(origem: 'camera' | 'galeria'): Promise<Foto | null> {
  if (origem === 'camera' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
    throw new Error('sem-permissao');
  }
  const abrir = origem === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
  const escolha = await abrir({ mediaTypes: ['images'], quality: 1 });
  if (escolha.canceled) return null;

  const { uri, width, height } = escolha.assets[0];
  const contexto = ImageManipulator.manipulate(uri);
  if (Math.max(width, height) > LADO_MAX) {
    contexto.resize(width >= height ? { width: LADO_MAX } : { height: LADO_MAX });
  }
  const pronta = await (await contexto.renderAsync()).saveAsync({ base64: true, compress: 0.7, format: SaveFormat.JPEG });
  if (!pronta.base64) throw new Error('sem-base64');
  return { uri: pronta.uri, base64: pronta.base64 };
}
