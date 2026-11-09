import { useWindowDimensions } from 'react-native';

export const LARGURA_DIVIDIDA = 840;

export function useTelaDividida(): boolean {
  const { width } = useWindowDimensions();
  return width >= LARGURA_DIVIDIDA;
}
