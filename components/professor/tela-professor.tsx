/**
 * Moldura das telas do professor: coluna clara, sem o céu noturno do aluno, e os avisos de
 * carregando e de erro que toda tela precisa ter.
 */
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useEstilosAuth } from '@/components/auth/styles-auth';
import { Auth } from '@/constants/auth-theme';

export function TelaProfessor({ children }: { children: React.ReactNode }) {
  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.coluna}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function AvisoCarregando({ texto }: { texto: string }) {
  return (
    <View style={styles.carregando} accessibilityLiveRegion="polite">
      <ActivityIndicator color={Auth.link} />
      <Text style={styles.textoSuave}>{texto}</Text>
    </View>
  );
}

export function AvisoErro({ erro, tentarDeNovo }: { erro: string; tentarDeNovo: () => void }) {
  const s = useEstilosAuth();
  return (
    <>
      <View style={s.erroBanner}>
        <Text style={s.erroTexto} accessibilityRole="alert">
          {erro}
        </Text>
      </View>
      <Pressable style={s.link} onPress={tentarDeNovo} accessibilityRole="button">
        <Text style={s.linkTexto}>Tentar de novo</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1 },
  coluna: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 14,
  },
  carregando: { alignItems: 'center', gap: 10, paddingVertical: 24 },
  textoSuave: { fontSize: 14, textAlign: 'center', color: Auth.textoSuave },
});
