import { useWindowDimensions } from 'react-native';

export const LARGURA_DIVIDIDA = 840;

export interface CoresAuth {
  fundo: string;
  cartao: string;
  borda: string;
  texto: string;
  textoSuave: string;
  placeholder: string;
  link: string;
  botao: string;
  botaoTexto: string;
  erro: string;
  erroFundo: string;
  erroBorda: string;
}

export const Auth: CoresAuth = {
  fundo: '#FFFFFF',
  cartao: '#F6F3EB',
  borda: '#E3DED2',
  texto: '#1F2937',
  textoSuave: '#4B5563',
  placeholder: '#9CA3AF',
  link: '#1E3A8A',
  botao: '#1E3A8A',
  botaoTexto: '#FFFFFF',
  erro: '#B42318',
  erroFundo: '#FEF3F2',
  erroBorda: '#FDA29B',
};

export const AuthEscuro: CoresAuth = {
  fundo: '#000208',
  cartao: 'rgba(5, 10, 22, 0.9)',
  borda: 'rgba(56, 189, 248, 0.3)',
  texto: '#F1F5F9',
  textoSuave: '#CBD5E1',
  placeholder: '#7C89A6',
  link: '#38BDF8',
  botao: '#F5A623',
  botaoTexto: '#000208',
  erro: '#FCA5A5',
  erroFundo: 'rgba(127, 29, 29, 0.25)',
  erroBorda: 'rgba(252, 165, 165, 0.5)',
};

export function useTelaDividida(): boolean {
  const { width } = useWindowDimensions();
  return width >= LARGURA_DIVIDIDA;
}

export function useCoresAuth(): CoresAuth {
  return useTelaDividida() ? Auth : AuthEscuro;
}
