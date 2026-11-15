/**
 * Telas do aluno: início (chat limpo), trilha e projetos. Cada uma vem dentro da CascaDoAluno,
 * que traz a gaveta; aqui é só a pilha, sem barra de abas.
 */
import { Stack } from 'expo-router';

import { useCores } from '@/hooks/use-tema';

export default function AlunoLayout() {
  const cores = useCores();
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: cores.bg } }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="trilha" />
      <Stack.Screen name="projeto/[id]" />
    </Stack>
  );
}
