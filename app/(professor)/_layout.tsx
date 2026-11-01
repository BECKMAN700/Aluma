/**
 * Layout do grupo do professor: visual claro e sóbrio, diferente do céu noturno do aluno.
 */
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Auth, CoresAuthContext } from '@/constants/auth-theme';

// Recarregar a página numa turma ainda deixa o "voltar" levando para a lista.
export const unstable_settings = { initialRouteName: 'turmas' };

export default function ProfessorLayout() {
  return (
    <CoresAuthContext.Provider value={Auth}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Auth.fundo },
          headerTintColor: Auth.link,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Auth.fundo },
        }}
      >
        <Stack.Screen name="turmas" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="nova-turma" options={{ title: 'Criar turma' }} />
        <Stack.Screen name="turma/[id]" options={{ title: 'Turma' }} />
      </Stack>
    </CoresAuthContext.Provider>
  );
}
