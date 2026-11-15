/**
 * Peças das telas "sistema" do coordenador (opção A, 15/11): moldura sem céu, cartão, linha de
 * lista e botão em pílula. Cores do Horizonte até a marca da escola virar tema.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTelaDeSistema } from '@/constants/auth-theme';
import { FontesHorizonte } from '@/constants/theme';
import { type Cores, useEstilos } from '@/hooks/use-tema';

/** Altura da barra de baixo do celular mais a folga: o fim da lista não fica escondido. */
const ESPACO_DA_BARRA = 96;

export function TelaSistema({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  /** Pílula ao lado do título, como "+ Turma". */
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  const styles = useEstilos(criarEstilos);
  const margens = useSafeAreaInsets();
  const pc = useTelaDeSistema();
  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={{
        paddingTop: margens.top + 24,
        paddingBottom: margens.bottom + (pc ? 32 : ESPACO_DA_BARRA),
        paddingHorizontal: pc ? 32 : 16,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.coluna}>
        <View style={styles.topo}>
          <Text style={styles.titulo} accessibilityRole="header">
            {titulo}
          </Text>
          {acao}
        </View>
        {children}
      </View>
    </ScrollView>
  );
}

export function Cartao({ titulo, children }: { titulo?: string; children: React.ReactNode }) {
  const styles = useEstilos(criarEstilos);
  return (
    <View style={styles.cartao}>
      {!!titulo && <Text style={styles.cartaoTitulo}>{titulo}</Text>}
      {children}
    </View>
  );
}

export function Pilula({
  texto,
  rotulo,
  destaque = false,
  ocupado = false,
  aoTocar,
}: {
  texto: string;
  /** Para o leitor de tela, quando o texto sozinho não diz o que faz ("Remover" quem?). */
  rotulo?: string;
  destaque?: boolean;
  ocupado?: boolean;
  aoTocar: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  return (
    <Pressable
      style={({ pressed }) => [styles.pilula, destaque && styles.pilulaDestaque, (pressed || ocupado) && styles.pressionado]}
      onPress={aoTocar}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityLabel={rotulo ?? texto}
      accessibilityState={{ disabled: ocupado, busy: ocupado }}
    >
      <Text style={[styles.pilulaTexto, destaque && styles.pilulaTextoDestaque]}>{texto}</Text>
    </Pressable>
  );
}

export function Linha({
  titulo,
  detalhe,
  aoTocar,
  children,
}: {
  titulo: string;
  detalhe?: string;
  aoTocar?: () => void;
  /** O que fica à direita: estado ou pílulas. */
  children?: React.ReactNode;
}) {
  const styles = useEstilos(criarEstilos);
  const conteudo = (
    <>
      <View style={styles.linhaTexto}>
        <Text style={styles.linhaTitulo} numberOfLines={1}>
          {titulo}
        </Text>
        {!!detalhe && <Text style={styles.linhaDetalhe}>{detalhe}</Text>}
      </View>
      {children}
    </>
  );
  if (!aoTocar) return <View style={styles.linha}>{conteudo}</View>;
  return (
    <Pressable style={({ pressed }) => [styles.linha, pressed && styles.pressionado]} onPress={aoTocar} accessibilityRole="link">
      {conteudo}
    </Pressable>
  );
}

export function Vazio({ texto }: { texto: string }) {
  const styles = useEstilos(criarEstilos);
  return <Text style={styles.vazio}>{texto}</Text>;
}

export const estilosSistema = StyleSheet.create({
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  formulario: { gap: 12, marginTop: 4 },
});

const criarEstilos = (cores: Cores) => StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.bg },
  coluna: { width: '100%', maxWidth: 960, alignSelf: 'center', gap: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titulo: { flexShrink: 1, fontFamily: FontesHorizonte.display, fontSize: 26, lineHeight: 32, color: cores.text },
  cartao: {
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cores.hairline,
    backgroundColor: cores.surface,
  },
  cartaoTitulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 15, lineHeight: 20, color: cores.text },
  pilula: {
    minHeight: 36,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.fieldBorder,
  },
  pilulaDestaque: { backgroundColor: cores.action, borderColor: cores.action },
  pilulaTexto: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 14, color: cores.text },
  pilulaTextoDestaque: { color: cores.onAction },
  pressionado: { opacity: 0.7 },
  linha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: cores.hairline,
  },
  linhaTexto: { flex: 1, minWidth: 160 },
  linhaTitulo: { fontFamily: FontesHorizonte.corpoMedio, fontSize: 15, lineHeight: 20, color: cores.text },
  linhaDetalhe: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: cores.textMuted },
  vazio: { paddingVertical: 8, fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.textMuted },
});
