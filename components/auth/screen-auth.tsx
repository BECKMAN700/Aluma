/**
 * Moldura compartilhada das telas de autenticação.
 */

import React, { useMemo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useCoresAuth, useTelaDividida } from '@/constants/auth-theme';
import { Night } from '@/constants/theme';

// Poucas e estáticas: é fundo, não pode competir com o texto.
const ESTRELAS = [
  { top: '6%', left: '14%', size: 2, opacity: 0.8, color: '#FFFFFF' },
  { top: '12%', left: '62%', size: 2.6, opacity: 0.9, color: '#BAE6FD' },
  { top: '24%', left: '88%', size: 1.4, opacity: 0.5, color: '#E0E7FF' },
  { top: '34%', left: '8%', size: 1.6, opacity: 0.6, color: '#FFFFFF' },
  { top: '46%', left: '74%', size: 2, opacity: 0.7, color: '#FFFFFF' },
  { top: '58%', left: '20%', size: 2.2, opacity: 0.8, color: '#BAE6FD' },
  { top: '70%', left: '90%', size: 1.6, opacity: 0.6, color: '#FED7AA' },
  { top: '82%', left: '48%', size: 2, opacity: 0.7, color: '#FFFFFF' },
  { top: '92%', left: '12%', size: 1.4, opacity: 0.5, color: '#FEF08A' },
  { top: '90%', left: '78%', size: 2.2, opacity: 0.8, color: '#FFFFFF' },
] as const;

/** Fundo noturno: círculos de luz + estrelas. Preenche o container pai (position: absolute). */
function FundoNoturno() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={estaticos.orbeTopo} />
      <View style={estaticos.orbeBase} />
      {ESTRELAS.map((e, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: e.top,
            left: e.left,
            width: e.size,
            height: e.size,
            borderRadius: e.size / 2,
            backgroundColor: e.color,
            opacity: e.opacity,
          }}
        />
      ))}
    </View>
  );
}

function Marca({ tamanho }: { tamanho: number }) {
  return (
    <View style={estaticos.marca}>
      <Image
        source={require('../../assets/images/aluma_logo.jpg')}
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          borderWidth: 2,
          borderColor: '#38BDF8',
        }}
        resizeMode="cover"
        accessibilityLabel="Logo do Aluma"
      />
      <Text style={estaticos.marcaTexto}>
        ALUMA
      </Text>
    </View>
  );
}

function PainelNoturno() {
  return (
    <View style={estaticos.painel}>
      <FundoNoturno />
      <Marca tamanho={48} />
      <View style={estaticos.painelMeio}>
        <Text style={estaticos.painelEyebrow}>BEM-VINDO</Text>
        <Text style={estaticos.painelTitulo}>Aprender é descobrir a própria luz.</Text>
        <Text style={estaticos.painelTexto}>
          Acreditamos que aprender vai muito além de encontrar respostas: é descobrir, questionar e construir o próprio conhecimento.
        </Text>
      </View>
      <Text style={estaticos.painelRodape}>Aluma • Sistema educacional</Text>
    </View>
  );
}

interface TelaAuthProps {
  titulo: string;
  subtitulo?: string;
  /** Se passado, mostra "Voltar para a página inicial" no topo. */
  voltar?: () => void;
  children: React.ReactNode;
}

export function TelaAuth({ titulo, subtitulo, voltar, children }: TelaAuthProps) {
  const dividida = useTelaDividida();
  const c = useCoresAuth();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          flex: 1,
          backgroundColor: dividida ? c.fundo : Night.sky,
          overflow: 'hidden',
          flexDirection: dividida ? 'row' : 'column',
        },
        conteudo: { flexGrow: 1, justifyContent: 'center' },
        marcaCelular: { marginBottom: 10 },
        coluna: {
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
          paddingHorizontal: 24,
          paddingVertical: 28,
          gap: 10,
        },
        cabecalhoTexto: { gap: 4 },
        voltar: { alignSelf: 'center', minHeight: 36, justifyContent: 'center', alignItems: 'center' },
        voltarTexto: { fontSize: 14, textAlign: 'center', color: c.textoSuave },
        titulo: { fontSize: 28, fontWeight: '800', textAlign: 'center', color: c.texto },
        subtitulo: { fontSize: 15, lineHeight: 22, textAlign: 'center', color: c.textoSuave },
      }),
    [c, dividida],
  );

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {dividida ? <PainelNoturno /> : <FundoNoturno />}

      <ScrollView
        style={estaticos.scroll}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coluna}>
          {!dividida && (
            <View style={styles.marcaCelular}>
              <Marca tamanho={44} />
            </View>
          )}
          <View style={styles.cabecalhoTexto}>
            <Text style={styles.titulo} accessibilityRole="header">
              {titulo}
            </Text>
            {!!subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
          </View>
          {children}
          {!!voltar && (
            <Pressable
              style={styles.voltar}
              onPress={voltar}
              accessibilityRole="button"
              accessibilityLabel="Voltar para a página inicial"
            >
              <Text style={styles.voltarTexto}>‹  Voltar para a página inicial</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estaticos = StyleSheet.create({
  scroll: { flex: 1 },
  orbeTopo: {
    position: 'absolute',
    top: -140,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  orbeBase: {
    position: 'absolute',
    bottom: -150,
    left: -110,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  painel: {
    flex: 1,
    backgroundColor: Night.sky,
    padding: 48,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  painelMeio: { gap: 14, maxWidth: 460 },
  painelEyebrow: { fontSize: 12, letterSpacing: 3, fontWeight: '700', color: '#BAE6FD' },
  painelTitulo: { fontSize: 36, lineHeight: 44, fontWeight: '800', color: '#FFFFFF' },
  painelTexto: { fontSize: 15, lineHeight: 24, color: '#CBD5E1' },
  painelRodape: { fontSize: 12, color: '#94A3B8' },
  marca: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  marcaTexto: { fontSize: 20, fontWeight: '900', letterSpacing: 1, color: '#FFFFFF' },
  marcaAcento: { color: '#38BDF8' },
});
