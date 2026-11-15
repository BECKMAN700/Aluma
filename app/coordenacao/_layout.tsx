/**
 * Layout do coordenador. No PC, menu lateral fixo; no celular, barra flutuando embaixo.
 * A mesma pilha de telas nos dois: redimensionar a janela não remonta nada.
 */
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BarraDeBaixo, type Destino, MenuLateral } from '@/components/menu-do-sistema';
import { useTelaDeSistema } from '@/constants/auth-theme';
import { useCores } from '@/hooks/use-tema';

// Recarregar a página numa turma ainda deixa o "voltar" levando para a lista.
export const unstable_settings = { initialRouteName: 'index' };

const DESTINOS: Destino[] = [
  { texto: 'Turmas', icone: 'groups', caminho: '/coordenacao', acende: ['/coordenacao', '/coordenacao/turma/'] },
  { texto: 'Professores', icone: 'badge', caminho: '/coordenacao/professores', acende: ['/coordenacao/professores'] },
  { texto: 'Marca', icone: 'palette', caminho: '/coordenacao/marca', acende: ['/coordenacao/marca'] },
];

export default function CoordenacaoLayout() {
  const cores = useCores();
  const pc = useTelaDeSistema();

  return (
    <View style={[styles.tela, { backgroundColor: cores.bg }]}>
      {pc && <MenuLateral destinos={DESTINOS} />}
      <View style={styles.conteudo}>
        <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: cores.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="turma/[id]" />
          <Stack.Screen name="professores" />
          <Stack.Screen name="marca" />
        </Stack>
        {!pc && <BarraDeBaixo destinos={DESTINOS} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, flexDirection: 'row' },
  conteudo: { flex: 1, minWidth: 0 },
});
