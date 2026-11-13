/**
 * Um tópico da trilha do aluno: ordem, nome e status. Tocar abre o chat daquele tópico.
 */
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontesHorizonte, Horizonte } from '@/constants/theme';
import type { StatusDoTopico } from '@/types/api';

const TEXTO_DO_STATUS: Record<StatusDoTopico, string> = {
  nao_iniciado: 'Não iniciado',
  em_andamento: 'Em andamento',
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
  const andando = status === 'em_andamento';
  return (
    <Pressable
      style={({ pressed }) => [styles.linha, pressed && styles.pressionado]}
      onPress={aoTocar}
      accessibilityRole="button"
      accessibilityLabel={`Tópico ${ordem}: ${nome}. ${TEXTO_DO_STATUS[status]}. Conversar com o tutor.`}
    >
      <View style={[styles.ordem, andando && styles.ordemAndando]}>
        <Text style={[styles.ordemTexto, andando && styles.ordemTextoAndando]}>{ordem}</Text>
      </View>
      <View style={styles.texto}>
        <Text style={styles.nome}>{nome}</Text>
        <Text style={[styles.status, andando && styles.statusAndando]}>{TEXTO_DO_STATUS[status]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressionado: { opacity: 0.85 },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    borderBottomWidth: 1,
    borderBottomColor: Horizonte.hairline,
  },
  ordem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Horizonte.fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordemAndando: { borderColor: Horizonte.luma, backgroundColor: Horizonte.luma },
  ordemTexto: { fontFamily: FontesHorizonte.display, fontSize: 15, color: Horizonte.text },
  ordemTextoAndando: { color: Horizonte.bg },
  texto: { flex: 1, minWidth: 0, gap: 2 },
  nome: { fontFamily: FontesHorizonte.displayMedio, fontSize: 16, lineHeight: 22, color: Horizonte.text },
  status: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: Horizonte.textMuted },
  statusAndando: { color: Horizonte.luma },
});
