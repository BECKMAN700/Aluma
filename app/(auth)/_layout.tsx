/**
 * Layout do grupo de autenticação.
 * Telas do grupo: index, entrar e criar-conta.
 */

import { Stack } from 'expo-router';
import { Horizonte } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Sem animação do Stack: quem se move é o horizonte (components/horizonte/ceu.tsx).
        animation: 'none',
        contentStyle: { backgroundColor: Horizonte.bg },
      }}
    />
  );
}
