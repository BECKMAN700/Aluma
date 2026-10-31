/**
 * Estilos compartilhados de botões, links e avisos de erro das telas de autenticação.
 */

import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useCoresAuth } from '@/constants/auth-theme';

export function useEstilosAuth() {
  const c = useCoresAuth();
  return useMemo(
    () =>
      StyleSheet.create({
        botao: {
          width: '100%',
          minHeight: 48,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c.botao,
        },
        botaoDesativado: { opacity: 0.5 },
        botaoTexto: { color: c.botaoTexto, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
        erroBanner: {
          width: '100%',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: c.erroBorda,
          backgroundColor: c.erroFundo,
        },
        erroTexto: { flexShrink: 1, minWidth: 0, fontSize: 14, color: c.erro },
        link: { minHeight: 32, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
        linkTexto: { flexShrink: 1, fontSize: 14, fontWeight: '600', textAlign: 'center', color: c.link },
      }),
    [c],
  );
}
