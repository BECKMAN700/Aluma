/**
 * Cartão de um tópico no painel: quantos dominaram, tentam ou não começaram, e as dúvidas
 * resumidas pela IA. Usado na aba Painel da turma do professor.
 */
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BarraDeProgresso } from '@/components/sistema';
import { FontesHorizonte } from '@/constants/theme';
import { sair } from '@/services/auth';
import { resumirDuvidas } from '@/services/painel';
import type { TopicoNoPainel } from '@/types/api';
import { type Cores, useEstilos } from '@/hooks/use-tema';

export function CartaoDoTopico({ topico }: { topico: TopicoNoPainel }) {
  const styles = useEstilos(criarEstilos);
  const [resumo, setResumo] = useState(topico.resumo);
  const [resumindo, setResumindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resumir = async () => {
    if (resumindo) return;
    setResumindo(true);
    setErro(null);
    try {
      const r = await resumirDuvidas(topico.id);
      if (r.ok) setResumo(r.dados.resumo);
      else if (r.status === 401) await sair();
      else setErro(r.erro);
    } finally {
      setResumindo(false);
    }
  };

  const duvidas = (resumo ?? '')
    .split('\n')
    .map((linha) => linha.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);

  return (
    <View style={styles.cartao}>
      <Text style={styles.materia}>{topico.materia}</Text>
      <Text style={styles.nome} accessibilityRole="header">
        {topico.nome}
      </Text>

      <BarraDeProgresso dominado={topico.dominado} emAndamento={topico.em_andamento} naoIniciado={topico.nao_iniciado} />

      {duvidas.length > 0 && (
        <View style={styles.duvidas}>
          <Text style={styles.duvidasTitulo}>Dúvidas mais comuns</Text>
          {duvidas.map((duvida) => (
            <Text key={duvida} style={styles.duvida}>
              • {duvida}
            </Text>
          ))}
        </View>
      )}
      {!!erro && (
        <Text style={styles.erro} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {erro}
        </Text>
      )}
      <Pressable
        style={({ pressed }) => [styles.botao, (pressed || resumindo) && styles.apagado]}
        onPress={resumir}
        disabled={resumindo}
        accessibilityRole="button"
        accessibilityLabel={`${resumo ? 'Atualizar' : 'Resumir'} as dúvidas do tópico ${topico.nome}`}
        accessibilityState={{ disabled: resumindo, busy: resumindo }}
      >
        <Text style={styles.botaoTexto}>
          {resumindo ? 'Resumindo…' : resumo ? 'Atualizar resumo' : 'Resumir dúvidas com a IA'}
        </Text>
      </Pressable>
    </View>
  );
}

const criarEstilos = (cores: Cores) => StyleSheet.create({
  apagado: { opacity: 0.6 },
  cartao: {
    gap: 8,
    marginBottom: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: cores.hairline,
    borderRadius: 20,
    backgroundColor: cores.surface,
  },
  materia: { fontFamily: FontesHorizonte.corpoForte, fontSize: 13, lineHeight: 18, color: cores.textMuted },
  nome: { fontFamily: FontesHorizonte.display, fontSize: 18, lineHeight: 24, color: cores.text },
  duvidas: { gap: 4, marginTop: 4 },
  duvidasTitulo: { fontFamily: FontesHorizonte.corpoForte, fontSize: 14, lineHeight: 20, color: cores.text },
  duvida: { fontFamily: FontesHorizonte.corpo, fontSize: 14, lineHeight: 20, color: cores.text },
  erro: { fontFamily: FontesHorizonte.corpo, fontSize: 13, lineHeight: 18, color: cores.error },
  botao: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: cores.text,
    borderRadius: 22,
  },
  botaoTexto: { fontFamily: FontesHorizonte.displayMedio, fontSize: 14, lineHeight: 20, color: cores.text },
});
