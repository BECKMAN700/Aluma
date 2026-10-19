/**
 * Layout do grupo de autenticação.
 * Telas do grupo: index, entrar e criar-conta.
 */

import { Stack } from 'expo-router';
import { Night } from '@/constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: Night.sky },
      }}
    />
  );
}
