/**
 * Layout do coordenador. No PC, menu lateral fixo; no celular, barra flutuando embaixo.
 * A mesma pilha de telas nos dois: redimensionar a janela não remonta nada.
 */
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BarraDeBaixoDoCoordenador, MenuLateralDoCoordenador } from '@/components/menu-do-coordenador';
import { useTelaDeSistema } from '@/constants/auth-theme';
import { Horizonte } from '@/constants/theme';

// Recarregar a página numa turma ainda deixa o "voltar" levando para a lista.
export const unstable_settings = { initialRouteName: 'index' };

export default function CoordenacaoLayout() {
  const pc = useTelaDeSistema();

  return (
    <View style={styles.tela}>
      {pc && <MenuLateralDoCoordenador />}
      <View style={styles.conteudo}>
        <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: Horizonte.bg } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="turma/[id]" />
          <Stack.Screen name="professores" />
          <Stack.Screen name="marca" />
        </Stack>
        {!pc && <BarraDeBaixoDoCoordenador />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, flexDirection: 'row', backgroundColor: Horizonte.bg },
  conteudo: { flex: 1, minWidth: 0 },
});
