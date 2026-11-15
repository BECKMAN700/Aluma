/**
 * Peças das telas "sistema" do coordenador (opção A, 15/11): moldura sem céu, cartão, linha de
 * lista e botão em pílula. Cores do Horizonte até a marca da escola virar tema.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { ESPACO_DA_BARRA } from '@/components/menu-do-sistema';
import { useTelaDeSistema } from '@/constants/auth-theme';
import { FontesHorizonte } from '@/constants/theme';
import { type Cores, useCores, useEstilos } from '@/hooks/use-tema';


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

/**
 * Quantos dominaram, estão tentando ou não começaram, numa barra e numa legenda com ícones
 * (aprovada em 15/11): cada estado se lê pela forma, não só pela cor.
 */
export function BarraDeProgresso({ dominado, emAndamento, naoIniciado }: { dominado: number; emAndamento: number; naoIniciado: number }) {
  const styles = useEstilos(criarEstilos);
  const total = dominado + emAndamento + naoIniciado;
  return (
    <View style={styles.progresso} accessible accessibilityLabel={`${dominado} dominaram, ${emAndamento} em andamento, ${naoIniciado} não começaram`}>
      <View style={styles.barraFundo}>
        {total > 0 && (
          <>
            <View style={[styles.barraParte, { flex: dominado, backgroundColor: COR_DOMINADO }]} />
            <View style={[styles.barraParte, { flex: emAndamento, backgroundColor: COR_ANDAMENTO }]} />
            <View style={{ flex: naoIniciado }} />
          </>
        )}
      </View>
      <View style={styles.legenda}>
        <ItemDaLegenda icone="dominado" texto={`${dominado} dominaram`} />
        <ItemDaLegenda icone="andamento" texto={`${emAndamento} em andamento`} />
        <ItemDaLegenda icone="nao" texto={`${naoIniciado} não começaram`} />
      </View>
    </View>
  );
}

const COR_DOMINADO = '#2fb871';
const COR_ANDAMENTO = '#f2b34a';

function ItemDaLegenda({ icone, texto }: { icone: 'dominado' | 'andamento' | 'nao'; texto: string }) {
  const styles = useEstilos(criarEstilos);
  const cores = useCores();
  return (
    <View style={styles.legendaItem}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
        {icone === 'dominado' && (
          <>
            <Circle cx={12} cy={12} r={10} fill={COR_DOMINADO} />
            <Path d="M7.5 12.5l3 3 6-6.5" stroke="#06210f" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {icone === 'andamento' && (
          <>
            <Circle cx={12} cy={12} r={9} stroke={COR_ANDAMENTO} strokeWidth={2.4} />
            <Path d="M12 3a9 9 0 010 18z" fill={COR_ANDAMENTO} />
          </>
        )}
        {icone === 'nao' && <Circle cx={12} cy={12} r={9} stroke={cores.textMuted} strokeWidth={2.4} strokeDasharray="3.5 3" />}
      </Svg>
      <Text style={styles.legendaTexto}>{texto}</Text>
    </View>
  );
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
  progresso: { gap: 8 },
  barraFundo: { flexDirection: 'row', height: 10, borderRadius: 999, overflow: 'hidden', backgroundColor: cores.hairline },
  barraParte: { height: '100%' },
  legenda: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaTexto: { fontFamily: FontesHorizonte.corpo, fontSize: 13, color: cores.textMuted },
  vazio: { paddingVertical: 8, fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.textMuted },
});
