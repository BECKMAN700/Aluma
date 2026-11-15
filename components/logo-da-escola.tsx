/**
 * A logo da escola no formato que o coordenador escolheu. Sem imagem enviada, mostra as iniciais
 * do sistema sobre a cor principal, para a tela nunca ficar com um buraco.
 */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { FormatoDaLogo } from '@/constants/marca';
import { textoSobre } from '@/constants/marca';
import { FontesHorizonte } from '@/constants/theme';
import { type Cores, useEstilos } from '@/hooks/use-tema';

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  return (partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] ?? '?').slice(0, 2)).toUpperCase();
}

export function LogoDaEscola({
  endereco,
  formato,
  cor,
  nome,
  tamanho,
  corSemFundo,
}: {
  /** Endereço da imagem; null = ainda não enviou. */
  endereco: string | null;
  formato: FormatoDaLogo;
  cor: string;
  /** Nome do sistema: dá as iniciais quando não há imagem e o texto para o leitor de tela. */
  nome: string;
  tamanho: number;
  /** Cor das iniciais no formato sem fundo (depende do que está atrás). */
  corSemFundo?: string;
}) {
  const styles = useEstilos(criarEstilos);
  const raio = formato === 'redondo' ? tamanho / 2 : formato === 'quadrado' ? Math.round(tamanho * 0.22) : 0;
  const caixa = { width: tamanho, height: tamanho, borderRadius: raio };

  if (endereco) {
    return (
      <Image
        source={{ uri: endereco }}
        style={[caixa, formato !== 'livre' && styles.cortada]}
        resizeMode={formato === 'livre' ? 'contain' : 'cover'}
        accessibilityLabel={`Logo de ${nome}`}
      />
    );
  }
  const semFundo = formato === 'livre';
  return (
    <View style={[caixa, styles.centro, !semFundo && { backgroundColor: cor }]} accessibilityLabel={`Logo de ${nome}`}>
      <Text style={[styles.iniciais, { fontSize: Math.round(tamanho * 0.38), color: semFundo ? corSemFundo ?? cor : textoSobre(cor) }]}>
        {iniciais(nome)}
      </Text>
    </View>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  cortada: { overflow: 'hidden' },
  centro: { alignItems: 'center', justifyContent: 'center' },
  iniciais: { fontFamily: FontesHorizonte.display },
});
