/**
 * Layout do grupo do professor. Sem animação do Stack: quem se move é o horizonte
 * (components/horizonte/ceu.tsx).
 */
import { Stack } from 'expo-router';

import { Horizonte } from '@/constants/theme';

// Recarregar a página numa turma ainda deixa o "voltar" levando para a lista.
export const unstable_settings = { initialRouteName: 'turmas' };

export default function ProfessorLayout() {
  return (
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
    </Stack>
  );
}
