/**
 * Ações do chat de um tópico: pedir um desafio à Luma e, depois de resolver, pedir a avaliação.
 * Quem decide se o tópico foi dominado é o servidor (uma IA juíza lê a conversa).
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FontesHorizonte, Horizonte } from '@/constants/theme';
import { sair } from '@/services/auth';
import { dominarTopico } from '@/services/materias';

export function AcoesDoTopico({
  topicoId,
  desabilitado,
  aoTreinar,
  aoResultado,
}: {
  topicoId: string;
  desabilitado: boolean;
  aoTreinar: () => void;
  /** A frase do servidor ("Parabéns!…" ou "Ainda não deu…"), mostrada como fala da Luma. */
  aoResultado: (mensagem: string) => void;
}) {
  const [avaliando, setAvaliando] = useState(false);

  const terminei = async () => {
    if (avaliando) return;
    setAvaliando(true);
    try {
      const r = await dominarTopico(topicoId);
      if (r.ok) aoResultado(r.dados.mensagem);
      else if (r.status === 401) await sair();
      else aoResultado(r.erro);
    } finally {
      setAvaliando(false);
    }
  };

  const bloqueado = desabilitado || avaliando;
  return (
    <View style={styles.linha}>
      <Pressable
        style={({ pressed }) => [styles.botao, (pressed || bloqueado) && styles.apagado]}
        onPress={aoTreinar}
        disabled={bloqueado}
        accessibilityRole="button"
        accessibilityState={{ disabled: bloqueado }}
      >
        <Text style={styles.texto}>Quero treinar</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.botao, (pressed || bloqueado) && styles.apagado]}
        onPress={terminei}
        disabled={bloqueado}
        accessibilityRole="button"
        accessibilityLabel={avaliando ? 'Avaliando o desafio' : 'Terminei o desafio'}
        accessibilityState={{ disabled: bloqueado, busy: avaliando }}
      >
        <Text style={styles.texto}>{avaliando ? 'Avaliando…' : 'Terminei o desafio'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 8 },
  apagado: { opacity: 0.6 },
  botao: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: Horizonte.luma,
    borderRadius: 22,
    backgroundColor: Horizonte.surface,
  },
  texto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: Horizonte.text },
});
