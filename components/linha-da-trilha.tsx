/**
 * Um tópico da trilha do aluno: ordem, nome e status. Tocar abre o chat daquele tópico.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontesHorizonte } from '@/constants/theme';
import type { StatusDoTopico } from '@/types/api';
import { type Cores, useEstilos } from '@/hooks/use-tema';

const TEXTO_DO_STATUS: Record<StatusDoTopico, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
  dominado: 'Dominado',
};

export function LinhaDaTrilha({
  ordem,
  nome,
  status,
  aoTocar,
}: {
  ordem: number;
  nome: string;
  status: StatusDoTopico;
  aoTocar: () => void;
}) {
  const styles = useEstilos(criarEstilos);
  const andando = status === 'em_andamento';
  const dominado = status === 'dominado';
  return (
    <Pressable
      style={({ pressed }) => [styles.linha, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={`Tópico ${ordem}: ${nome}. ${TEXTO_DO_STATUS[status]}. Conversar com o tutor.`}
    >
      <View style={[styles.ordem, andando && styles.ordemAndando, dominado && styles.ordemDominado]}>
        <Text style={[styles.ordemTexto, dominado && styles.ordemTextoDominado]}>{ordem}</Text>
      </View>
      <View style={styles.texto}>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={[styles.status, (andando || dominado) && styles.statusAndando]}>{TEXTO_DO_STATUS[status]}</Text>
      </View>
    </Pressable>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  pressionado: { opacity: 0.85 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: cores.hairline,
  },
  ordem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: cores.fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Em andamento: contorno da Luma. Dominado: a "estrela" acende por inteiro.
  ordemAndando: { borderColor: cores.luma },
  ordemDominado: { borderColor: cores.luma, backgroundColor: cores.luma },
  ordemTexto: { fontFamily: FontesHorizonte.display, fontSize: 15, color: cores.text },
  ordemTextoDominado: { color: cores.bg },
  texto: { flex: 1, minWidth: 0, gap: 2 },
  nome: { fontFamily: FontesHorizonte.displayMedio, fontSize: 16, lineHeight: 22, color: cores.text },
  status: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: cores.textMuted },
  statusAndando: { color: cores.luma },
});
