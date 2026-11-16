import { useWindowDimensions } from 'react-native';

export const LARGURA_DIVIDIDA = 840;

export function useTelaDividida(): boolean {
  const { width } = useWindowDimensions();
  return width >= LARGURA_DIVIDIDA;
}

/** A partir daqui o professor vê o app como sistema: menu lateral e visão geral em cartões. */
export const LARGURA_SISTEMA = 1024;

export function useTelaDeSistema(): boolean {
  const { width } = useWindowDimensions();
  return width >= LARGURA_SISTEMA;
}
