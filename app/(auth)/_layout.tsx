/**
 * Layout do grupo de autenticação.
 * Telas do grupo: index, entrar e criar-conta.
 */

import { Stack } from 'expo-router';
import { useCores } from '@/hooks/use-tema';

export default function AuthLayout() {
  const cores = useCores();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Sem animação do Stack: quem se move é o horizonte (components/horizonte/ceu.tsx).
        animation: 'none',
        contentStyle: { backgroundColor: cores.bg },
      }}
    />
  );
}
