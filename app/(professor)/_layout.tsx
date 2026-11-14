/**
 * Layout do grupo do professor. Sem animação do Stack: quem se move é o horizonte
 * (components/horizonte/ceu.tsx). No PC, o menu lateral fica fixo ao lado das telas.
 */
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { MenuDoProfessor } from '@/components/menu-do-professor';
import { useTelaDeSistema } from '@/constants/auth-theme';
import { Horizonte } from '@/constants/theme';

// Recarregar a página numa turma ainda deixa o "voltar" levando para a lista.
export const unstable_settings = { initialRouteName: 'turmas' };

export default function ProfessorLayout() {
  const sistema = useTelaDeSistema();

  // Mesma árvore com e sem menu: redimensionar a janela não remonta a pilha de telas.
  return (
    <View style={styles.tela}>
      {sistema && <MenuDoProfessor />}
      <View style={styles.conteudo}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
            contentStyle: { backgroundColor: Horizonte.bg },
          }}
        >
          <Stack.Screen name="turmas" />
          <Stack.Screen name="nova-turma" />
          <Stack.Screen name="turma/[id]" />
          <Stack.Screen name="materia/[id]" />
          <Stack.Screen name="painel/[id]" />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, flexDirection: 'row', backgroundColor: Horizonte.bg },
  conteudo: { flex: 1, minWidth: 0 },
});
